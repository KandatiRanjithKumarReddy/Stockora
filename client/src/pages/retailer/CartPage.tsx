import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldAlert, CheckCircle2, Gift, Loader2 } from 'lucide-react';

interface CartPageProps {
  onNavigate: (view: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { cart, calculation, isLoadingCalc, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!user) {
      onNavigate('auth');
      return;
    }

    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/orders', {
        items: cart.map((i) => ({
          productId: i.productId,
          orderedCases: i.orderedCases,
        })),
        source: 'CATALOG',
      });

      if (res.data.success) {
        setOrderSuccess(res.data.order);
        clearCart();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Order Placed Successfully!
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Order Number: <strong className="text-brand-900 dark:text-blue-400">{orderSuccess.orderNumber}</strong>
        </p>

        {orderSuccess.creditHold ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 text-left space-y-1">
            <div className="font-bold flex items-center space-x-1.5 text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Status: Placed on CREDIT HOLD (Option B)</span>
            </div>
            <p>{orderSuccess.reviewNote}</p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 text-left">
            <span>Status: <strong>SUBMITTED & STOCK RESERVED</strong>. Company A delivery team is preparing your dispatch.</span>
          </div>
        )}

        <div className="pt-4 flex justify-center space-x-3">
          <button
            onClick={() => onNavigate('my-orders')}
            className="px-5 py-2.5 rounded-xl bg-brand-900 dark:bg-brand-600 text-white text-xs font-bold shadow-sm"
          >
            View My Orders
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50"
          >
            Continue Ordering
          </button>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-dark-elevated text-slate-400 flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Your Wholesale Cart is Empty
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Add cases of biscuits, detergent, or tea from the catalog or paste your WhatsApp order.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-2.5 rounded-xl bg-brand-900 dark:bg-brand-600 text-white text-xs font-bold shadow-sm inline-flex items-center space-x-2"
        >
          <span>Browse FMCG Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Calculate potential credit exposure
  const currentBalance = user?.retailer?.outstandingBalance || 0;
  const creditLimit = user?.retailer?.creditLimit || 50000;
  const payable = calculation?.finalPayableAmount || 0;
  const projectedExposure = currentBalance + payable;
  const isCreditOverrun = projectedExposure > creditLimit;

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wholesale Checkout</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review your items, verified schemes, and tax breakdown.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 text-xs">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item Lines */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => {
            const calcItem = calculation?.items?.find((i: any) => i.sku === item.sku);

            return (
              <div
                key={item.productId}
                className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pack {item.packSize} • {item.unitsPerCase} packs/case (SKU: {item.sku})
                    </p>
                    <p className="text-xs font-semibold text-brand-700 dark:text-blue-400 mt-0.5">
                      ₹{item.calculatedCasePrice.toFixed(2)} / case
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  {/* Scheme Free Cases Badge if earned */}
                  {calcItem && calcItem.freeCases > 0 && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <Gift className="w-3.5 h-3.5" />
                      <span>+{calcItem.freeCases} Free Case</span>
                    </span>
                  )}

                  {/* Stepper */}
                  <div className="flex items-center border border-slate-200 dark:border-dark-border rounded-xl bg-slate-50 dark:bg-dark-elevated">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.orderedCases - 1)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {item.orderedCases}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.orderedCases + 1)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right w-20">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      ₹{(item.calculatedCasePrice * item.orderedCases).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Summary & Order Desk Credit Box */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Order Financials
            </h3>

            {isLoadingCalc ? (
              <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span>Computing deterministic schemes & GST...</span>
              </div>
            ) : calculation ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Gross Subtotal</span>
                  <span>₹{calculation.subtotal.toFixed(2)}</span>
                </div>

                {calculation.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Scheme Discounts</span>
                    <span>-₹{calculation.totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>CGST (Central Tax)</span>
                  <span>₹{calculation.totalCgst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>SGST (MP State Tax)</span>
                  <span>₹{calculation.totalSgst.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-dark-border flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Payable Amount
                  </span>
                  <span className="text-lg font-extrabold text-brand-900 dark:text-blue-400">
                    ₹{calculation.finalPayableAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Credit Exposure Warning */}
            {user?.retailer && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  isCreditOverrun
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-dark-elevated border-slate-200 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex justify-between font-semibold">
                  <span>Credit Limit:</span>
                  <span>₹{creditLimit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Exposure:</span>
                  <span className={isCreditOverrun ? 'font-bold text-amber-700 dark:text-amber-400' : ''}>
                    ₹{projectedExposure.toLocaleString('en-IN')}
                  </span>
                </div>
                {isCreditOverrun && (
                  <p className="text-[11px] pt-1 text-amber-700 dark:text-amber-400">
                    ⚠️ Order will submit under <strong>CREDIT HOLD</strong> for Order Desk review.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || isLoadingCalc}
              className="w-full py-3 rounded-xl bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white font-bold text-xs shadow transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reserving Stock & Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Submit FMCG Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

