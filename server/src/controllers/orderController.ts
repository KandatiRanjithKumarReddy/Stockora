import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Product } from '../models/Product.js';
import { Scheme } from '../models/Scheme.js';
import { Retailer } from '../models/Retailer.js';
import { RetailerPrice } from '../models/RetailerPrice.js';
import { Order, OrderStatus } from '../models/Order.js';
import { calculateOrderFinancials } from '../services/schemeEngine.js';
import { env } from '../config/env.js';

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      orderedCases: z.number().int().min(1),
    })
  ).min(1, 'Order must contain at least 1 item'),
  source: z.enum(['CATALOG', 'AI_WHATSAPP_PARSE', 'DESK_MANUAL']).default('CATALOG'),
  rawTextOrder: z.string().optional(),
});

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.retailerId) {
    res.status(403).json({ success: false, message: 'Only authorized Kirana retailers can place orders.' });
    return;
  }

  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { items, source, rawTextOrder } = result.data;
  const retailerId = req.user.retailerId._id || req.user.retailerId;
  const retailer = await Retailer.findById(retailerId);

  if (!retailer || !retailer.isActive) {
    res.status(403).json({ success: false, message: 'Retailer account is inactive or not found.' });
    return;
  }

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map();
  products.forEach((p) => productMap.set(p._id.toString(), p));

  // 1. Stock Availability & Reservation Check
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      res.status(404).json({ success: false, message: `Product ${item.productId} not found.` });
      return;
    }

    const available = product.stockCasesAvailable - product.stockCasesReserved;
    if (item.orderedCases > available) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}. Available: ${Math.max(0, available)} cases, requested: ${item.orderedCases} cases.`,
      });
      return;
    }
  }

  // 2. Fetch Active Schemes & Custom Prices
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
    retailerId: retailer._id,
    productId: { $in: productIds },
  });
  const customPriceMap = new Map();
  customPrices.forEach((cp) => customPriceMap.set(cp.productId.toString(), cp.customDealerPricePerPack));

  // 3. Deterministic Scheme Engine Calculation
  const calculationInput = items.map((i) => {
    const product = productMap.get(i.productId)!;
    return {
      product,
      orderedCases: i.orderedCases,
      activeScheme: schemeMap.get(product._id.toString()),
      customDealerPricePerPack: customPriceMap.get(product._id.toString()),
    };
  });

  const financials = calculateOrderFinancials(calculationInput);

  // 4. Concurrency Stock Reservation
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stockCasesReserved: item.orderedCases },
    });
  }

  // 5. Credit Hold Policy (Option B)
  const totalExposure = retailer.outstandingBalance + financials.finalPayableAmount;
  let status: OrderStatus = 'SUBMITTED';
  let flaggedHold = false;
  let reviewNote = 'Order submitted successfully.';

  if (totalExposure > retailer.creditLimit) {
    status = 'CREDIT_HOLD';
    flaggedHold = true;
    reviewNote = `Credit limit exceeded (Exposure: ₹${totalExposure.toLocaleString('en-IN')} > Limit: ₹${retailer.creditLimit.toLocaleString('en-IN')}). Pending Order Desk review.`;
  }

  // 6. Generate Unique Order Number
  const count = await Order.countDocuments();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const orderNumber = `STK-${dateStr}-${String(count + 101).padStart(4, '0')}`;

  const reservationExpiresAt = new Date(
    Date.now() + env.STOCK_RESERVATION_EXPIRY_MINUTES * 60 * 1000
  );

  const order = await Order.create({
    orderNumber,
    retailerId: retailer._id,
    source,
    status,
    rawTextOrder,
    reservationExpiresAt,
    items: financials.items,
    subtotal: financials.subtotal,
    totalDiscount: financials.totalDiscount,
    totalCgst: financials.totalCgst,
    totalSgst: financials.totalSgst,
    totalTax: financials.totalTax,
    finalPayableAmount: financials.finalPayableAmount,
    creditCheck: {
      passed: !flaggedHold,
      currentBalanceSnapshot: retailer.outstandingBalance,
      creditLimitSnapshot: retailer.creditLimit,
      orderAmount: financials.finalPayableAmount,
      flaggedHold,
      reviewNote,
    },
    tallyExport: {
      isExported: false,
    },
  });

  res.status(201).json({
    success: true,
    message: flaggedHold
      ? 'Order submitted. Placed on CREDIT HOLD due to credit limit exposure. Our Jabalpur Order Desk will review shortly.'
      : 'Order placed successfully!',
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      finalPayableAmount: order.finalPayableAmount,
      itemsCount: order.items.length,
      creditHold: flaggedHold,
      reviewNote,
      createdAt: order.createdAt,
    },
  });
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.retailerId) {
    res.status(403).json({ success: false, message: 'Only retailers can view their own order history.' });
    return;
  }

  const retailerId = req.user.retailerId._id || req.user.retailerId;
  const orders = await Order.find({ retailerId }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    orders,
  });
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('retailerId');

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  // Access check: Only order's retailer or Order Desk/Admin
  if (req.user?.role === 'RETAILER') {
    const retailerId = req.user.retailerId ? ((req.user.retailerId as any)._id || req.user.retailerId) : null;
    if (!retailerId || (order.retailerId as any)._id.toString() !== retailerId.toString()) {
      res.status(403).json({ success: false, message: "Unauthorized. You cannot view another retailer's order." });
      return;
    }
  }

  res.json({
    success: true,
    order,
  });
};
