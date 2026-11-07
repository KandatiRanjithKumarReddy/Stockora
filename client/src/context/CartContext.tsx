import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  imageUrl: string;
  packSize: string;
  unitsPerCase: number;
  dealerPricePerPack: number;
  calculatedCasePrice: number;
  orderedCases: number;
  availableCases: number;
  gstRatePercent?: number;
  activeScheme?: {
    _id?: string;
    name: string;
    schemeType: 'BUY_X_GET_Y_FREE' | 'SLAB_PERCENT_DISCOUNT';
    buyQuantity?: number;
    freeQuantity?: number;
    minSlabQuantity?: number;
    discountPercentage?: number;
    isActive?: boolean;
  } | null;
}

export interface CartCalculation {
  subtotal: number;
  totalDiscount: number;
  totalCgst: number;
  totalSgst: number;
  totalTax: number;
  finalPayableAmount: number;
  items: any[];
  stockWarnings: any[];
}

interface CartContextType {
  cart: CartItem[];
  calculation: CartCalculation | null;
  isLoadingCalc: boolean;
  addToCart: (product: any, cases?: number) => void;
  addItemsBatch: (entries: { product: any; cases: number }[]) => void;
  updateQuantity: (productId: string, cases: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
}

/**
 * Deterministic client-side mirror of server/src/services/schemeEngine.ts.
 * Provides <1ms instant subtotal, trade scheme, CGST/SGST, and net payable preview
 * while the authoritative /cart/calculate response syncs in the background.
 */
function computeClientCartPreview(items: CartItem[]): CartCalculation | null {
  if (items.length === 0) return null;

  let subtotal = 0;
  let totalDiscount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  const processedItems: any[] = [];
  const stockWarnings: any[] = [];

  for (const item of items) {
    if (item.orderedCases <= 0) continue;

    if (typeof item.availableCases === 'number' && item.orderedCases > item.availableCases) {
      stockWarnings.push({
        sku: item.sku,
        name: item.name,
        requested: item.orderedCases,
        available: item.availableCases,
        message: `Only ${item.availableCases} cases of ${item.name} in warehouse stock (requested ${item.orderedCases})`,
      });
    }

    const packPrice = item.dealerPricePerPack;
    const casePrice = Math.round(packPrice * item.unitsPerCase * 100) / 100;
    const grossAmount = Math.round(casePrice * item.orderedCases * 100) / 100;

    let freeCases = 0;
    let discountPercent = 0;
    let discountAmount = 0;
    let appliedSchemeId = undefined;
    let appliedSchemeName = undefined;

    const scheme = item.activeScheme;
    if (scheme && scheme.isActive !== false) {
      if (scheme.schemeType === 'BUY_X_GET_Y_FREE' && (scheme.buyQuantity || 0) > 0) {
        const multiplier = Math.floor(item.orderedCases / (scheme.buyQuantity as number));
        freeCases = multiplier * (scheme.freeQuantity || 0);
        appliedSchemeId = scheme._id;
        appliedSchemeName = scheme.name;
      } else if (
        scheme.schemeType === 'SLAB_PERCENT_DISCOUNT' &&
        item.orderedCases >= (scheme.minSlabQuantity || 0)
      ) {
        discountPercent = scheme.discountPercentage || 0;
        discountAmount = Math.round((grossAmount * (discountPercent / 100)) * 100) / 100;
        appliedSchemeId = scheme._id;
        appliedSchemeName = scheme.name;
      }
    }

    const taxableAmount = Math.round((grossAmount - discountAmount) * 100) / 100;
    const gstRate = item.gstRatePercent || 5.0;
    const halfGst = gstRate / 2;
    const cgstAmount = Math.round((taxableAmount * (halfGst / 100)) * 100) / 100;
    const sgstAmount = Math.round((taxableAmount * (halfGst / 100)) * 100) / 100;
    const netAmount = Math.round((taxableAmount + cgstAmount + sgstAmount) * 100) / 100;

    subtotal += grossAmount;
    totalDiscount += discountAmount;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;

    processedItems.push({
      productId: item.productId,
      sku: item.sku,
      name: item.name,
      orderedCases: item.orderedCases,
      unitsPerCaseSnapshot: item.unitsPerCase,
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
  const finalPayableAmount = Math.round(subtotal - totalDiscount + totalTax);

  return {
    subtotal,
    totalDiscount,
    totalCgst,
    totalSgst,
    totalTax,
    finalPayableAmount,
    items: processedItems,
    stockWarnings,
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('stockora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [calculation, setCalculation] = useState<CartCalculation | null>(() =>
    computeClientCartPreview(cart)
  );
  const [isLoadingCalc, setIsLoadingCalc] = useState(false);
  const { user } = useAuth();
  const prevUserIdRef = useRef<string | undefined>(user?.id);

  // Clear cart on account sign-out or retailer switch to protect retailer-specific shop pricing
  useEffect(() => {
    if (prevUserIdRef.current && prevUserIdRef.current !== user?.id) {
      setCart([]);
      setCalculation(null);
      try {
        localStorage.removeItem('stockora_cart');
      } catch {}
    }
    prevUserIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem('stockora_cart', JSON.stringify(cart));
    } catch {}

    if (cart.length === 0 || !user) {
      setCalculation(cart.length > 0 ? computeClientCartPreview(cart) : null);
      setIsLoadingCalc(false);
      return;
    }

    // 1. Instant <1ms deterministic preview so UI never blanks out
    setCalculation(computeClientCartPreview(cart));

    // 2. Debounced, cancellable authoritative server sync (stock, custom prices, live schemes)
    const controller = new AbortController();
    setIsLoadingCalc(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await api.post(
          '/cart/calculate',
          {
            items: cart.map((item) => ({
              productId: item.productId,
              orderedCases: item.orderedCases,
            })),
          },
          { signal: controller.signal }
        );

        if (!controller.signal.aborted && res.data.success) {
          setCalculation(res.data);
        }
      } catch {
        // Ignore aborted requests or transient network errors; deterministic preview remains visible
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCalc(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [cart, user?.id]);

  const buildCartItem = (product: any, cases: number): CartItem => {
    const packPrice = Number(product.dealerPricePerPack) || 0;
    const unitsPerCase = Number(product.unitsPerCase) || 1;
    const casePrice =
      typeof product.calculatedCasePrice === 'number'
        ? product.calculatedCasePrice
        : Math.round(packPrice * unitsPerCase * 100) / 100;

    return {
      productId: product._id,
      sku: product.sku,
      name: product.name,
      imageUrl: product.imageUrl,
      packSize: product.packSize || '',
      unitsPerCase,
      dealerPricePerPack: packPrice,
      calculatedCasePrice: casePrice,
      orderedCases: cases,
      availableCases: typeof product.availableCases === 'number' ? product.availableCases : 999,
      gstRatePercent: product.gstRatePercent,
      activeScheme: product.activeScheme || null,
    };
  };

  const addItemsBatch = (entries: { product: any; cases: number }[]) => {
    if (!entries || entries.length === 0) return;

    setCart((prev) => {
      const next = [...prev];
      for (const { product, cases } of entries) {
        if (!product?._id || cases <= 0) continue;
        const idx = next.findIndex((i) => i.productId === product._id);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            orderedCases: next[idx].orderedCases + cases,
            dealerPricePerPack: product.dealerPricePerPack ?? next[idx].dealerPricePerPack,
            calculatedCasePrice: product.calculatedCasePrice ?? next[idx].calculatedCasePrice,
            availableCases:
              typeof product.availableCases === 'number'
                ? product.availableCases
                : next[idx].availableCases,
            gstRatePercent: product.gstRatePercent ?? next[idx].gstRatePercent,
            activeScheme:
              product.activeScheme !== undefined ? product.activeScheme : next[idx].activeScheme,
          };
        } else {
          next.push(buildCartItem(product, cases));
        }
      }
      return next;
    });
  };

  const addToCart = (product: any, cases = 1) => {
    addItemsBatch([{ product, cases }]);
  };

  const updateQuantity = (productId: string, cases: number) => {
    if (cases <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, orderedCases: cases } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCalculation(null);
    setIsLoadingCalc(false);
  };

  const itemCount = cart.reduce((sum, item) => sum + item.orderedCases, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        calculation,
        isLoadingCalc,
        addToCart,
        addItemsBatch,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

