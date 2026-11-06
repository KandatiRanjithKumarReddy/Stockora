import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Product } from '../models/Product.js';
import { RetailerAlias } from '../models/RetailerAlias.js';
import { RetailerPrice } from '../models/RetailerPrice.js';
import { geminiCascade } from '../services/ai/geminiCascadeService.js';

const parseOrderSchema = z.object({
  rawText: z.string().trim().min(3, 'Order message must be at least 3 characters').max(2000, 'Order message is too long'),
  retailerId: z.string().trim().max(64).optional(),
});

const saveAliasSchema = z
  .object({
    retailerId: z.string().trim().min(1, 'Retailer ID is required').max(64),
    rawKeyword: z.string().trim().min(2, 'Raw keyword must be at least 2 characters').max(80, 'Keyword is too long'),
    mappedSku: z.string().trim().max(40).optional(),
    mappedProductId: z.string().trim().max(64).optional(),
    preferredUnit: z.enum(['CASE', 'PIECE']).default('CASE'),
  })
  .refine((val) => Boolean(val.mappedSku || val.mappedProductId), {
    message: 'Either mappedSku or mappedProductId is required.',
  });

export const parseWhatsAppOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = parseOrderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { rawText, retailerId } = result.data;
  const userRetailerId = req.user?.retailerId
    ? ((req.user.retailerId as any)._id?.toString() || req.user.retailerId.toString())
    : undefined;

  // Retailers are strictly bound to their own shop ID; only Order Desk / Admin may specify a target retailerId
  const effectiveRetailerId =
    req.user?.role === 'ORDER_DESK' || req.user?.role === 'ADMIN'
      ? retailerId || userRetailerId
      : userRetailerId;

  // 1. Fetch active products
  const products = await Product.find({ isActive: true });
  const catalogContext = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    packSize: p.packSize,
    unitsPerCase: p.unitsPerCase,
  }));

  // 2. Fetch retailer-specific aliases and custom pricing overrides
  const now = new Date();
  const [aliases, customPrices] = await Promise.all([
    effectiveRetailerId ? RetailerAlias.find({ retailerId: effectiveRetailerId }) : Promise.resolve([]),
    effectiveRetailerId
      ? RetailerPrice.find({
          retailerId: effectiveRetailerId,
          validFrom: { $lte: now },
          $or: [{ validTo: { $exists: false } }, { validTo: null }, { validTo: { $gte: now } }],
        })
      : Promise.resolve([]),
  ]);

  const customPriceMap = new Map<string, number>();
  customPrices.forEach((cp) => {
    customPriceMap.set(cp.productId.toString(), cp.customDealerPricePerPack);
  });

  const aliasContext = aliases.map((a) => ({
    rawKeyword: a.rawKeyword,
    mappedSku: a.mappedSku,
  }));

  // 3. Execute Gemini 3-Model Cascade
  const cascadeResult = await geminiCascade.parseOrderText(
    rawText,
    catalogContext,
    aliasContext,
    effectiveRetailerId
  );

  if (cascadeResult.status === 'FALLBACK_EXHAUSTED' || cascadeResult.status === 'ERROR') {
    res.status(503).json({
      success: false,
      message:
        'Smart Order is temporarily busy. Please try again in a moment or add items from the catalog.',
    });
    return;
  }

  // 4. Validate matches against real DB products and attach live metadata + custom retailer prices
  const productSkuMap = new Map<string, any>();
  products.forEach((p) => productSkuMap.set(p.sku, p));

  const validatedSuggestions = cascadeResult.suggestions.map((item) => {
    const product = productSkuMap.get(item.suggestedSku);

    if (!product) {
      return {
        ...item,
        isVerifiedProduct: false,
        product: null,
      };
    }

    const availableCases = Math.max(0, product.stockCasesAvailable - product.stockCasesReserved);
    const customPackPrice = customPriceMap.get(product._id.toString());
    const effectivePackPrice =
      customPackPrice !== undefined ? customPackPrice : product.dealerPricePerPack;
    const effectiveCasePrice = Math.round(effectivePackPrice * product.unitsPerCase * 100) / 100;

    const alternatives = (item.alternativeSkus || [])
      .map((altSku) => productSkuMap.get(altSku))
      .filter(Boolean)
      .map((altP) => {
        const altCustom = customPriceMap.get(altP._id.toString());
        const altPackPrice = altCustom !== undefined ? altCustom : altP.dealerPricePerPack;
        return {
          _id: altP._id,
          sku: altP.sku,
          name: altP.name,
          packSize: altP.packSize,
          unitsPerCase: altP.unitsPerCase,
          dealerPricePerPack: altPackPrice,
          calculatedCasePrice: Math.round(altPackPrice * altP.unitsPerCase * 100) / 100,
        };
      });

    return {
      originalPhrase: item.originalPhrase,
      suggestedSku: item.suggestedSku,
      quantity: item.quantity,
      unit: item.unit,
      confidenceScore: item.confidenceScore,
      unitAmbiguous: item.unitAmbiguous,
      clarificationNeeded: item.clarificationNeeded,
      isVerifiedProduct: true,
      alternatives,
      product: {
        _id: product._id,
        sku: product.sku,
        name: product.name,
        packSize: product.packSize,
        unitsPerCase: product.unitsPerCase,
        dealerPricePerPack: effectivePackPrice,
        calculatedCasePrice: effectiveCasePrice,
        hasCustomPrice: customPackPrice !== undefined,
        availableCases,
        stockStatus:
          availableCases > 0
            ? availableCases <= product.lowStockThresholdCases
              ? 'LOW_STOCK'
              : 'IN_STOCK'
            : 'OUT_OF_STOCK',
        imageUrl: product.imageUrl,
      },
    };
  });

  if (validatedSuggestions.length === 0) {
    res.status(422).json({
      success: false,
      message:
        'We could not match any catalog products from that note. Try mentioning the item name and case count (for example, "5 peti glucose biscuit"), or browse the catalog directly.',
    });
    return;
  }

  // Never expose model names, provider details, fallback flags, or internal latency to clients
  res.json({
    success: true,
    suggestions: validatedSuggestions,
    count: validatedSuggestions.length,
  });
};

export const saveRetailerAlias = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = saveAliasSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { retailerId, rawKeyword, mappedSku, mappedProductId, preferredUnit } = result.data;

  // Enforce strict tenant isolation: a RETAILER may only save aliases for their own shop
  const isStaff = req.user?.role === 'ORDER_DESK' || req.user?.role === 'ADMIN';
  if (!isStaff) {
    const ownRetailerId = req.user?.retailerId
      ? ((req.user.retailerId as any)._id?.toString() || req.user.retailerId.toString())
      : null;
    if (!ownRetailerId || ownRetailerId !== retailerId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You cannot modify product aliases for another retailer.',
      });
      return;
    }
  }

  const product = mappedSku
    ? await Product.findOne({ sku: mappedSku.toUpperCase().trim(), isActive: true })
    : await Product.findOne({ _id: mappedProductId, isActive: true });

  if (!product) {
    res.status(404).json({
      success: false,
      message: `Matching active catalog product not found.`,
    });
    return;
  }

  const alias = await RetailerAlias.findOneAndUpdate(
    { retailerId, rawKeyword: rawKeyword.toLowerCase().trim() },
    {
      mappedProductId: product._id,
      mappedSku: product.sku,
      preferredUnit,
      confidenceScore: 1.0,
      createdFrom: isStaff ? 'ORDER_DESK_CORRECTION' : 'RETAILER_CONFIRMATION',
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: `Alias saved: "${rawKeyword}" now maps to ${product.name} (${product.sku}) for this retailer.`,
    alias,
  });
};
