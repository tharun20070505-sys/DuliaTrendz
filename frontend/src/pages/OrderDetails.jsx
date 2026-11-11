import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import {
  FiArrowLeft,
  FiPrinter,
  FiTruck,
  FiRotateCcw,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Return modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Size did not fit');
  const [returnDescription, setReturnDescription] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/orders/${id}`);
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.warn('Order fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReturn(true);
      const { data } = await API.post(`/orders/${order._id}/return`, {
        reason: returnReason,
        description: returnDescription,
      });

      if (data.success) {
        toast.success('Return request initiated. Our logistics partner will coordinate pickup.');
        setOrder(data.order);
        setReturnModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Could not request return.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="font-serif text-charcoal">Loading order consignment...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-4">
        <h2 className="font-serif text-2xl font-bold text-burgundy mb-2">Order Not Found</h2>
        <Link to="/my-orders" className="text-xs uppercase text-burgundy underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const isDelivered = order.orderStatus === 'Delivered';
  const hasReturn = order.orderStatus === 'Return Requested' || order.returnDetails?.status !== 'None';

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-champagne/40">
          <Link
            to="/my-orders"
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-burgundy"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 border border-champagne bg-white px-3 py-1.5 text-xs font-semibold rounded-xs hover:bg-champagne/20 text-charcoal"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <Link
              to={`/order-tracking?id=${order.orderNumber}`}
              className="inline-flex items-center space-x-1.5 bg-burgundy hover:bg-burgundy-hover text-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs"
            >
              <FiTruck className="w-3.5 h-3.5" />
              <span>Track Delivery</span>
            </Link>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="bg-white border border-champagne/40 rounded-sm p-4 sm:p-8 lg:p-10 shadow-soft space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-champagne/40 gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <img
                  src="/logo.png"
                  alt="Dulia Trendz Logo"
                  className="w-10 h-10 object-contain rounded-full shadow-xs"
                />
                <div>
                  <span className="font-serif text-2xl font-bold text-burgundy tracking-wider block leading-tight">
                    DULIA TRENDZ
                  </span>
                  <p className="text-[10px] text-charcoal/60 uppercase tracking-widest">
                    Official Purchase Consignment Receipt
                  </p>
                </div>
              </div>
              <p className="font-mono text-xs font-bold text-charcoal mt-2">
                Order ID: #{order.orderNumber}
              </p>
              <p className="text-xs text-charcoal/60">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-xs text-charcoal/60 uppercase block">Status</span>
              <span className="inline-block bg-burgundy text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {order.orderStatus}
              </span>
              {order.paymentMethod && (
                <p className="text-xs text-charcoal/70">
                  Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-serif font-bold text-base text-charcoal mb-4">
              Garments Purchased ({order.items?.length})
            </h3>
            <div className="divide-y divide-champagne/30 border border-champagne/40 rounded-xs">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200'}
                      alt=""
                      className="w-14 h-18 object-cover rounded-xs border border-champagne/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-charcoal text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-charcoal/70">
                        Size: <strong className="text-charcoal">{item.size}</strong> • Colour: <strong className="text-charcoal">{item.color}</strong>
                      </p>
                      <p className="font-mono text-[11px] text-charcoal/50">SKU: {item.variantSku}</p>
                      <p className="text-xs text-charcoal/60 mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-base text-burgundy self-end sm:self-auto shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-champagne/40 text-xs">
            <div className="space-y-1 sm:max-w-xs">
              <span className="font-bold text-charcoal uppercase tracking-wider block mb-1">
                Delivery Address
              </span>
              <p className="font-semibold text-charcoal">{order.shippingAddress?.fullName}</p>
              <p className="text-charcoal/70">{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p className="text-charcoal/70">{order.shippingAddress?.addressLine2}</p>}
              <p className="text-charcoal/70">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="text-charcoal/60">Phone: {order.shippingAddress?.phone}</p>
            </div>

            <div className="sm:w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.pricing?.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {order.pricing?.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Coupon ({order.pricing?.couponCode})</span>
                  <span>-₹{order.pricing?.couponDiscount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.pricing?.shippingFee === 0 ? 'FREE' : `₹${order.pricing?.shippingFee}`}</span>
              </div>
              {order.pricing?.codFee > 0 && (
                <div className="flex justify-between">
                  <span>COD Fee</span>
                  <span>₹{order.pricing?.codFee}</span>
                </div>
              )}
              <div className="pt-3 border-t border-champagne/40 flex justify-between items-baseline font-bold text-sm text-burgundy">
                <span>Total Amount</span>
                <span className="text-base font-serif">₹{order.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Return Request Button / Status */}
          <div className="pt-6 border-t border-champagne/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {hasReturn ? (
                <div className="p-3 bg-champagne/20 border border-champagne rounded-xs text-xs">
                  <p className="font-bold text-burgundy flex items-center">
                    <FiRotateCcw className="mr-1.5" /> Return Status: {order.returnDetails?.status || 'Requested'}
                  </p>
                  <p className="text-charcoal/70 mt-0.5">Reason: {order.returnDetails?.reason}</p>
                </div>
              ) : isDelivered ? (
                <p className="text-xs text-charcoal/60">
                  Delivered on {new Date(order.tracking?.deliveredAt || order.updatedAt).toLocaleDateString('en-IN')}. Eligible for 7-day return.
                </p>
              ) : (
                <p className="text-xs text-charcoal/60">
                  Return requests can be placed once parcel has been successfully marked as Delivered.
                </p>
              )}
            </div>

            {isDelivered && !hasReturn && (
              <button
                type="button"
                onClick={() => setReturnModalOpen(true)}
                className="border border-burgundy hover:bg-burgundy hover:text-white text-burgundy px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shrink-0"
              >
                Request Return / Exchange
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-champagne shadow-elevated rounded-sm max-w-md w-full p-6 relative">
            <button
              onClick={() => setReturnModalOpen(false)}
              className="absolute top-4 right-4 text-charcoal/60 hover:text-burgundy"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-burgundy mb-2">
              Request Return
            </h3>
            <p className="text-xs text-charcoal/60 mb-4">
              Select reason for return. Our courier executive will schedule pickup from your delivery address.
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Reason for Return *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                >
                  <option value="Size did not fit">Size did not fit</option>
                  <option value="Defective or damaged product">Defective or damaged product</option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="Received wrong product or color">Received wrong product or color</option>
                  <option value="Different from website image">Different from website image</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Additional Comments (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Provide any additional fitting or defect details..."
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReturn}
                className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs disabled:opacity-50"
              >
                {submittingReturn ? 'Submitting...' : 'Confirm Return Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
