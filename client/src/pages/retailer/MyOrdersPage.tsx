import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Clock, ShoppingBag, ChevronDown, ChevronUp, RefreshCw, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface MyOrdersPageProps {
  onNavigate: (view: string) => void;
}

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
      addToCart(
        {
          _id: item.productId,
          sku: item.sku,
          name: item.name,
          packSize: item.packSize || '',
          unitsPerCase: item.unitsPerCaseSnapshot,
          dealerPricePerPack: item.packPriceSnapshot,
          calculatedCasePrice: item.casePriceSnapshot,
          imageUrl: '',
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
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved & Scheduled</span>
          </span>
        );
      case 'CREDIT_HOLD':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Credit Hold Review</span>
          </span>
        );
      case 'SYNCED_TO_TALLY':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold">
            Synced to Tally ERP
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold">
            Submitted & Reserved
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Kirana Orders</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track wholesale dispatch status and re-order previous invoices.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Loading order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border space-y-3">
          <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            No previous orders found
          </h3>
          <p className="text-xs text-slate-500">You haven't placed any wholesale FMCG orders yet.</p>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-5 py-2 rounded-xl bg-brand-900 dark:bg-brand-600 text-white text-xs font-bold shadow"
          >
            Start First Order
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id;

            return (
              <div
                key={order._id}
                className="rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs overflow-hidden"
              >
                {/* Header Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-3">
                      <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{order.items.length} Product Line(s)</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] font-semibold text-slate-400">
                        Source: {order.source}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</div>
                      <div className="text-base font-extrabold text-brand-900 dark:text-blue-400">
                        ₹{order.finalPayableAmount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRepeatOrder(order)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-elevated text-xs font-semibold flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Repeat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(order._id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Item Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-elevated/40 space-y-3 animate-fadeIn">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Snapshotted Order Breakdown
                    </h4>

                    <div className="space-y-2 text-xs">
                      {order.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border"
                        >
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {item.name}
                            </div>
                            <div className="text-slate-500 text-[11px]">
                              {item.orderedCases} Cases @ ₹{item.casePriceSnapshot} / case
                              {item.freeCases > 0 && (
                                <span className="ml-2 text-emerald-600 font-bold">
                                  (+{item.freeCases} Free Bonus Case)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900 dark:text-white">
                              ₹{item.netAmount.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              GST {item.gstRatePercent}%: ₹{(item.cgstAmount + item.sgstAmount).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Credit Review Note if Credit Hold */}
                    {order.creditCheck?.reviewNote && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-900 dark:text-amber-200">
                        <strong>Desk Note:</strong> {order.creditCheck.reviewNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

