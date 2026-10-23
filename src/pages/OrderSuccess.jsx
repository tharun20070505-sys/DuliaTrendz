import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import { FiCheckCircle, FiTruck, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          const { data } = await API.get(`/orders/${orderId}`);
          if (data.success && data.order) {
            setOrder(data.order);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="font-serif text-charcoal">Confirming your order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-8 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-champagne/40 rounded-sm p-5 sm:p-12 text-center shadow-soft space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <FiCheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
              Thank You For Your Order
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Order Confirmed!
            </h1>
            <p className="text-xs text-charcoal/60 mt-2">
              We have received your order and our atelier has begun preparing your items.
            </p>
          </div>

          {order && (
            <div className="p-4 bg-ivory/60 border border-champagne/40 rounded-xs text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Order Number:</span>
                <span className="font-mono font-bold text-burgundy">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Payment Method:</span>
                <span className="font-semibold text-charcoal">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Payment Status:</span>
                <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Total Amount:</span>
                <span className="font-bold text-burgundy text-sm">
                  ₹{order.pricing?.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-champagne/30 text-[11px] text-charcoal/70">
                Delivery to: <strong>{order.shippingAddress?.fullName}</strong>, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              to={`/order-tracking?id=${order?.orderNumber || orderId}`}
              className="bg-burgundy hover:bg-burgundy-hover text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center space-x-2"
            >
              <FiTruck className="w-4 h-4" />
              <span>Track Order Live</span>
            </Link>

            <Link
              to="/shop"
              className="border border-champagne hover:bg-champagne/20 text-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center space-x-2"
            >
              <FiShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
