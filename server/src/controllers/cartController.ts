import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Product } from '../models/Product.js';
import { Scheme } from '../models/Scheme.js';
import { RetailerPrice } from '../models/RetailerPrice.js';
import { calculateOrderFinancials } from '../services/schemeEngine.js';

const cartItemSchema = z.object({
  productId: z.string().trim().min(1, 'Product ID is required').max(64),
  orderedCases: z.number().int().min(1, 'Ordered cases must be at least 1').max(10000, 'Ordered cases exceeds maximum limit'),
});

const calculateCartSchema = z.object({
  items: z.array(cartItemSchema).max(100, 'Too many distinct cart lines'),
});

export const calculateCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = calculateCartSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  // Aggregate duplicate productId entries before stock & scheme evaluation
  const mergedQtyMap = new Map<string, number>();
  for (const item of result.data.items) {
    mergedQtyMap.set(item.productId, (mergedQtyMap.get(item.productId) || 0) + item.orderedCases);
  }
  const items = Array.from(mergedQtyMap.entries()).map(([productId, orderedCases]) => ({
    productId,
    orderedCases,
  }));
  if (items.length === 0) {
    res.json({
      success: true,
      items: [],
      subtotal: 0,
      totalDiscount: 0,
      totalCgst: 0,
      totalSgst: 0,
      totalTax: 0,
      finalPayableAmount: 0,
      stockWarnings: [],
    });
    return;
  }

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });

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

  // Load custom prices if retailer
  let customPriceMap = new Map();
  if (req.user?.retailerId) {
    const retailerId = req.user.retailerId._id || req.user.retailerId;
    const customPrices = await RetailerPrice.find({
      retailerId,
      productId: { $in: productIds },
    });
    customPrices.forEach((cp) => customPriceMap.set(cp.productId.toString(), cp.customDealerPricePerPack));
  }

  const calculationInput = [];
  const stockWarnings = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      res.status(404).json({ success: false, message: `Product ${item.productId} not found or inactive.` });
      return;
    }

    const available = Math.max(0, product.stockCasesAvailable - product.stockCasesReserved);
    if (item.orderedCases > available) {
      stockWarnings.push({
        sku: product.sku,
        name: product.name,
        requestedCases: item.orderedCases,
        availableCases: available,
        message: available > 0
          ? `Only ${available} cases available for ${product.name}`
          : `${product.name} is currently OUT OF STOCK`,
      });
    }

    calculationInput.push({
      product,
      orderedCases: item.orderedCases,
      activeScheme: schemeMap.get(product._id.toString()),
      customDealerPricePerPack: customPriceMap.get(product._id.toString()),
    });
  }

  const calculation = calculateOrderFinancials(calculationInput);

  res.json({
    success: true,
    ...calculation,
    stockWarnings,
  });
};

