import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Order, OrderStatus } from '../models/Order.js';
import { Retailer } from '../models/Retailer.js';
import { Product } from '../models/Product.js';
import { Scheme } from '../models/Scheme.js';
import { RetailerPrice } from '../models/RetailerPrice.js';
import { calculateOrderFinancials } from '../services/schemeEngine.js';

export const getDeskOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, search, page = '1', limit = '20' } = req.query;

  const query: any = {};

  if (status && status !== 'ALL') {
    query.status = status;
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const limitNum = parseInt(String(limit), 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  // Search filter by order number or retailer name
  if (search) {
    const searchRegex = new RegExp(String(search).trim(), 'i');
    const matchingRetailers = await Retailer.find({
      $or: [{ storeName: searchRegex }, { ownerName: searchRegex }],
    }).select('_id');

    query.$or = [
      { orderNumber: searchRegex },
      { retailerId: { $in: matchingRetailers.map((r) => r._id) } },
    ];
  }

  const [orders, totalCount, submittedCount, creditHoldCount, approvedCount, exportedCount] = await Promise.all([
    Order.find(query)
      .populate('retailerId', 'storeName ownerName phone creditLimit outstandingBalance creditStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query),
    Order.countDocuments({ status: 'SUBMITTED' }),
    Order.countDocuments({ status: 'CREDIT_HOLD' }),
    Order.countDocuments({ status: 'APPROVED' }),
    Order.countDocuments({ 'tallyExport.isExported': true }),
  ]);

  res.json({
    success: true,
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
    },
    metrics: {
      totalOrders: totalCount,
      submittedCount,
      creditHoldCount,
      approvedCount,
      exportedCount,
    },
  });
};

export const getDeskOrderDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('retailerId');

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  res.json({
    success: true,
    order,
  });
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses: OrderStatus[] = ['APPROVED', 'REJECTED', 'CREDIT_HOLD', 'UNDER_REVIEW'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid target order status.' });
    return;
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  const prevStatus = order.status;

  // 1. Approving Order -> Deduct Stock permanently & adjust Retailer Outstanding Balance
  if (status === 'APPROVED' && prevStatus !== 'APPROVED') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          stockCasesAvailable: -item.orderedCases,
          stockCasesReserved: -item.orderedCases,
        },
      });
    }

    await Retailer.findByIdAndUpdate(order.retailerId, {
      $inc: { outstandingBalance: order.finalPayableAmount },
    });
  }

  // 2. Rejecting Order -> Release Stock Reservation
  if (status === 'REJECTED' && prevStatus !== 'REJECTED' && prevStatus !== 'APPROVED') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockCasesReserved: -item.orderedCases },
      });
    }
  }

  order.status = status;
  if (note) {
    order.creditCheck.reviewNote = note;
  }

  order.staffCorrections.push({
    field: 'status',
    originalValue: prevStatus,
    correctedValue: status,
    correctedBy: req.user?._id as any,
    timestamp: new Date(),
  });

  await order.save();

  res.json({
    success: true,
    message: `Order ${order.orderNumber} status changed to ${status}.`,
    order,
  });
};

export const updateOrderLines = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { items } = req.body; // array of { productId, orderedCases }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  if (order.status === 'APPROVED' || order.status === 'SYNCED_TO_TALLY') {
    res.status(400).json({ success: false, message: 'Cannot edit an approved or exported order.' });
    return;
  }

  // 1. Release previous reservations
  for (const oldItem of order.items) {
    await Product.findByIdAndUpdate(oldItem.productId, {
      $inc: { stockCasesReserved: -oldItem.orderedCases },
    });
  }

  // 2. Re-calculate with new lines
  const productIds = items.map((i: any) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map();
  products.forEach((p) => productMap.set(p._id.toString(), p));

  const now = new Date();
  const schemes = await Scheme.find({
    primaryProductId: { $in: productIds },
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
  const schemeMap = new Map();
  schemes.forEach((s) => schemeMap.set(s.primaryProductId.toString(), s));

  const customPrices = await RetailerPrice.find({
    retailerId: order.retailerId,
    productId: { $in: productIds },
  });
  const customPriceMap = new Map();
  customPrices.forEach((cp) => customPriceMap.set(cp.productId.toString(), cp.customDealerPricePerPack));

  const calcInput = items.map((i: any) => ({
    product: productMap.get(i.productId)!,
    orderedCases: i.orderedCases,
    activeScheme: schemeMap.get(i.productId),
    customDealerPricePerPack: customPriceMap.get(i.productId),
  }));

  const financials = calculateOrderFinancials(calcInput);

  // 3. Apply new reservations
  for (const newItem of items) {
    await Product.findByIdAndUpdate(newItem.productId, {
      $inc: { stockCasesReserved: newItem.orderedCases },
    });
  }

  order.items = financials.items;
  order.subtotal = financials.subtotal;
  order.totalDiscount = financials.totalDiscount;
  order.totalCgst = financials.totalCgst;
  order.totalSgst = financials.totalSgst;
  order.totalTax = financials.totalTax;
  order.finalPayableAmount = financials.finalPayableAmount;

  order.staffCorrections.push({
    field: 'items',
    originalValue: 'Line items edited by Order Desk',
    correctedValue: items,
    correctedBy: req.user?._id as any,
    timestamp: new Date(),
  });

  await order.save();

  res.json({
    success: true,
    message: 'Order lines recalculated and updated successfully.',
    order,
  });
};

export const exportTallyCsv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { orderIds } = req.query;

  const query: any = { status: { $in: ['APPROVED', 'SUBMITTED'] } };

  if (orderIds) {
    const ids = String(orderIds).split(',');
    query._id = { $in: ids };
  }

  const orders = await Order.find(query).populate('retailerId');

  if (orders.length === 0) {
    res.status(400).json({ success: false, message: 'No eligible approved orders found for Tally export.' });
    return;
  }

  const exportBatchId = `BATCH-${Date.now()}`;
  const now = new Date();

  // CSV Columns: VoucherDate, VoucherType, PartyName, ItemName, SKU, BilledQty, FreeQty, Rate, DiscountPercent, Amount
  const headers = [
    'VoucherDate',
    'VoucherType',
    'PartyName',
    'ItemName',
    'SKU',
    'BilledQty',
    'FreeQty',
    'Rate',
    'DiscountPercent',
    'Amount',
  ];

  const rows: string[] = [headers.join(',')];

  for (const order of orders) {
    const voucherDate = new Date(order.createdAt).toISOString().slice(0, 10);
    const voucherType = 'Sales';
    const partyName = `"${(order.retailerId as any)?.storeName || 'Kirana Customer'}"`;

    for (const item of order.items) {
      const itemName = `"${item.name}"`;
      const sku = item.sku;
      const billedQty = item.orderedCases;
      const freeQty = item.freeCases;
      const rate = item.casePriceSnapshot.toFixed(2);
      const discountPercent = item.discountPercent.toFixed(2);
      const amount = item.netAmount.toFixed(2);

      rows.push(
        [
          voucherDate,
          voucherType,
          partyName,
          itemName,
          sku,
          billedQty,
          freeQty,
          rate,
          discountPercent,
          amount,
        ].join(',')
      );
    }

    // Flag as exported
    order.tallyExport = {
      isExported: true,
      exportedAt: now,
      exportBatchId,
    };
    order.status = 'SYNCED_TO_TALLY';
    await order.save();
  }

  const csvContent = rows.join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="stockora_tally_${exportBatchId}.csv"`
  );

  res.send(csvContent);
};

