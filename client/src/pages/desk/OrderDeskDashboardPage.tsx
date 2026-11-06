import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Eye,
  FileSpreadsheet,
  X,
  Loader2,
} from 'lucide-react';

const formatSourceLabel = (source?: string): string => {
  if (source === 'AI_WHATSAPP_PARSE') return 'Smart Order';
  if (source === 'DESK_MANUAL') return 'Desk Entry';
  return 'Catalog';
};

export const OrderDeskDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalOrders: 0,
    submittedCount: 0,
    creditHoldCount: 0,
    approvedCount: 0,
    exportedCount: 0,
  });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Shop-specific product alias state
  const [aliasKeyword, setAliasKeyword] = useState('');
  const [aliasSku, setAliasSku] = useState('');
  const [isSavingAlias, setIsSavingAlias] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchDeskOrders();
  }, [statusFilter, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedOrder) {
        setSelectedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOrder]);

  const fetchDeskOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/desk/orders', { params });
      if (res.data.success) {
        setOrders(res.data.orders);
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch desk orders:', err);
      toast.error('Unable to load Order Desk queue.', { id: 'desk-fetch-err' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string, note?: string) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/desk/orders/${orderId}/status`, {
        status: newStatus,
        note,
      });

      if (res.data.success) {
        const orderLabel = res.data.order?.orderNumber || selectedOrder?.orderNumber || 'Order';
        if (newStatus === 'APPROVED') {
          toast.success(`${orderLabel} approved for warehouse dispatch.`, {
            id: `desk-status-${orderId}`,
          });
        } else if (newStatus === 'REJECTED') {
          toast.warning(`${orderLabel} rejected and reserved stock released.`, {
            id: `desk-status-${orderId}`,
          });
        } else {
          toast.warning(`${orderLabel} updated to ${newStatus.replace(/_/g, ' ')}.`, {
            id: `desk-status-${orderId}`,
          });
        }

        fetchDeskOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: res.data.order.status }));
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Unable to update order status.', {
        id: 'desk-status-err',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportTallyCsv = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const response = await api.get('/desk/export/tally-csv', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stockora_tally_batch_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Tally ERP CSV exported and orders synced.', { id: 'tally-export' });
      fetchDeskOrders();
    } catch {
      toast.error('No eligible submitted or approved orders for Tally CSV export.', {
        id: 'tally-export-err',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveAlias = async () => {
    if (!aliasKeyword.trim() || !aliasSku.trim() || !selectedOrder || isSavingAlias) return;

    setIsSavingAlias(true);
    try {
      const res = await api.post('/ai/alias', {
        retailerId: selectedOrder.retailerId._id || selectedOrder.retailerId,
        rawKeyword: aliasKeyword.trim(),
        mappedSku: aliasSku.trim().toUpperCase(),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Shop alias mapping saved.', { id: 'desk-alias-save' });
        setAliasKeyword('');
        setAliasSku('');
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Could not save alias. Verify the SKU code.',
        { id: 'desk-alias-err' }
      );
    } finally {
      setIsSavingAlias(false);
    }
  };

  const openOrderDrawer = (order: any) => {
    setSelectedOrder(order);
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70 text-xs font-semibold">
            Approved
          </span>
        );
      case 'CREDIT_HOLD':
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70 text-xs font-semibold">
            Credit Hold
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-800 border border-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:border-brand-800 text-xs font-semibold">
            Submitted
          </span>
        );
      case 'SYNCED_TO_TALLY':
        return (
          <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-dark-elevated dark:text-zinc-300 dark:border-dark-borderStrong text-xs font-semibold">
            Tally Synced
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70 text-xs font-semibold">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 dark:bg-dark-elevated dark:text-zinc-300 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Order Desk Operations
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-dark-elevated text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-dark-border">
              Company A • Jabalpur
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Review incoming kirana orders, approve credit holds, map shop aliases, and export Tally ERP vouchers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportTallyCsv}
          disabled={isExporting}
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shrink-0"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          <span>Export Tally CSV</span>
        </button>
      </div>

      {/* Executive KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 tabular-nums">
        <div className="surface-card p-4">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Filtered Orders</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
            {metrics.totalOrders}
          </div>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span>Submitted</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
            {metrics.submittedCount}
          </div>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Credit Hold</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
            {metrics.creditHoldCount}
          </div>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Approved</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
            {metrics.approvedCount}
          </div>
        </div>
        <div className="surface-card p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span>Tally Synced</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
            {metrics.exportedCount}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="surface-card p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { value: 'ALL', label: 'All' },
            { value: 'SUBMITTED', label: 'Submitted' },
            { value: 'CREDIT_HOLD', label: 'Credit Hold' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'SYNCED_TO_TALLY', label: 'Tally Synced' },
            { value: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold'
                  : 'bg-zinc-100 dark:bg-dark-elevated text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or kirana shop..."
            aria-label="Search orders"
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-dark-elevated text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-dark-border">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Kirana Store</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Lines</th>
                <th className="py-3.5 px-4">Amount (₹)</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-dark-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Loading order queue...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No orders match the current filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr
                    key={ord._id}
                    className="hover:bg-zinc-50 dark:hover:bg-dark-elevated/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900 dark:text-white whitespace-nowrap">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {ord.retailerId?.storeName || 'Kirana Retailer'}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                        {ord.retailerId?.ownerName} • {ord.retailerId?.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                      {ord.items.length} line{ord.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white tabular-nums whitespace-nowrap">
                      ₹{ord.finalPayableAmount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-dark-elevated text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-dark-border">
                        {formatSourceLabel(ord.source)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{renderStatusPill(ord.status)}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openOrderDrawer(ord)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-dark-borderStrong bg-white dark:bg-dark-elevated hover:bg-zinc-50 dark:hover:bg-dark-hover text-zinc-800 dark:text-zinc-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Inspection Drawer */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-order-title"
            className="w-full max-w-lg bg-white dark:bg-dark-surface border-l border-zinc-200 dark:border-dark-border h-full overflow-y-auto p-6 space-y-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-dark-border">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 id="drawer-order-title" className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                    {selectedOrder.orderNumber}
                  </h2>
                  {renderStatusPill(selectedOrder.status)}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 tabular-nums">
                  {selectedOrder.retailerId?.storeName} • {selectedOrder.retailerId?.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-dark-elevated"
                aria-label="Close inspection panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credit Profile */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border space-y-2.5 text-sm tabular-nums">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Retailer Credit Exposure
              </h3>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Credit Limit</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  ₹{selectedOrder.creditCheck?.creditLimitSnapshot?.toLocaleString('en-IN') || '50,000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Prior Outstanding Balance</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  ₹{selectedOrder.creditCheck?.currentBalanceSnapshot?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-dark-border">
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">This Order Value</span>
                <span className="font-bold text-brand-700 dark:text-brand-400">
                  ₹{selectedOrder.finalPayableAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {selectedOrder.status === 'CREDIT_HOLD' && (
                <div className="pt-2 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Flagged for Credit Hold due to balance limit overrun.</span>
                </div>
              )}
            </div>

            {/* Original Shop Note if Submitted via Smart Order */}
            {selectedOrder.rawTextOrder && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Original Shop Order Note
                </div>
                <p className="text-sm font-mono text-zinc-800 dark:text-zinc-200">
                  &ldquo;{selectedOrder.rawTextOrder}&rdquo;
                </p>
              </div>
            )}

            {/* Line Items */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Order Line Items ({selectedOrder.items.length})
              </h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-zinc-200 dark:border-dark-border bg-white dark:bg-dark-elevated/40 space-y-1 tabular-nums"
                  >
                    <div className="flex justify-between gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                      <span>{item.name}</span>
                      <span>₹{item.netAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>
                        {item.orderedCases} Case{item.orderedCases > 1 ? 's' : ''} × ₹{item.casePriceSnapshot}/case
                        {item.freeCases > 0 && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold ml-1.5">
                            (+{item.freeCases} Free)
                          </span>
                        )}
                      </span>
                      <span>GST: ₹{(item.cgstAmount + item.sgstAmount).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shop-Specific Alias Memory Tool */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Save Shop Product Alias
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Remember this shopkeeper&apos;s local wording for future Smart Order notes.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={aliasKeyword}
                  onChange={(e) => setAliasKeyword(e.target.value)}
                  placeholder="Phrase (e.g. chhota parle)"
                  aria-label="Retailer phrase"
                  className="form-input"
                />
                <input
                  type="text"
                  value={aliasSku}
                  onChange={(e) => setAliasSku(e.target.value)}
                  placeholder="SKU (e.g. SKU-BS-075)"
                  aria-label="Target catalog SKU"
                  className="form-input font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveAlias}
                disabled={!aliasKeyword.trim() || !aliasSku.trim() || isSavingAlias}
                className="btn-secondary w-full"
              >
                {isSavingAlias ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Save Alias for This Shop</span>
              </button>
            </div>

            {/* Order Approval / Hold Actions */}
            <div className="pt-4 border-t border-zinc-200 dark:border-dark-border space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedOrder._id, 'APPROVED')}
                  disabled={
                    isUpdatingStatus ||
                    selectedOrder.status === 'APPROVED' ||
                    selectedOrder.status === 'SYNCED_TO_TALLY'
                  }
                  className="min-h-[44px] px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedOrder._id, 'REJECTED')}
                  disabled={
                    isUpdatingStatus ||
                    selectedOrder.status === 'REJECTED' ||
                    selectedOrder.status === 'APPROVED' ||
                    selectedOrder.status === 'SYNCED_TO_TALLY'
                  }
                  className="min-h-[44px] px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Order</span>
                </button>
              </div>

              {selectedOrder.status !== 'CREDIT_HOLD' &&
                selectedOrder.status !== 'APPROVED' &&
                selectedOrder.status !== 'SYNCED_TO_TALLY' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder._id, 'CREDIT_HOLD')}
                    disabled={isUpdatingStatus}
                    className="w-full min-h-[42px] px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-sm font-semibold transition-colors"
                  >
                    Place on Credit Hold
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
