import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Product } from '../models/Product.js';
import { RetailerAlias } from '../models/RetailerAlias.js';
import { geminiCascade } from '../services/ai/geminiCascadeService.js';

const parseOrderSchema = z.object({
  rawText: z.string().min(3, 'Order message must be at least 3 characters'),
  retailerId: z.string().optional(),
});

const saveAliasSchema = z.object({
  retailerId: z.string().min(1, 'Retailer ID is required'),
  rawKeyword: z.string().min(2, 'Raw keyword must be at least 2 characters'),
  mappedSku: z.string().min(1, 'Mapped SKU is required'),
  preferredUnit: z.enum(['CASE', 'PIECE']).default('CASE'),
});

export const parseWhatsAppOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = parseOrderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { rawText, retailerId } = result.data;
  const effectiveRetailerId = retailerId || (req.user?.retailerId ? req.user.retailerId._id?.toString() || req.user.retailerId.toString() : undefined);

  // 1. Fetch active products
  const products = await Product.find({ isActive: true });
  const catalogContext = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    packSize: p.packSize,
    unitsPerCase: p.unitsPerCase,
  }));

  // 2. Fetch retailer-specific aliases
  const aliases = effectiveRetailerId
    ? await RetailerAlias.find({ retailerId: effectiveRetailerId })
    : [];

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

  // 4. Validate matches against real DB products and attach live metadata
  const productSkuMap = new Map();
  products.forEach((p) => productSkuMap.set(p.sku, p));

  const validatedSuggestions = cascadeResult.suggestions.map((item) => {
    const product = productSkuMap.get(item.suggestedSku);

    // If AI suggested an invalid SKU, flag as unmatched
    if (!product) {
      return {
        ...item,
        isVerifiedProduct: false,
        product: null,
      };
    }

    const availableCases = Math.max(0, product.stockCasesAvailable - product.stockCasesReserved);

    // Also look up alternative products
    const alternatives = (item.alternativeSkus || [])
      .map((altSku) => productSkuMap.get(altSku))
      .filter(Boolean)
      .map((altP) => ({
        sku: altP.sku,
        name: altP.name,
        packSize: altP.packSize,
        dealerPricePerPack: altP.dealerPricePerPack,
        calculatedCasePrice: altP.calculatedCasePrice,
      }));

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
        dealerPricePerPack: product.dealerPricePerPack,
        calculatedCasePrice: product.calculatedCasePrice,
        availableCases,
        stockStatus: availableCases > 0 ? (availableCases <= product.lowStockThresholdCases ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
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

  const { retailerId, rawKeyword, mappedSku, preferredUnit } = result.data;
  const product = await Product.findOne({ sku: mappedSku });

  if (!product) {
    res.status(404).json({ success: false, message: `Product with SKU ${mappedSku} not found.` });
    return;
  }

  const alias = await RetailerAlias.findOneAndUpdate(
    { retailerId, rawKeyword: rawKeyword.toLowerCase().trim() },
    {
      mappedProductId: product._id,
      mappedSku: product.sku,
      preferredUnit,
      confidenceScore: 1.0,
      createdFrom:
        req.user?.role === 'ORDER_DESK' || req.user?.role === 'ADMIN'
          ? 'ORDER_DESK_CORRECTION'
          : 'RETAILER_CONFIRMATION',
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: `Alias saved: "${rawKeyword}" now maps to ${product.name} (${product.sku}) for this retailer.`,
    alias,
  });
};

