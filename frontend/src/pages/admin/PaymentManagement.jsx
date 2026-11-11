import React, { useState, useEffect } from 'react';
import {
  FiCreditCard,
  FiSearch,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiClock,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingCOD: 0, totalTransactions: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/admin/all', {
        params: {
          page,
          limit: 15,
          search: search || undefined,
          status: statusFilter || undefined,
          method: methodFilter || undefined,
        },
      });
      setPayments(res.data.payments || []);
      setStats(res.data.stats || { totalRevenue: 0, pendingCOD: 0, totalTransactions: 0 });
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load payment ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter, methodFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Payment & Settlement Ledger</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Real-time Razorpay signature verified receipts, COD collections, and refund logs.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchPayments}
          className="inline-flex items-center space-x-2 bg-ivory border border-champagne text-charcoal hover:text-burgundy px-4 py-2 rounded-xs text-xs font-semibold"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xs border border-champagne/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal/60">Verified Online Paid</span>
            <div className="p-2 rounded bg-emerald-50 text-emerald-700">
              <FiCheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-burgundy">
              ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-charcoal/50 block mt-0.5">
              Razorpay HMAC-SHA256 verified
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xs border border-champagne/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal/60">Pending COD Collections</span>
            <div className="p-2 rounded bg-amber-50 text-amber-700">
              <FiClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-charcoal">
              ₹{(stats.pendingCOD || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-charcoal/50 block mt-0.5">
              Payable upon parcel delivery
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xs border border-champagne/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal/60">Recorded Transactions</span>
            <div className="p-2 rounded bg-ivory text-burgundy border border-champagne/50">
              <FiCreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-charcoal">
              {stats.totalTransactions || 0}
            </span>
            <span className="text-[10px] text-charcoal/50 block mt-0.5">
              All payment attempts
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xs border border-champagne/30 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # (DT-ORD-...), Razorpay Payment ID (pay_...)"
            className="w-full pl-9 pr-4 py-2 text-xs border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
          />
          <FiSearch className="absolute left-3 top-2.5 text-charcoal/40 w-4 h-4" />
        </form>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-champagne/50 rounded-xs px-3 py-2 bg-white text-charcoal focus:outline-hidden focus:border-burgundy"
          >
            <option value="">All Methods</option>
            <option value="ONLINE">Razorpay ONLINE</option>
            <option value="COD">Cash on Delivery</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-champagne/50 rounded-xs px-3 py-2 bg-white text-charcoal focus:outline-hidden focus:border-burgundy"
          >
            <option value="">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xs border border-champagne/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal min-w-[780px]">
            <thead className="bg-ivory border-b border-champagne/40 text-[10px] uppercase font-bold tracking-wider text-charcoal/70">
              <tr>
                <th className="py-3 px-4">Transaction / Order #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Patron</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Razorpay ID</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne/20">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal/50">
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal/50">
                    No transactions match criteria.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isPaid = p.status === 'PAID';
                  const isPending = p.status === 'PENDING';
                  return (
                    <tr key={p._id} className="hover:bg-ivory/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-burgundy block">
                          {p.orderNumber}
                        </span>
                        <span className="text-[10px] text-charcoal/40 font-mono">
                          ID: {p._id.slice(-6)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-charcoal/60 text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-charcoal block">
                          {p.user?.name || 'Customer'}
                        </span>
                        <span className="text-[10px] text-charcoal/50">{p.user?.email || 'N/A'}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`font-bold text-[11px] px-2 py-0.5 rounded ${
                            p.method === 'ONLINE'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-ivory text-charcoal border border-champagne/60'
                          }`}
                        >
                          {p.method === 'ONLINE' ? 'Razorpay' : 'Cash on Delivery'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[10px] text-charcoal/60">
                        {p.razorpayPaymentId || p.razorpayOrderId || '—'}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-sm text-burgundy">
                        ₹{(p.amount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-ivory/50 border-t border-champagne/30 flex items-center justify-between text-xs text-charcoal/60">
          <span>
            Showing {payments.length} of {totalCount} records
          </span>
          <div className="flex space-x-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 border border-champagne/50 rounded-xs disabled:opacity-40 hover:bg-white"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-semibold text-charcoal">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 border border-champagne/50 rounded-xs disabled:opacity-40 hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
