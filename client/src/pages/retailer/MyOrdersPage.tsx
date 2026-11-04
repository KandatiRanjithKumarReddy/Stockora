import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

interface MyOrdersPageProps {
  onNavigate: (view: string) => void;
}

const formatOrderSource = (source?: string): string => {
  if (source === 'AI_WHATSAPP_PARSE') return 'Smart Order';
  if (source === 'DESK_MANUAL') return 'Order Desk';
  return 'Catalog';
};

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepeatOrder = (order: any) => {
    order.items.forEach((item: any) => {
      const skuSlug = String(item.sku || '').toLowerCase();
      addToCart(
        {
          _id: item.productId,
          sku: item.sku,
          name: item.name,
          packSize: item.packSize || '',
          unitsPerCase: item.unitsPerCaseSnapshot,
          dealerPricePerPack: item.packPriceSnapshot,
          calculatedCasePrice: item.casePriceSnapshot,
          imageUrl: skuSlug ? `/images/products/${skuSlug}.svg` : '/images/products/placeholder-case.svg',
          availableCases: 999,
        },
        item.orderedCases
      );
    });
    onNavigate('cart');
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70 text-xs font-semibold inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'CREDIT_HOLD':
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70 text-xs font-semibold inline-flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Credit Hold</span>
          </span>
        );
      case 'SYNCED_TO_TALLY':
        return (
          <span className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-800 border border-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:border-brand-800 text-xs font-semibold">
            Synced to Tally
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70 text-xs font-semibold">
            Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-dark-elevated dark:text-zinc-200 dark:border-dark-border text-xs font-semibold">
            Stock Reserved
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          My Wholesale Orders
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
          Track dispatch approval status or repeat any previous order in one tap.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3.5">
          {[1, 2].map((n) => (
            <div key={n} className="surface-card p-6 h-24 animate-pulse bg-zinc-100 dark:bg-dark-surface" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 px-4 text-center surface-card space-y-3">
          <ShoppingBag className="w-8 h-8 text-zinc-400 mx-auto" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            No wholesale orders yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Orders placed from the catalog or Smart Order will appear here.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="btn-primary mt-1"
          >
            Place First Order
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id;

            return (
              <article key={order._id} className="surface-card overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-bold font-mono text-zinc-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-2">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span>
                        {order.items.length} line{order.items.length > 1 ? 's' : ''}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span>Via {formatOrderSource(order.source)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-dark-border">
                    <div className="sm:text-right tabular-nums">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Payable</div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">
                        ₹{order.finalPayableAmount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRepeatOrder(order)}
                      className="btn-secondary min-h-[40px] px-3.5 py-2 text-xs sm:text-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Repeat Order</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(order._id)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Hide order details' : 'Show order details'}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-zinc-200 dark:border-dark-borderStrong bg-zinc-50 dark:bg-dark-elevated text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-dark-hover transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-zinc-200 dark:border-dark-border bg-zinc-50 dark:bg-dark-elevated/60 space-y-3.5 animate-fadeIn">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Itemized Voucher Lines
                    </h3>

                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-lg bg-white dark:bg-dark-surface border border-zinc-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 tabular-nums"
                        >
                          <div>
                            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {item.orderedCases} Case{item.orderedCases > 1 ? 's' : ''} × ₹
                              {item.casePriceSnapshot.toFixed(2)}
                              {item.freeCases > 0 && (
                                <span className="ml-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                                  (+{item.freeCases} Free Bonus Case)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="sm:text-right">
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                              ₹{item.netAmount.toFixed(2)}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              GST ({item.gstRatePercent}%): ₹{(item.cgstAmount + item.sgstAmount).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.creditCheck?.reviewNote && (
                      <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                        <strong className="font-semibold">Order Desk Note:</strong>{' '}
                        {order.creditCheck.reviewNote}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
