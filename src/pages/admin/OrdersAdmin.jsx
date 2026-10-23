import React, { useState, useEffect } from 'react';
import {
  FiShoppingBag,
  FiSearch,
  FiEye,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw,
  FiMapPin,
  FiUser,
  FiCreditCard,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Return Requested',
  'Returned',
  'Refunded',
];

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Status Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [updating, setUpdating] = useState(false);

  // Detail Modal
  const [viewingOrder, setViewingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/admin/all', {
        params: {
          page,
          limit: 15,
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      setOrders(res.data.orders || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
    setCourierName(order.tracking?.courierName || '');
    setTrackingNumber(order.tracking?.trackingNumber || '');
    setTrackingUrl(order.tracking?.trackingUrl || '');
    setAdminComment('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      await api.patch(`/orders/admin/${selectedOrder._id}/status`, {
        status: newStatus,
        paymentStatus: newPaymentStatus,
        courierName,
        trackingNumber,
        trackingUrl,
        comment: adminComment,
      });

      toast.success(`Order #${selectedOrder.orderNumber} updated!`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Customer Orders & Fulfilment</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Dispatch boutique deliveries, assign courier tracking numbers, and manage returns & COD settlements.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center space-x-2 bg-ivory border border-champagne text-charcoal hover:text-burgundy px-4 py-2 rounded-xs text-xs font-semibold"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xs border border-champagne/30 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # (e.g. DT-ORD-...), Customer Name, Email..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
          />
          <FiSearch className="absolute left-3 top-2.5 text-charcoal/40 w-4 h-4" />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto text-xs border border-champagne/50 rounded-xs px-3 py-2 bg-white text-charcoal focus:outline-hidden focus:border-burgundy"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xs border border-champagne/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal min-w-[800px]">
            <thead className="bg-ivory border-b border-champagne/40 text-[10px] uppercase font-bold tracking-wider text-charcoal/70">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Tracking</th>
                <th className="py-3 px-3 text-right">Total (₹)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne/20">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-charcoal/50">
                    Loading customer orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-charcoal/50">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const isPaid = ord.paymentStatus === 'PAID';
                  return (
                    <tr key={ord._id} className="hover:bg-ivory/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-burgundy block">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-charcoal/50">
                          {ord.items?.length || 0} items
                        </span>
                      </td>

                      <td className="py-3 px-3 text-charcoal/60 text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-charcoal block">
                          {ord.shippingAddress?.fullName || ord.customerInfo?.name || ord.customer?.name || 'Customer'}
                        </span>
                        <span className="text-[10px] text-charcoal/50">
                          {ord.shippingAddress?.phone || ord.customerInfo?.phone || ord.customer?.email || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-[11px] text-charcoal">
                            {ord.paymentMethod}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase ${
                              isPaid ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : ord.orderStatus === 'Shipped' || ord.orderStatus === 'Out for Delivery'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px]">
                        {ord.tracking?.trackingNumber ? (
                          <div>
                            <span className="font-semibold text-charcoal block">
                              {ord.tracking.courierName || 'Courier'}
                            </span>
                            <span className="font-mono text-[10px] text-charcoal/60">
                              {ord.tracking.trackingNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-charcoal/40 italic">Not Shipped</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-sm text-burgundy">
                        ₹{(ord.pricing?.totalAmount ?? ord.totalAmount ?? 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(ord)}
                            className="p-1.5 text-charcoal/60 hover:text-burgundy hover:bg-ivory rounded"
                            title="View Full Order"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openStatusModal(ord)}
                            className="p-1.5 text-burgundy hover:text-burgundy-dark hover:bg-burgundy/10 rounded"
                            title="Update Status / Tracking"
                          >
                            <FiTruck className="w-4 h-4" />
                          </button>
                        </div>
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
            Showing {orders.length} of {totalCount} orders
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

      {/* Status & Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-lg w-full border border-champagne/50 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/30 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal">Update Order Status</h3>
                <p className="text-xs text-burgundy font-mono font-bold">
                  Order #{selectedOrder.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-charcoal/40 hover:text-charcoal text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Fulfilment Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 border border-champagne/60 rounded-xs bg-white text-xs"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Payment Status</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full p-2.5 border border-champagne/60 rounded-xs bg-white text-xs"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              {/* Courier info */}
              <div className="p-3 bg-ivory rounded-xs border border-champagne/40 space-y-3">
                <span className="text-[10px] uppercase font-bold text-charcoal/70 tracking-wider block">
                  Logistics & Tracking Details
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-charcoal mb-1">Courier Partner</label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. Bluedart Express, Delhivery"
                      className="w-full p-2 border border-champagne/60 rounded-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-charcoal mb-1">Tracking AWB #</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. BD982183921"
                      className="w-full p-2 border border-champagne/60 rounded-xs bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Tracking URL (Optional)</label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://track.bluedart.com/..."
                    className="w-full p-2 border border-champagne/60 rounded-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Customer / Admin Note</label>
                <input
                  type="text"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="e.g. Handed over to courier hub for rapid dispatch."
                  className="w-full p-2 border border-champagne/60 rounded-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-champagne/30">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-champagne text-charcoal rounded-xs font-semibold hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-burgundy hover:bg-burgundy-dark text-white rounded-xs font-semibold tracking-wider uppercase shadow-xs"
                >
                  {updating ? 'Saving...' : 'Update Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Order Viewing Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-champagne/50 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/30 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  Order Details #{viewingOrder.orderNumber}
                </h3>
                <span className="text-xs text-charcoal/50">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="text-charcoal/40 hover:text-charcoal text-lg"
              >
                ✕
              </button>
            </div>

            {/* Address & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-ivory p-3.5 rounded-xs border border-champagne/40 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-charcoal/60 block mb-1">
                  Shipping Address
                </span>
                <p className="font-semibold text-charcoal">{viewingOrder.shippingAddress?.fullName}</p>
                <p className="text-charcoal/70">{viewingOrder.shippingAddress?.addressLine1}</p>
                {viewingOrder.shippingAddress?.addressLine2 && (
                  <p className="text-charcoal/70">{viewingOrder.shippingAddress?.addressLine2}</p>
                )}
                <p className="text-charcoal/70">
                  {viewingOrder.shippingAddress?.city}, {viewingOrder.shippingAddress?.state} -{' '}
                  <span className="font-mono font-bold">{viewingOrder.shippingAddress?.pincode}</span>
                </p>
                <p className="text-charcoal/70">Phone: {viewingOrder.shippingAddress?.phone}</p>
              </div>

              <div className="bg-ivory p-3.5 rounded-xs border border-champagne/40 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-charcoal/60 block mb-1">
                  Payment & Pricing
                </span>
                <p>
                  Method: <span className="font-semibold text-charcoal">{viewingOrder.paymentMethod}</span>
                </p>
                <p>
                  Status: <span className="font-bold text-burgundy">{viewingOrder.paymentStatus}</span>
                </p>
                {viewingOrder.razorpay?.paymentId && (
                  <p className="font-mono text-[10px] text-charcoal/60">
                    Payment ID: {viewingOrder.razorpay.paymentId}
                  </p>
                )}
                <div className="border-t border-champagne/30 pt-1.5 mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{(viewingOrder.pricing?.subtotal ?? viewingOrder.subtotal ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  {((viewingOrder.pricing?.couponDiscount ?? viewingOrder.discountAmount) > 0) && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({viewingOrder.pricing?.couponCode || viewingOrder.couponCode}):</span>
                      <span>-₹{(viewingOrder.pricing?.couponDiscount ?? viewingOrder.discountAmount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{(viewingOrder.pricing?.shippingFee ?? viewingOrder.shippingFee) === 0 ? 'FREE' : `₹${viewingOrder.pricing?.shippingFee ?? viewingOrder.shippingFee ?? 0}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-burgundy pt-1 border-t border-champagne/40">
                    <span>Total Paid:</span>
                    <span>₹{(viewingOrder.pricing?.totalAmount ?? viewingOrder.totalAmount ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase text-charcoal/70 tracking-wider block">
                Ordered Items ({viewingOrder.items?.length || 0})
              </span>
              <div className="border border-champagne/40 rounded-xs divide-y divide-champagne/20">
                {viewingOrder.items?.map((item, i) => (
                  <div key={i} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.productImage || item.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200'}
                        alt={item.productName || item.name}
                        className="w-12 h-16 object-cover rounded-xs border border-champagne/40"
                      />
                      <div>
                        <span className="font-semibold text-charcoal block">{item.productName || item.name}</span>
                        <span className="text-[11px] text-charcoal/60">
                          Size: <span className="font-bold">{item.size}</span> | Colour: {item.color}
                        </span>
                        <span className="text-[10px] text-charcoal/40 font-mono block">
                          SKU: {item.variantSku || item.sku}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-burgundy block">
                        ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                      </span>
                      <span className="text-xs font-semibold text-charcoal">
                        ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline history */}
            {viewingOrder.statusHistory?.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="font-bold text-xs uppercase text-charcoal/70 tracking-wider block">
                  Status Timeline & Audit
                </span>
                <div className="bg-ivory/50 p-3 rounded-xs border border-champagne/30 space-y-2 text-xs">
                  {viewingOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-start justify-between">
                      <div>
                        <span className="font-semibold text-burgundy">{h.status}</span>
                        {h.comment && <p className="text-charcoal/70 text-[11px]">{h.comment}</p>}
                      </div>
                      <span className="text-[10px] text-charcoal/40 font-mono">
                        {new Date(h.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;
