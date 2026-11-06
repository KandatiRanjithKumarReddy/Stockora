import React, { createContext, useContext, useEffect, useState } from 'react';
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
  updateQuantity: (productId: string, cases: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
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

  const [calculation, setCalculation] = useState<CartCalculation | null>(null);
  const [isLoadingCalc, setIsLoadingCalc] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem('stockora_cart', JSON.stringify(cart));
    recalculateCart();
  }, [cart, user?.id]);

  const recalculateCart = async () => {
    if (cart.length === 0 || !user) {
      setCalculation(null);
      return;
    }

    setIsLoadingCalc(true);
    try {
      const res = await api.post('/cart/calculate', {
        items: cart.map((item) => ({
          productId: item.productId,
          orderedCases: item.orderedCases,
        })),
      });

      if (res.data.success) {
        setCalculation(res.data);
      }
    } catch {
      // Handled gracefully by CartPage summary fallback
    } finally {
      setIsLoadingCalc(false);
    }
  };

  const addToCart = (product: any, cases = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id
            ? { ...i, orderedCases: i.orderedCases + cases }
            : i
        );
      } else {
        return [
          ...prev,
          {
            productId: product._id,
            sku: product.sku,
            name: product.name,
            imageUrl: product.imageUrl,
            packSize: product.packSize,
            unitsPerCase: product.unitsPerCase,
            dealerPricePerPack: product.dealerPricePerPack,
            calculatedCasePrice: product.calculatedCasePrice,
            orderedCases: cases,
            availableCases: product.availableCases,
          },
        ];
      }
    });
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
  };

  const itemCount = cart.reduce((sum, item) => sum + item.orderedCases, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        calculation,
        isLoadingCalc,
        addToCart,
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

