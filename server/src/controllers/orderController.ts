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
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(64),
        orderedCases: z.number().int().min(1).max(10000),
      })
    )
    .min(1, 'Order must contain at least 1 item')
    .max(100, 'Order exceeds maximum distinct items'),
  source: z.enum(['CATALOG', 'AI_WHATSAPP_PARSE', 'DESK_MANUAL']).default('CATALOG'),
  rawTextOrder: z.string().trim().max(2000).optional(),
});

async function generateNextOrderNumber(dateStr: string): Promise<string> {
  const prefix = `STK-${dateStr}-`;
  const latestToday = await Order.findOne({ orderNumber: { $regex: `^${prefix}` } })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean();

  if (latestToday?.orderNumber) {
    const tail = parseInt(latestToday.orderNumber.slice(prefix.length), 10);
    if (!Number.isNaN(tail)) {
      return `${prefix}${String(tail + 1).padStart(4, '0')}`;
    }
  }

  const totalCount = await Order.countDocuments();
  return `${prefix}${String(totalCount + 101).padStart(4, '0')}`;
}

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

  const { items: rawItems, source, rawTextOrder } = result.data;

  // Merge duplicate productId entries so split lines cannot bypass stock pool checks
  const mergedMap = new Map<string, number>();
  for (const line of rawItems) {
    mergedMap.set(line.productId, (mergedMap.get(line.productId) || 0) + line.orderedCases);
  }
  const items = Array.from(mergedMap.entries()).map(([productId, orderedCases]) => ({
    productId,
    orderedCases,
  }));

  const retailerId = (req.user.retailerId as any)._id || req.user.retailerId;
  const productIds = items.map((i) => i.productId);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

  // Wave 1: Fetch Retailer, Products, Active Schemes, Custom Shop Prices, and Next Order Number in parallel
  const [retailer, products, schemes, customPrices, initialOrderNumber] = await Promise.all([
    Retailer.findById(retailerId).lean(),
    Product.find({ _id: { $in: productIds }, isActive: true }).lean(),
    Scheme.find({
      primaryProductId: { $in: productIds },
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean(),
    RetailerPrice.find({
      retailerId,
      productId: { $in: productIds },
      validFrom: { $lte: now },
      $or: [{ validTo: { $exists: false } }, { validTo: null }, { validTo: { $gte: now } }],
    }).lean(),
    generateNextOrderNumber(dateStr),
  ]);

  if (!retailer || !retailer.isActive) {
    res.status(403).json({ success: false, message: 'Retailer account is inactive or not found.' });
    return;
  }

  if (retailer.creditStatus === 'BLOCKED') {
    res.status(403).json({
      success: false,
      message: 'Your credit ledger is currently blocked. Please contact Company A Order Desk.',
    });
    return;
  }

  const productMap = new Map<string, any>();
  products.forEach((p) => productMap.set(p._id.toString(), p));

  // 1. Preliminary Product & Stock Validation
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

  const schemeMap = new Map<string, any>();
  schemes.forEach((s) => schemeMap.set(s.primaryProductId.toString(), s));

  const customPriceMap = new Map<string, number>();
  customPrices.forEach((cp) => customPriceMap.set(cp.productId.toString(), cp.customDealerPricePerPack));

  // 2. Deterministic Scheme Engine Calculation
  const calculationInput = items.map((i) => {
    const product = productMap.get(i.productId)!;
    return {
      product: product as any,
      orderedCases: i.orderedCases,
      activeScheme: schemeMap.get(product._id.toString()),
      customDealerPricePerPack: customPriceMap.get(product._id.toString()),
    };
  });

  const financials = calculateOrderFinancials(calculationInput);

  // Wave 2: Parallel Atomic Conditional Stock Reservation with Automatic Rollback on Contention
  const reservationResults = await Promise.all(
    items.map(async (item) => {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          isActive: true,
          $expr: {
            $gte: [{ $subtract: ['$stockCasesAvailable', '$stockCasesReserved'] }, item.orderedCases],
          },
        },
        {
          $inc: { stockCasesReserved: item.orderedCases },
        },
        { new: true }
      )
        .select('_id')
        .lean();

      return { item, reserved: Boolean(updatedProduct) };
    })
  );

  const failedReservation = reservationResults.find((r) => !r.reserved);
  const reservedSoFar = reservationResults.filter((r) => r.reserved).map((r) => r.item);

  if (failedReservation) {
    if (reservedSoFar.length > 0) {
      await Promise.all(
        reservedSoFar.map((prev) =>
          Product.findByIdAndUpdate(prev.productId, {
            $inc: { stockCasesReserved: -prev.orderedCases },
          })
        )
      );
    }
    const prodName = productMap.get(failedReservation.item.productId)?.name || 'requested item';
    res.status(400).json({
      success: false,
      message: `Insufficient live stock for ${prodName}. Please refresh your cart quantities.`,
    });
    return;
  }

  // 3. Credit Hold Policy (Option B)
  const totalExposure = retailer.outstandingBalance + financials.finalPayableAmount;
  let status: OrderStatus = 'SUBMITTED';
  let flaggedHold = false;
  let reviewNote = 'Order submitted successfully.';

  if (totalExposure > retailer.creditLimit) {
    status = 'CREDIT_HOLD';
    flaggedHold = true;
    reviewNote = `Credit limit exceeded (Exposure: ₹${totalExposure.toLocaleString('en-IN')} > Limit: ₹${retailer.creditLimit.toLocaleString('en-IN')}). Pending Order Desk review.`;
  }

  const reservationExpiresAt = new Date(
    Date.now() + env.STOCK_RESERVATION_EXPIRY_MINUTES * 60 * 1000
  );

  // Wave 3: Create Order with Collision-Safe Order Number Retry
  let order: any = null;
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber =
        attempt === 0
          ? initialOrderNumber
          : `STK-${dateStr}-${String(Math.floor(1000 + Math.random() * 9000))}`;

      try {
        order = await Order.create({
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
        break;
      } catch (createErr: any) {
        if (createErr?.code === 11000 && attempt < 4) {
          continue;
        }
        throw createErr;
      }
    }
  } catch (err) {
    // Roll back stock reservation in parallel if order persistence fails
    await Promise.all(
      reservedSoFar.map((prev) =>
        Product.findByIdAndUpdate(prev.productId, {
          $inc: { stockCasesReserved: -prev.orderedCases },
        })
      )
    );
    throw err;
  }

  res.status(201).json({
    success: true,
    message: flaggedHold
      ? 'Order submitted. Placed on CREDIT HOLD due to credit limit exposure. Our Jabalpur Order Desk will review shortly.'
      : 'Order placed successfully!',
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      totalDiscount: order.totalDiscount,
      totalCgst: order.totalCgst,
      totalSgst: order.totalSgst,
      totalTax: order.totalTax,
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

  const retailerId = (req.user.retailerId as any)._id || req.user.retailerId;
  const orders = await Order.find({ retailerId }).sort({ createdAt: -1 }).lean();

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

  if (req.user?.role === 'RETAILER') {
    const retailerId = req.user.retailerId
      ? ((req.user.retailerId as any)._id || req.user.retailerId)
      : null;
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
