import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Product } from '../models/Product.js';
import { Scheme } from '../models/Scheme.js';
import { RetailerPrice } from '../models/RetailerPrice.js';

export const getProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { search, category, brand, inStock } = req.query;

  const query: any = { isActive: true };

  if (category && category !== 'ALL') {
    query.category = category;
  }

  if (brand && brand !== 'ALL') {
    query.brand = brand;
  }

  if (search) {
    const searchRegex = new RegExp(String(search).trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { sku: searchRegex },
      { brand: searchRegex },
      { category: searchRegex },
    ];
  }

  const products = await Product.find(query).sort({ category: 1, name: 1 });

  // Fetch active schemes valid today
  const now = new Date();
  const schemes = await Scheme.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  const schemeMap = new Map();
  schemes.forEach((s) => {
    schemeMap.set(s.primaryProductId.toString(), s);
  });

  // If authenticated retailer, load custom price overrides
  let customPriceMap = new Map();
  if (req.user?.retailerId) {
    const customPrices = await RetailerPrice.find({
      retailerId: req.user.retailerId._id || req.user.retailerId,
    });
    customPrices.forEach((cp) => {
      customPriceMap.set(cp.productId.toString(), cp.customDealerPricePerPack);
    });
  }

  // Format response with stock calculation and scheme details
  const enrichedProducts = products.map((p) => {
    const customPrice = customPriceMap.get(p._id.toString());
    const effectivePackPrice = customPrice !== undefined ? customPrice : p.dealerPricePerPack;
    const effectiveCasePrice = Math.round(effectivePackPrice * p.unitsPerCase * 100) / 100;
    const availableCases = Math.max(0, p.stockCasesAvailable - p.stockCasesReserved);
    const activeScheme = schemeMap.get(p._id.toString()) || null;

    let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (availableCases <= 0) {
      stockStatus = 'OUT_OF_STOCK';
    } else if (availableCases <= p.lowStockThresholdCases) {
      stockStatus = 'LOW_STOCK';
    }

    return {
      _id: p._id,
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      category: p.category,
      packSize: p.packSize,
      hsnCode: p.hsnCode,
      unitsPerCase: p.unitsPerCase,
      caseWeightKg: p.caseWeightKg,
      mrp: p.mrp,
      dealerPricePerPack: effectivePackPrice,
      originalBasePackPrice: p.dealerPricePerPack,
      hasCustomPrice: customPrice !== undefined,
      calculatedCasePrice: effectiveCasePrice,
      gstRatePercent: p.gstRatePercent,
      stockCasesAvailable: p.stockCasesAvailable,
      stockCasesReserved: p.stockCasesReserved,
      availableCases,
      stockStatus,
      imageUrl: p.imageUrl,
      activeScheme: activeScheme
        ? {
            id: activeScheme._id,
            name: activeScheme.name,
            schemeType: activeScheme.schemeType,
            buyQuantity: activeScheme.buyQuantity,
            freeQuantity: activeScheme.freeQuantity,
            minSlabQuantity: activeScheme.minSlabQuantity,
            discountPercentage: activeScheme.discountPercentage,
          }
        : null,
    };
  });

  if (inStock === 'true') {
    res.json({
      success: true,
      count: enrichedProducts.filter((p) => p.availableCases > 0).length,
      products: enrichedProducts.filter((p) => p.availableCases > 0),
    });
    return;
  }

  res.json({
    success: true,
    count: enrichedProducts.length,
    products: enrichedProducts,
  });
};

export const getProductById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  const now = new Date();
  const scheme = await Scheme.findOne({
    primaryProductId: product._id,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  res.json({
    success: true,
    product: {
      ...product.toObject(),
      availableCases: Math.max(0, product.stockCasesAvailable - product.stockCasesReserved),
      activeScheme: scheme,
    },
  });
};

export const getCategories = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const categories = await Product.distinct('category', { isActive: true });
  const brands = await Product.distinct('brand', { isActive: true });

  res.json({
    success: true,
    categories,
    brands,
  });
};

