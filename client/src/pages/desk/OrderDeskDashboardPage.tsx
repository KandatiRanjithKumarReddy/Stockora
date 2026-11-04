import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  LayoutDashboard,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Clock,
  Eye,
  FileSpreadsheet,
  Building2,
  RefreshCw,
  Loader2,
  X,
} from 'lucide-react';

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
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New alias state
  const [aliasKeyword, setAliasKeyword] = useState('');
  const [aliasSku, setAliasSku] = useState('');

  useEffect(() => {
    fetchDeskOrders();
  }, [statusFilter, search]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string, note?: string) => {
    setIsUpdatingStatus(true);
    setActionSuccessMsg(null);
    try {
      const res = await api.patch(`/desk/orders/${orderId}/status`, {
        status: newStatus,
        note,
      });

      if (res.data.success) {
        setActionSuccessMsg(`Order marked as ${newStatus}`);
        fetchDeskOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.order);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportTallyCsv = async () => {
    try {
      const response = await api.get('/desk/export/tally-csv', {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stockora_tally_batch_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      fetchDeskOrders();
    } catch (err: any) {
      alert('Failed to export Tally CSV. Ensure eligible approved orders exist.');
    }
  };

  const handleSaveAlias = async () => {
    if (!aliasKeyword || !aliasSku || !selectedOrder) return;

    try {
      const res = await api.post('/ai/alias', {
        retailerId: selectedOrder.retailerId._id || selectedOrder.retailerId,
        rawKeyword: aliasKeyword,
        mappedSku: aliasSku,
      });

      if (res.data.success) {
        alert(res.data.message);
        setAliasKeyword('');
        setAliasSku('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save alias.');
    }
  };

  const openOrderDrawer = (order: any) => {
    setSelectedOrder(order);
    setActionSuccessMsg(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Order Desk Command Center
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-bold">
              Company A, Jabalpur
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Incoming Kirana wholesale orders, credit reviews, alias mapping, and 1-click Tally ERP export.
          </p>
        </div>

        {/* Tally CSV Export Button */}
        <button
          onClick={handleExportTallyCsv}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Approved to Tally CSV</span>
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Orders</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {metrics.totalOrders}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs">
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
            Submitted & Reserved
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {metrics.submittedCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs">
          <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
            Credit Hold
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {metrics.creditHoldCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
            Approved
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.approvedCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs">
          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase">
            Exported to Tally
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {metrics.exportedCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'SUBMITTED', 'CREDIT_HOLD', 'APPROVED', 'SYNCED_TO_TALLY', 'REJECTED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  statusFilter === status
                    ? 'bg-brand-900 dark:bg-brand-600 text-white shadow-xs'
                    : 'bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Kirana shop or order..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-dark-elevated text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-dark-border">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Retailer / Kirana Store</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total (₹)</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading incoming orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders matching selected criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr
                    key={ord._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-dark-elevated/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {ord.retailerId?.storeName || 'Kirana Shop'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ord.retailerId?.ownerName} • {ord.retailerId?.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {ord.items.length} line(s)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-900 dark:text-blue-400">
                      ₹{ord.finalPayableAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {ord.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.status === 'APPROVED' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[10px]">
                          APPROVED
                        </span>
                      )}
                      {ord.status === 'CREDIT_HOLD' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-[10px]">
                          CREDIT HOLD
                        </span>
                      )}
                      {ord.status === 'SUBMITTED' && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-bold text-[10px]">
                          SUBMITTED
                        </span>
                      )}
                      {ord.status === 'SYNCED_TO_TALLY' && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-[10px]">
                          TALLY SYNCED
                        </span>
                      )}
                      {ord.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-[10px]">
                          REJECTED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderDrawer(ord)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-elevated text-slate-700 dark:text-slate-200 font-semibold hover:border-brand-500 inline-flex items-center space-x-1"
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

      {/* Order Inspection Slide-Over Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-dark-surface border-l border-slate-200 dark:border-dark-border h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-dark-border">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Order {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedOrder.retailerId?.storeName} ({selectedOrder.retailerId?.phone})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Credit Profile Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-border space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Retailer Credit Status
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Credit Limit:</span>
                <span className="font-bold">
                  ₹{selectedOrder.creditCheck?.creditLimitSnapshot?.toLocaleString('en-IN') || '50,000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Outstanding:</span>
                <span className="font-bold">
                  ₹{selectedOrder.creditCheck?.currentBalanceSnapshot?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1.5">
                <span className="text-slate-500">This Order Amount:</span>
                <span className="font-bold text-brand-700 dark:text-blue-400">
                  ₹{selectedOrder.finalPayableAmount?.toLocaleString('en-IN')}
                </span>
              </div>

              {selectedOrder.status === 'CREDIT_HOLD' && (
                <div className="pt-2 text-amber-700 dark:text-amber-400 font-semibold flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Placed on Credit Hold due to limit overrun.</span>
                </div>
              )}
            </div>

            {/* Original Raw Message if AI Source */}
            {selectedOrder.rawTextOrder && (
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs space-y-1">
                <div className="font-bold text-brand-900 dark:text-blue-300">Original WhatsApp Text:</div>
                <div className="font-mono text-slate-700 dark:text-slate-300">
                  "{selectedOrder.rawTextOrder}"
                </div>
              </div>
            )}

            {/* Line Items */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Snapshotted Products ({selectedOrder.items.length})
              </h4>
              <div className="space-y-2 text-xs">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface space-y-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span>{item.name}</span>
                      <span>₹{item.netAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>
                        {item.orderedCases} Cases @ ₹{item.casePriceSnapshot}/case
                        {item.freeCases > 0 && (
                          <span className="text-emerald-600 font-bold ml-1.5">
                            (+{item.freeCases} Free Case)
                          </span>
                        )}
                      </span>
                      <span>GST: ₹{(item.cgstAmount + item.sgstAmount).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Alias Learning Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-border space-y-2">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Save Retailer Alias Mapping
              </h4>
              <p className="text-[11px] text-slate-500">
                Teach the system this retailer's colloquial wording for future AI orders.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={aliasKeyword}
                  onChange={(e) => setAliasKeyword(e.target.value)}
                  placeholder="e.g. biscuit chhota"
                  className="p-2 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100"
                />
                <input
                  type="text"
                  value={aliasSku}
                  onChange={(e) => setAliasSku(e.target.value)}
                  placeholder="e.g. SKU-BS-075"
                  className="p-2 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100"
                />
              </div>
              <button
                onClick={handleSaveAlias}
                disabled={!aliasKeyword || !aliasSku}
                className="w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 disabled:opacity-40"
              >
                Save Alias
              </button>
            </div>

            {/* Triage Actions */}
            <div className="pt-2 border-t border-slate-200 dark:border-dark-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'APPROVED')}
                  disabled={isUpdatingStatus || selectedOrder.status === 'APPROVED'}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Order</span>
                </button>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'REJECTED')}
                  disabled={isUpdatingStatus || selectedOrder.status === 'REJECTED'}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Order</span>
                </button>
              </div>

              {selectedOrder.status !== 'CREDIT_HOLD' && (
                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'CREDIT_HOLD')}
                  disabled={isUpdatingStatus}
                  className="w-full py-2 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-bold"
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

