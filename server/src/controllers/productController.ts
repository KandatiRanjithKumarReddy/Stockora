import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Product } from '../models/Product.js';
import { Scheme } from '../models/Scheme.js';
import { RetailerPrice } from '../models/RetailerPrice.js';
import { escapeRegex } from '../utils/asyncHandler.js';

export const getProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { search, category, brand, inStock } = req.query;

  const query: any = { isActive: true };

  if (category && category !== 'ALL') {
    query.category = String(category).slice(0, 60);
  }

  if (brand && brand !== 'ALL') {
    query.brand = String(brand).slice(0, 60);
  }

  if (search) {
    const safeSearch = escapeRegex(String(search).trim().slice(0, 80));
    if (safeSearch) {
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
      ];
    }
  }

  const now = new Date();
  const isAuthorizedViewer = Boolean(req.user);
  const isStaff = req.user?.role === 'ORDER_DESK' || req.user?.role === 'ADMIN';
  const retailerId = req.user?.retailerId
    ? ((req.user.retailerId as any)._id || req.user.retailerId)
    : null;

  // Fetch products, active schemes, and retailer custom prices in parallel
  const [products, schemes, customPrices] = await Promise.all([
    Product.find(query).sort({ category: 1, name: 1 }).lean(),
    Scheme.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean(),
    retailerId
      ? RetailerPrice.find({
          retailerId,
          validFrom: { $lte: now },
          $or: [{ validTo: { $exists: false } }, { validTo: null }, { validTo: { $gte: now } }],
        }).lean()
      : Promise.resolve([]),
  ]);

  const schemeMap = new Map<string, any>();
  schemes.forEach((s) => {
    schemeMap.set(s.primaryProductId.toString(), s);
  });

  const customPriceMap = new Map<string, number>();
  customPrices.forEach((cp) => {
    customPriceMap.set(cp.productId.toString(), cp.customDealerPricePerPack);
  });

  res.setHeader('Cache-Control', 'private, no-store');

  // Format response with strict B2B price privacy for unauthenticated visitors
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
      dealerPricePerPack: isAuthorizedViewer ? effectivePackPrice : null,
      originalBasePackPrice: isAuthorizedViewer ? p.dealerPricePerPack : null,
      hasCustomPrice: isAuthorizedViewer ? customPrice !== undefined : false,
      calculatedCasePrice: isAuthorizedViewer ? effectiveCasePrice : null,
      priceRestricted: !isAuthorizedViewer,
      gstRatePercent: p.gstRatePercent,
      isGstIncluded: p.isGstIncluded ?? false,
      ...(isStaff
        ? {
            stockCasesAvailable: p.stockCasesAvailable,
            stockCasesReserved: p.stockCasesReserved,
          }
        : {}),
      availableCases: isAuthorizedViewer ? availableCases : null,
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
    const filtered = enrichedProducts.filter((p) => p.stockStatus !== 'OUT_OF_STOCK');
    res.json({
      success: true,
      count: filtered.length,
      products: filtered,
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
  const now = new Date();
  const retailerId = req.user?.retailerId
    ? ((req.user.retailerId as any)._id || req.user.retailerId)
    : null;

  const [product, scheme, customPrice] = await Promise.all([
    Product.findById(id).lean(),
    Scheme.findOne({
      primaryProductId: id,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean(),
    retailerId
      ? RetailerPrice.findOne({
          retailerId,
          productId: id,
          validFrom: { $lte: now },
          $or: [{ validTo: { $exists: false } }, { validTo: null }, { validTo: { $gte: now } }],
        }).lean()
      : Promise.resolve(null),
  ]);

  if (!product || !product.isActive) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  const isAuthorizedViewer = Boolean(req.user);
  let effectivePackPrice = product.dealerPricePerPack;
  let hasCustomPrice = false;

  if (customPrice) {
    effectivePackPrice = customPrice.customDealerPricePerPack;
    hasCustomPrice = true;
  }

  res.setHeader('Cache-Control', 'private, no-store');

  const availableCases = Math.max(0, product.stockCasesAvailable - product.stockCasesReserved);
  let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
  if (availableCases <= 0) {
    stockStatus = 'OUT_OF_STOCK';
  } else if (availableCases <= product.lowStockThresholdCases) {
    stockStatus = 'LOW_STOCK';
  }

  res.json({
    success: true,
    product: {
      _id: product._id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      packSize: product.packSize,
      hsnCode: product.hsnCode,
      unitsPerCase: product.unitsPerCase,
      caseWeightKg: product.caseWeightKg,
      mrp: product.mrp,
      dealerPricePerPack: isAuthorizedViewer ? effectivePackPrice : null,
      calculatedCasePrice: isAuthorizedViewer
        ? Math.round(effectivePackPrice * product.unitsPerCase * 100) / 100
        : null,
      hasCustomPrice: isAuthorizedViewer ? hasCustomPrice : false,
      priceRestricted: !isAuthorizedViewer,
      gstRatePercent: product.gstRatePercent,
      isGstIncluded: product.isGstIncluded ?? false,
      availableCases: isAuthorizedViewer ? availableCases : null,
      stockStatus,
      imageUrl: product.imageUrl,
      activeScheme: scheme,
    },
  });
};

export const getCategories = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const [categories, brands] = await Promise.all([
    Product.distinct('category', { isActive: true }),
    Product.distinct('brand', { isActive: true }),
  ]);

  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');

  res.json({
    success: true,
    categories,
    brands,
  });
};
