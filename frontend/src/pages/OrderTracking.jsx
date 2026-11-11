import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import {
  FiTruck,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiCreditCard,
  FiPackage,
  FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [orderQuery, setOrderQuery] = useState(initialId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialId) {
      handleTrack(initialId);
    }
  }, [initialId]);

  const handleTrack = async (targetId) => {
    const idToFetch = (targetId || orderQuery).trim();
    if (!idToFetch) {
      toast.error('Please enter your Order Number.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.get(`/orders/track/${idToFetch}`).catch(async () => {
        return await API.get(`/orders/${idToFetch}`);
      });
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (err) {
      setOrder(null);
      toast.error(err.message || 'Could not find order. Please verify your order number.');
    } finally {
      setLoading(false);
    }
  };

  // Tracking milestone stages
  const milestones = [
    { key: 'Placed', label: 'Order Placed' },
    { key: 'Confirmed', label: 'Order Confirmed' },
    { key: 'Processing', label: 'Processing' },
    { key: 'Shipped', label: 'Shipped' },
    { key: 'Out for Delivery', label: 'Out for Delivery' },
    { key: 'Delivered', label: 'Delivered' },
  ];

  const getMilestoneIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Out for Delivery':
        return 4;
      case 'Delivered':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = order ? getMilestoneIndex(order.orderStatus) : 0;

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
            Real-Time Logistics
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Track Your Order
          </h1>
          <p className="text-xs text-charcoal/70 mt-2">
            Enter your order number (e.g. DT-20260929-1001) to view status updates and courier telemetry.
          </p>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        {/* Search Input Card */}
        <div className="bg-white border border-champagne/40 rounded-sm p-6 shadow-soft mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order Number (e.g. DT-20260929-1001)"
                className="w-full bg-ivory border border-champagne px-4 py-3 pl-11 text-xs sm:text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-burgundy"
                required
              />
              <FiSearch className="absolute left-4 top-3.5 text-charcoal/50 w-5 h-5" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-burgundy hover:bg-burgundy-hover text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Order Tracking Information Display */}
        {order ? (
          <div className="bg-white border border-champagne/40 rounded-sm p-6 sm:p-8 shadow-soft space-y-8 animate-fadeIn">
            {/* Order Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-champagne/30 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-charcoal/60 tracking-wider block mb-1">
                  Active Consignment
                </span>
                <h3 className="font-mono text-xl sm:text-2xl font-bold text-burgundy">
                  {order.orderNumber}
                </h3>
                <p className="text-xs text-charcoal/60 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-charcoal/60 block">Status:</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.orderStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : order.orderStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-burgundy text-white'
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Visual Timeline Bar */}
            {order.orderStatus !== 'Cancelled' && (
              <div>
                <h4 className="font-serif font-bold text-base text-charcoal mb-6">
                  Delivery Milestones
                </h4>

                {/* Desktop Horizontal Milestone Bar */}
                <div className="hidden sm:block relative">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-ivory-dark -translate-y-1/2 z-0">
                    <div
                      className="bg-burgundy h-1 transition-all duration-500"
                      style={{
                        width: `${(currentStep / (milestones.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Milestones Grid */}
                  <div className="grid grid-cols-6 gap-4 relative z-10 text-center">
                    {milestones.map((m, idx) => {
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                              isCompleted
                                ? 'bg-burgundy text-white shadow-sm'
                                : 'bg-ivory border border-champagne text-charcoal/40'
                            } ${isCurrent ? 'ring-4 ring-rose/30 scale-110' : ''}`}
                          >
                            {isCompleted ? <FiCheckCircle className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[11px] font-semibold leading-tight ${
                              isCompleted ? 'text-charcoal' : 'text-charcoal/40'
                            }`}
                          >
                            {m.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Vertical Connected Timeline */}
                <div className="sm:hidden space-y-4 relative pl-6 before:content-[''] before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-champagne/40">
                  {milestones.map((m, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={idx} className="relative flex items-center space-x-3">
                        <div
                          className={`absolute -left-6 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] z-10 transition-all ${
                            isCompleted
                              ? 'bg-burgundy text-white shadow-xs'
                              : 'bg-white border border-champagne text-charcoal/40'
                          } ${isCurrent ? 'ring-2 ring-burgundy/40 scale-110' : ''}`}
                        >
                          {isCompleted ? <FiCheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <div className="pt-0.5">
                          <p
                            className={`text-xs font-semibold ${
                              isCompleted ? 'text-charcoal' : 'text-charcoal/40'
                            } ${isCurrent ? 'text-burgundy font-bold' : ''}`}
                          >
                            {m.label}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] text-burgundy font-medium block">Current Stage</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courier Tracking Details */}
            {order.tracking?.trackingNumber && (
              <div className="p-4 bg-champagne/15 border border-champagne rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <FiTruck className="w-6 h-6 text-burgundy shrink-0" />
                  <div>
                    <p className="font-bold text-charcoal">
                      Courier Partner: {order.tracking.courierName || 'Blue Dart Express'}
                    </p>
                    <p className="font-mono text-charcoal/70">
                      Tracking No: {order.tracking.trackingNumber}
                    </p>
                  </div>
                </div>
                {order.tracking.trackingUrl && (
                  <a
                    href={order.tracking.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-burgundy text-white px-4 py-2 text-xs font-semibold rounded-xs uppercase tracking-wider text-center"
                  >
                    View Carrier Site
                  </a>
                )}
              </div>
            )}

            {/* Consignment Items */}
            <div>
              <h4 className="font-serif font-bold text-base text-charcoal mb-4">
                Items in This Shipment ({order.items?.length || 0})
              </h4>
              <div className="divide-y divide-champagne/30 border border-champagne/40 rounded-xs">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200'}
                        alt=""
                        className="w-12 h-16 object-cover rounded-xs border border-champagne/40"
                      />
                      <div>
                        <p className="font-bold text-charcoal">{item.productName}</p>
                        <p className="text-[11px] text-charcoal/60">
                          Size: {item.size} • Colour: {item.color} • Qty: {item.quantity}
                        </p>
                        <p className="font-mono text-[10px] text-charcoal/50">SKU: {item.variantSku}</p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-burgundy">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address and Payment Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-champagne/40 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-charcoal uppercase tracking-wider flex items-center space-x-1.5">
                  <FiMapPin className="text-burgundy" />
                  <span>Delivery Address</span>
                </span>
                <p className="font-semibold text-charcoal">{order.shippingAddress?.fullName}</p>
                <p className="text-charcoal/70">{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p className="text-charcoal/70">{order.shippingAddress?.addressLine2}</p>}
                <p className="text-charcoal/70">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <p className="text-charcoal/60">Phone: {order.shippingAddress?.phone}</p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="font-bold text-charcoal uppercase tracking-wider flex items-center sm:justify-end space-x-1.5">
                  <FiCreditCard className="text-burgundy" />
                  <span>Payment Information</span>
                </span>
                <p className="text-charcoal/70">
                  Method: <strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</strong>
                </p>
                <p className="text-charcoal/70">
                  Payment Status: <strong className="text-burgundy">{order.paymentStatus}</strong>
                </p>
                <p className="font-serif font-bold text-base text-burgundy pt-1">
                  Total: ₹{order.pricing?.totalAmount?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          searched &&
          !loading && (
            <div className="text-center py-16 bg-white border border-champagne/40 rounded-sm p-8 shadow-soft">
              <FiAlertCircle className="w-12 h-12 text-rose mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-burgundy mb-2">Order Not Found</h3>
              <p className="text-xs text-charcoal/60 max-w-sm mx-auto mb-4">
                We could not locate an order matching that identifier. Please verify the order number on your confirmation receipt.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
