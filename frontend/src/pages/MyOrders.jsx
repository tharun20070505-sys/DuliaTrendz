import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { FiPackage, FiTruck, FiArrowRight, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/orders/my-orders');
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.warn('My orders fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you wish to cancel this order?')) return;
    try {
      const { data } = await API.patch(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by customer',
      });
      if (data.success) {
        toast.success('Order cancelled successfully.');
        setOrders(orders.map((o) => (o._id === orderId ? data.order : o)));
      }
    } catch (err) {
      toast.error(err.message || 'Could not cancel order.');
    }
  };

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
            Order Archive
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            My Orders ({orders.length})
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-3" />
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white border border-champagne/40 rounded-sm" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const canCancel = ['Pending', 'Confirmed'].includes(order.orderStatus);

              return (
                <div
                  key={order._id}
                  className="bg-white border border-champagne/40 rounded-sm p-6 shadow-soft space-y-4"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-champagne/30 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-burgundy text-sm sm:text-base">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
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
                      <p className="text-[11px] text-charcoal/60 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-serif font-bold text-lg text-burgundy">
                        ₹{order.pricing?.totalAmount?.toLocaleString('en-IN')}
                      </span>
                      <Link
                        to={`/order-tracking?id=${order.orderNumber}`}
                        className="text-xs font-semibold uppercase tracking-wider bg-ivory hover:bg-champagne/20 text-charcoal px-3 py-1.5 border border-champagne rounded-xs flex items-center space-x-1"
                      >
                        <FiTruck className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </Link>
                    </div>
                  </div>

                  {/* Items list preview */}
                  <div className="divide-y divide-champagne/20">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.productImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200'}
                            alt=""
                            className="w-12 h-16 object-cover rounded-xs border border-champagne/40"
                          />
                          <div>
                            <p className="font-bold text-charcoal">{item.productName}</p>
                            <p className="text-[11px] text-charcoal/60">
                              Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-burgundy">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Action buttons */}
                  <div className="pt-3 border-t border-champagne/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-[11px] text-charcoal/60">
                      Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                    </div>

                    <div className="flex gap-2">
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-700 hover:text-red-800 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-xs font-semibold transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}

                      <Link
                        to={`/orders/${order._id}`}
                        className="bg-burgundy hover:bg-burgundy-hover text-white px-4 py-1.5 rounded-xs font-semibold uppercase tracking-wider transition-colors flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-champagne/40 rounded-sm p-8 max-w-md mx-auto shadow-soft">
            <FiPackage className="w-12 h-12 text-champagne-dark mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-bold text-burgundy mb-2">No Orders Placed Yet</h3>
            <p className="text-xs text-charcoal/60 mb-6 leading-relaxed">
              When you purchase garments from Dulia Trendz, your orders and real-time shipping telemetry will appear here.
            </p>
            <Link
              to="/shop"
              className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase px-6 py-2.5 rounded-xs"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
