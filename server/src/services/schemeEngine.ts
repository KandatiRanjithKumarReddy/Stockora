import { IProduct } from '../models/Product.js';
import { IScheme } from '../models/Scheme.js';
import { IOrderItem } from '../models/Order.js';

export interface CartInputItem {
  productId: string;
  orderedCases: number;
}

export interface CalculationResult {
  items: IOrderItem[];
  subtotal: number;
  totalDiscount: number;
  totalCgst: number;
  totalSgst: number;
  totalTax: number;
  finalPayableAmount: number;
}

/**
 * Deterministic Scheme & Pricing Engine
 * Calculates gross amounts, applies Buy-X-Get-Y schemes or Slab discounts,
 * computes per-SKU HSN CGST/SGST, and rounds to the nearest rupee.
 * 
 * Strict rule: NEVER allows AI to calculate financial numbers.
 */
export function calculateOrderFinancials(
  inputItems: { product: IProduct; orderedCases: number; activeScheme?: IScheme | null; customDealerPricePerPack?: number }[]
): CalculationResult {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  const processedItems: IOrderItem[] = [];

  for (const item of inputItems) {
    const { product, orderedCases, activeScheme, customDealerPricePerPack } = item;

    if (orderedCases <= 0) continue;

    // 1. Pack-to-Case Price Derivation
    const packPrice = customDealerPricePerPack !== undefined && customDealerPricePerPack >= 0
      ? customDealerPricePerPack
      : product.dealerPricePerPack;

    const casePrice = Math.round(packPrice * product.unitsPerCase * 100) / 100;
    const grossAmount = Math.round(casePrice * orderedCases * 100) / 100;

    let freeCases = 0;
    let discountPercent = 0;
    let discountAmount = 0;
    let appliedSchemeId = undefined;
    let appliedSchemeName = undefined;

    // 2. Scheme Calculations
    if (activeScheme && activeScheme.isActive) {
      if (activeScheme.schemeType === 'BUY_X_GET_Y_FREE' && activeScheme.buyQuantity > 0) {
        // e.g. Buy 10 cases get 1 case free
        const multiplier = Math.floor(orderedCases / activeScheme.buyQuantity);
        freeCases = multiplier * activeScheme.freeQuantity;
        appliedSchemeId = activeScheme._id as any;
        appliedSchemeName = activeScheme.name;
      } else if (
        activeScheme.schemeType === 'SLAB_PERCENT_DISCOUNT' &&
        orderedCases >= activeScheme.minSlabQuantity
      ) {
        // e.g. 3% off on 5 or more cases
        discountPercent = activeScheme.discountPercentage;
        discountAmount = Math.round((grossAmount * (discountPercent / 100)) * 100) / 100;
        appliedSchemeId = activeScheme._id as any;
        appliedSchemeName = activeScheme.name;
      }
    }

    // 3. Taxable Subtotal
    const taxableAmount = Math.round((grossAmount - discountAmount) * 100) / 100;

    // 4. Per-SKU GST Treatment (GST-exclusive)
    const gstRate = product.gstRatePercent || 5.0;
    const halfGst = gstRate / 2;
    const cgstAmount = Math.round((taxableAmount * (halfGst / 100)) * 100) / 100;
    const sgstAmount = Math.round((taxableAmount * (halfGst / 100)) * 100) / 100;
    const netAmount = Math.round((taxableAmount + cgstAmount + sgstAmount) * 100) / 100;

    subtotal += grossAmount;
    totalDiscount += discountAmount;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;

    processedItems.push({
      productId: product._id as any,
      sku: product.sku,
      name: product.name,
      hsnCode: product.hsnCode,
      orderedCases,
      unitsPerCaseSnapshot: product.unitsPerCase,
      packPriceSnapshot: packPrice,
      casePriceSnapshot: casePrice,
      grossAmount,
      freeCases,
      appliedSchemeId,
      appliedSchemeName,
      discountPercent,
      discountAmount,
      taxableAmount,
      gstRatePercent: gstRate,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      netAmount,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  totalDiscount = Math.round(totalDiscount * 100) / 100;
  totalCgst = Math.round(totalCgst * 100) / 100;
  totalSgst = Math.round(totalSgst * 100) / 100;
  const totalTax = Math.round((totalCgst + totalSgst) * 100) / 100;
  const rawPayable = subtotal - totalDiscount + totalTax;
  const finalPayableAmount = Math.round(rawPayable);

  return {
    items: processedItems,
    subtotal,
    totalDiscount,
    totalCgst,
    totalSgst,
    totalTax,
    finalPayableAmount,
  };
}

