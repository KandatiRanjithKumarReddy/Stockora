import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Order, OrderStatus } from '../models/Order.js';
import { Retailer } from '../models/Retailer.js';
import { Product } from '../models/Product.js';
import { Scheme } from '../models/Scheme.js';
import { RetailerPrice } from '../models/RetailerPrice.js';
import { calculateOrderFinancials } from '../services/schemeEngine.js';
import { escapeRegex, sanitizeCsvCell } from '../utils/asyncHandler.js';

const TRIAGEABLE_STATUSES: OrderStatus[] = ['SUBMITTED', 'CREDIT_HOLD', 'UNDER_REVIEW'];

const updateStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CREDIT_HOLD', 'UNDER_REVIEW']),
  note: z.string().trim().max(500).optional(),
  reviewNote: z.string().trim().max(500).optional(),
});

const updateLinesSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(64),
        orderedCases: z.number().int().min(1, 'Ordered cases must be at least 1').max(10000),
      })
    )
    .min(1, 'Order must contain at least 1 line item')
    .max(100, 'Order exceeds maximum distinct line items'),
});

export const getDeskOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, search, page = '1', limit = '20' } = req.query;

  const query: any = {};

  if (status && status !== 'ALL') {
    query.status = String(status).slice(0, 32);
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  if (search) {
    const safeSearch = escapeRegex(String(search).trim().slice(0, 80));
    if (safeSearch) {
      const searchRegex = new RegExp(safeSearch, 'i');
      const matchingRetailers = await Retailer.find({
        $or: [{ storeName: searchRegex }, { ownerName: searchRegex }],
      }).select('_id');

      query.$or = [
        { orderNumber: searchRegex },
        { retailerId: { $in: matchingRetailers.map((r) => r._id) } },
      ];
    }
  }

  const [orders, totalCount, submittedCount, creditHoldCount, approvedCount, exportedCount] =
    await Promise.all([
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
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const { status, note, reviewNote } = parsed.data;
  const effectiveNote = note || reviewNote;

  const existingOrder = await Order.findById(id);
  if (!existingOrder) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  const prevStatus = existingOrder.status;

  if (prevStatus === status) {
    res.json({
      success: true,
      message: `Order ${existingOrder.orderNumber} is already ${status}.`,
      order: existingOrder,
    });
    return;
  }

  // Enforce strict state machine: terminal orders (APPROVED, REJECTED, SYNCED_TO_TALLY, CANCELLED) cannot be re-triaged
  if (!TRIAGEABLE_STATUSES.includes(prevStatus)) {
    res.status(400).json({
      success: false,
      message: `Order ${existingOrder.orderNumber} is already ${prevStatus} and cannot be changed to ${status}.`,
    });
    return;
  }

  // Atomic state transition claim prevents concurrent double-approve / double-reject race conditions
  const updateDoc: any = {
    $set: {
      status,
      ...(effectiveNote ? { 'creditCheck.reviewNote': effectiveNote } : {}),
    },
    $push: {
      staffCorrections: {
        field: 'status',
        originalValue: prevStatus,
        correctedValue: status,
        correctedBy: req.user?._id as any,
        timestamp: new Date(),
      },
    },
  };

  const transitionedOrder = await Order.findOneAndUpdate(
    { _id: id, status: prevStatus },
    updateDoc,
    { new: true }
  );

  if (!transitionedOrder) {
    res.status(409).json({
      success: false,
      message: 'Order status was just modified by another request. Please refresh.',
    });
    return;
  }

  // 1. Approving Order -> Permanently deduct stock & increment Retailer Outstanding Balance
  if (status === 'APPROVED') {
    for (const item of transitionedOrder.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          stockCasesAvailable: -item.orderedCases,
          stockCasesReserved: -item.orderedCases,
        },
      });
    }

    await Retailer.findByIdAndUpdate(transitionedOrder.retailerId, {
      $inc: { outstandingBalance: transitionedOrder.finalPayableAmount },
    });
  }

  // 2. Rejecting Order -> Release Stock Reservation back to available pool
  if (status === 'REJECTED') {
    for (const item of transitionedOrder.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockCasesReserved: -item.orderedCases },
      });
    }
  }

  res.json({
    success: true,
    message: `Order ${transitionedOrder.orderNumber} status changed to ${status}.`,
    order: transitionedOrder,
  });
};

export const updateOrderLines = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const parsed = updateLinesSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  if (!TRIAGEABLE_STATUSES.includes(order.status)) {
    res.status(400).json({
      success: false,
      message: `Cannot edit lines on an order with status ${order.status}.`,
    });
    return;
  }

  // Aggregate duplicate productId entries
  const mergedMap = new Map<string, number>();
  for (const line of parsed.data.items) {
    mergedMap.set(line.productId, (mergedMap.get(line.productId) || 0) + line.orderedCases);
  }
  const items = Array.from(mergedMap.entries()).map(([productId, orderedCases]) => ({
    productId,
    orderedCases,
  }));

  const oldReservedByProduct = new Map<string, number>();
  for (const oldItem of order.items) {
    const pid = oldItem.productId.toString();
    oldReservedByProduct.set(pid, (oldReservedByProduct.get(pid) || 0) + oldItem.orderedCases);
  }

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map<string, any>();
  products.forEach((p) => productMap.set(p._id.toString(), p));

  // Verify every product exists and has sufficient stock once this order's prior reservation is accounted for
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product ${item.productId} not found or inactive.`,
      });
      return;
    }

    const currentlyAvailable = product.stockCasesAvailable - product.stockCasesReserved;
    const heldByThisOrder = oldReservedByProduct.get(item.productId) || 0;
    const effectivePool = currentlyAvailable + heldByThisOrder;

    if (item.orderedCases > effectivePool) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}. Maximum allocatable: ${Math.max(0, effectivePool)} cases.`,
      });
      return;
    }
  }

  const now = new Date();
  const [schemes, customPrices] = await Promise.all([
    Scheme.find({
      primaryProductId: { $in: productIds },
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }),
    RetailerPrice.find({
      retailerId: order.retailerId,
      productId: { $in: productIds },
      validFrom: { $lte: now },
      $or: [{ validTo: { $exists: false } }, { validTo: null }, { validTo: { $gte: now } }],
    }),
  ]);

  const schemeMap = new Map<string, any>();
  schemes.forEach((s) => schemeMap.set(s.primaryProductId.toString(), s));

  const customPriceMap = new Map<string, number>();
  customPrices.forEach((cp) => customPriceMap.set(cp.productId.toString(), cp.customDealerPricePerPack));

  const calcInput = items.map((i) => ({
    product: productMap.get(i.productId)!,
    orderedCases: i.orderedCases,
    activeScheme: schemeMap.get(i.productId),
    customDealerPricePerPack: customPriceMap.get(i.productId),
  }));

  const financials = calculateOrderFinancials(calcInput);

  // Release previous reservations and apply updated reservations
  for (const oldItem of order.items) {
    await Product.findByIdAndUpdate(oldItem.productId, {
      $inc: { stockCasesReserved: -oldItem.orderedCases },
    });
  }

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

  // Only export verified APPROVED orders to Tally ERP
  const query: any = { status: 'APPROVED' };

  if (orderIds) {
    const ids = String(orderIds)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    query._id = { $in: ids };
  }

  const orders = await Order.find(query).populate('retailerId');

  if (orders.length === 0) {
    res.status(400).json({ success: false, message: 'No eligible approved orders found for Tally export.' });
    return;
  }

  const exportBatchId = `BATCH-${Date.now()}`;
  const now = new Date();

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
    const partyName = sanitizeCsvCell((order.retailerId as any)?.storeName || 'Kirana Customer');

    for (const item of order.items) {
      const itemName = sanitizeCsvCell(item.name);
      const sku = sanitizeCsvCell(item.sku);
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

    order.tallyExport = {
      isExported: true,
      exportedAt: now,
      exportBatchId,
    };
    order.status = 'SYNCED_TO_TALLY';
    await order.save();
  }

  const csvContent = rows.join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="stockora_tally_${exportBatchId}.csv"`
  );

  res.send(csvContent);
};
