import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { ProductImage } from '../../components/common/ProductImage';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Gift,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface CartPageProps {
  onNavigate: (view: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { cart, calculation, isLoadingCalc, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  const handleRemoveItem = (item: any) => {
    removeFromCart(item.productId);
    toast.info(`Removed ${item.name} from cart.`, { id: `cart-rm-${item.sku}` });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.warning('Please sign in to place your wholesale order.', { id: 'cart-signin-warn' });
      onNavigate('auth');
      return;
    }

    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    let smartOrderRaw: string | undefined;
    try {
      const savedRaw = sessionStorage.getItem('stockora_smart_order_raw');
      if (savedRaw) smartOrderRaw = savedRaw;
    } catch {}

    try {
      const res = await api.post('/orders', {
        items: cart.map((i) => ({
          productId: i.productId,
          orderedCases: i.orderedCases,
        })),
        source: smartOrderRaw ? 'AI_WHATSAPP_PARSE' : 'CATALOG',
        ...(smartOrderRaw ? { rawTextOrder: smartOrderRaw } : {}),
      });

      if (res.data.success) {
        try {
          sessionStorage.removeItem('stockora_smart_order_raw');
        } catch {}
        const placedOrder = res.data.order;
        setOrderSuccess(placedOrder);
        clearCart();

        if (placedOrder.creditHold) {
          toast.warning(
            `Order ${placedOrder.orderNumber} submitted under Credit Hold.`,
            { id: 'order-placed' }
          );
        } else {
          toast.success(
            `Order ${placedOrder.orderNumber} placed successfully!`,
            { id: 'order-placed' }
          );
        }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Unable to submit order. Please review stock and try again.',
        { id: 'order-submit-error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmation State
  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="surface-card p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Wholesale Order Submitted
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Voucher Reference:{' '}
              <strong className="font-mono text-zinc-900 dark:text-white">
                {orderSuccess.orderNumber}
              </strong>
            </p>
          </div>

          {orderSuccess.creditHold ? (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 text-sm text-amber-900 dark:text-amber-200 text-left space-y-1.5">
              <div className="font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Pending Credit Limit Review</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">{orderSuccess.reviewNote}</p>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-sm text-emerald-900 dark:text-emerald-200 text-left">
              Stock has been reserved in the Richhai warehouse and queued for dispatch processing.
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('my-orders')}
              className="btn-primary"
            >
              View Order History
            </button>
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="btn-secondary"
            >
              Continue Ordering
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-14">
        <div className="surface-card p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-xl bg-zinc-100 dark:bg-dark-elevated text-zinc-400 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              Your Wholesale Cart is Empty
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Add cartons from the wholesale catalog or paste your shop&apos;s order list into Smart Order.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="btn-primary"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ai-order')}
              className="btn-secondary"
            >
              Open Smart Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentBalance = user?.retailer?.outstandingBalance || 0;
  const creditLimit = user?.retailer?.creditLimit || 50000;
  const payable = calculation?.finalPayableAmount || 0;
  const projectedExposure = currentBalance + payable;
  const isCreditOverrun = projectedExposure > creditLimit;
  const stockWarnings = calculation?.stockWarnings || [];

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Wholesale Checkout
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
          Verify case quantities, automatic trade schemes, and itemized GST before submitting.
        </p>
      </div>

      {stockWarnings.length > 0 && (
        <div
          role="status"
          className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 text-sm space-y-1.5"
        >
          <div className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Warehouse Stock Notice</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            {stockWarnings.map((w: any) => (
              <li key={w.sku}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Lines */}
        <div className="lg:col-span-8 space-y-3.5">
          {cart.map((item) => {
            const calcItem = calculation?.items?.find((i: any) => i.sku === item.sku);

            return (
              <div
                key={item.productId}
                className="surface-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <ProductImage
                    sku={item.sku}
                    src={item.imageUrl}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover bg-zinc-100 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border shrink-0"
                  />
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-white leading-snug">
                      {item.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                      {item.sku} {item.packSize ? `• ${item.packSize}` : ''} • {item.unitsPerCase} packs/case
                    </p>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5 tabular-nums">
                      ₹{item.calculatedCasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / case (Excl. GST)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-dark-border">
                  {calcItem && calcItem.freeCases > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tabular-nums">
                      <Gift className="w-3.5 h-3.5" />
                      <span>+{calcItem.freeCases} Free Case</span>
                    </span>
                  )}

                  <div className="inline-flex items-center rounded-lg border border-zinc-300 dark:border-dark-borderStrong bg-zinc-50 dark:bg-dark-elevated">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.orderedCases - 1)}
                      aria-label={`Decrease quantity for ${item.name}`}
                      className="min-w-[38px] min-h-[40px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-dark-hover rounded-l-lg"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                      {item.orderedCases}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.orderedCases + 1)}
                      aria-label={`Increase quantity for ${item.name}`}
                      className="min-w-[38px] min-h-[40px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-dark-hover rounded-r-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[92px] tabular-nums">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      ₹{(item.calculatedCasePrice * item.orderedCases).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    {calcItem && calcItem.discountAmount > 0 && (
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        -₹{calcItem.discountAmount.toFixed(2)} scheme
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item)}
                    className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Invoice Summary & Credit Check */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 surface-card p-6 space-y-5">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Order Summary
          </h2>

          {isLoadingCalc ? (
            <div className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Calculating schemes & GST...</span>
            </div>
          ) : calculation ? (
            <dl className="space-y-2.5 text-sm tabular-nums">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <dt>Base Subtotal (Excl. GST)</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-200">
                  ₹{calculation.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </dd>
              </div>

              {calculation.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                  <dt>Trade Scheme Savings</dt>
                  <dd>-₹{calculation.totalDiscount.toFixed(2)}</dd>
                </div>
              )}

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <dt>CGST</dt>
                <dd>₹{calculation.totalCgst.toFixed(2)}</dd>
              </div>

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <dt>SGST (MP)</dt>
                <dd>₹{calculation.totalSgst.toFixed(2)}</dd>
              </div>

              <div className="pt-3.5 border-t border-zinc-200 dark:border-dark-border flex justify-between items-baseline">
                <dt className="text-base font-bold text-zinc-900 dark:text-white">
                  Net Payable (Incl. GST)
                </dt>
                <dd className="text-xl font-bold text-zinc-900 dark:text-white">
                  ₹{calculation.finalPayableAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
            </dl>
          ) : null}

          {/* Credit Exposure Card */}
          {user?.retailer && (
            <div
              className={`p-3.5 rounded-lg border text-xs sm:text-sm space-y-1.5 tabular-nums ${
                isCreditOverrun
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200'
                  : 'bg-zinc-50 dark:bg-dark-elevated border-zinc-200 dark:border-dark-border text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <div className="flex justify-between">
                <span>Authorized Credit Limit</span>
                <span className="font-semibold">₹{creditLimit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Projected Balance</span>
                <span className={isCreditOverrun ? 'font-bold text-amber-800 dark:text-amber-300' : 'font-medium'}>
                  ₹{projectedExposure.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              {isCreditOverrun && (
                <div className="pt-1.5 border-t border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Exceeds credit limit—your order will be submitted under{' '}
                    <strong>Credit Hold</strong> for Order Desk review.
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || isLoadingCalc || stockWarnings.length > 0}
            className="btn-primary w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Reserving Stock...</span>
              </>
            ) : (
              <>
                <span>{user ? 'Confirm & Place Order' : 'Sign In to Place Order'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </aside>
      </div>
    </div>
  );
};
