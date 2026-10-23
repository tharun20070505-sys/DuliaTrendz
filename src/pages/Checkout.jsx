import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';
import {
  FiLock,
  FiTruck,
  FiCreditCard,
  FiDollarSign,
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, subtotal, discountAmount, total, clearCart, cart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Payment Selection: 'ONLINE' or 'COD'
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [processing, setProcessing] = useState(false);

  // Sync user profile if available
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!email) setEmail(user.email || '');
      if (!phone) setPhone(user.phone || '');
      if (user.addresses && user.addresses.length > 0) {
        setSavedAddresses(user.addresses);
        const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        if (def) {
          setSelectedAddressId(def._id);
          applySavedAddress(def);
        }
      }
    }
  }, [user]);

  // Empty cart guard
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const applySavedAddress = (addr) => {
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setLandmark(addr.landmark || '');
  };

  // Fees calculations
  const freeThreshold = settings?.shipping?.freeShippingThreshold || 999;
  const standardShipping = settings?.shipping?.standardShippingFee || 99;
  const shippingFee = subtotal >= freeThreshold ? 0 : standardShipping;
  const codFee = paymentMethod === 'COD' ? settings?.cod?.codFee || 49 : 0;
  const finalPayable = Math.max(0, total + shippingFee + codFee);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.error('Please complete all required delivery address fields.');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      toast.error('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    try {
      setProcessing(true);

      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.product?._id || item.product,
          variantSku: item.variantSku,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price,
          name: item.product?.name || item.name,
        })),
        shippingAddress: {
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode: pincode.trim(),
          landmark,
        },
        paymentMethod,
        couponCode: cart?.coupon?.code,
      };

      // 1. Create order on backend
      const { data: orderData } = await API.post('/orders', orderPayload);
      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.message || 'Failed to place order.');
      }

      const order = orderData.order;

      // 2. CASH ON DELIVERY FLOW
      if (paymentMethod === 'COD') {
        clearCart();
        toast.success('Order placed successfully via Cash on Delivery!');
        navigate(`/order-success/${order._id}`, { state: { order } });
        return;
      }

      // 3. ONLINE PAYMENT (RAZORPAY) FLOW
      const { data: payOrderData } = await API.post('/payments/create-order', {
        orderId: order._id,
      });

      if (!payOrderData.success) {
        throw new Error(payOrderData.message || 'Failed to initialize payment gateway.');
      }

      const { razorpayOrder, keyId } = payOrderData;

      // If in simulation mode or Razorpay window is simulated
      if (razorpayOrder.mode === 'simulation' || !window.Razorpay) {
        // Direct simulation confirmation
        console.log('Completing payment in simulated demonstration mode...');
        const { data: verifyData } = await API.post('/payments/verify', {
          orderId: order._id,
          razorpayOrderId: razorpayOrder.id,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'simulated_signature_valid',
        });

        if (verifyData.success) {
          clearCart();
          toast.success('Online payment completed successfully!');
          navigate(`/order-success/${order._id}`, { state: { order: verifyData.order } });
        }
        return;
      }

      // Real Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Dulia Trendz',
        image: '/logo.png',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: fullName,
          email: email || user?.email,
          contact: phone,
        },
        theme: {
          color: '#641F36', // Brand Burgundy
        },
        handler: async function (response) {
          try {
            const { data: verifyData } = await API.post('/payments/verify', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyData.success) {
              clearCart();
              toast.success('Payment verified! Order placed.');
              navigate(`/order-success/${order._id}`, { state: { order: verifyData.order } });
            }
          } catch (verErr) {
            toast.error(verErr.message || 'Payment verification failed.');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled. Your order remains pending.');
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Something went wrong during checkout.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
            Secure Transaction
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal">
            Checkout
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-3" />
        </div>

        <form onSubmit={handleCheckoutSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Customer & Address Details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Customer Contact Box */}
              <div className="bg-white border border-champagne/40 rounded-sm p-4 sm:p-6 shadow-soft space-y-4">
                <h3 className="font-serif font-bold text-lg text-charcoal pb-2 border-b border-champagne/30">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-charcoal block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address Box */}
              <div className="bg-white border border-champagne/40 rounded-sm p-4 sm:p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-champagne/30">
                  <h3 className="font-serif font-bold text-lg text-charcoal">
                    2. Delivery Address
                  </h3>
                  {savedAddresses.length > 0 && (
                    <span className="text-xs text-burgundy font-semibold">
                      {savedAddresses.length} saved addresses
                    </span>
                  )}
                </div>

                {/* Saved Address Selector */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <span className="text-xs font-semibold text-charcoal block">Choose Saved Address:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          onClick={() => {
                            setSelectedAddressId(addr._id);
                            applySavedAddress(addr);
                          }}
                          className={`p-3 border rounded-xs cursor-pointer text-xs transition-colors ${
                            selectedAddressId === addr._id
                              ? 'border-burgundy bg-burgundy/5'
                              : 'border-champagne/60 hover:border-burgundy'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-burgundy">
                            <span>{addr.fullName}</span>
                            <span className="text-[10px] uppercase bg-champagne/30 px-1.5 py-0.5 rounded">
                              {addr.addressType}
                            </span>
                          </div>
                          <p className="text-charcoal/80 mt-1 line-clamp-1">{addr.addressLine1}</p>
                          <p className="text-charcoal/60 text-[11px]">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Address Inputs */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Street Address Line 1 *</label>
                    <input
                      type="text"
                      placeholder="House / Flat No., Apartment, Street"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      required
                      className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="Area, Sector, Colony"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-charcoal block mb-1">City / District *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-charcoal block mb-1">State *</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-charcoal block mb-1">Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                        className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near City Center Mall"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white border border-champagne/40 rounded-sm p-4 sm:p-6 shadow-soft space-y-4">
                <h3 className="font-serif font-bold text-lg text-charcoal pb-2 border-b border-champagne/30">
                  3. Payment Method
                </h3>

                <div className="space-y-3">
                  {/* Option 1: Online Payment (Razorpay) */}
                  <label
                    className={`flex items-start space-x-3 p-4 border rounded-sm cursor-pointer transition-colors ${
                      paymentMethod === 'ONLINE'
                        ? 'border-burgundy bg-burgundy/5'
                        : 'border-champagne/60 hover:border-burgundy'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="mt-1 text-burgundy focus:ring-burgundy"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal text-sm flex items-center space-x-2">
                          <FiCreditCard className="w-4 h-4 text-burgundy" />
                          <span>Online Payment (Razorpay Secure)</span>
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-charcoal/60 mt-1">
                        Pay via UPI (GPay, PhonePe, Paytm), Credit / Debit Cards, Net Banking, or Supported Wallets.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  {settings?.cod?.enabled && (
                    <label
                      className={`flex items-start space-x-3 p-4 border rounded-sm cursor-pointer transition-colors ${
                        paymentMethod === 'COD'
                          ? 'border-burgundy bg-burgundy/5'
                          : 'border-champagne/60 hover:border-burgundy'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="mt-1 text-burgundy focus:ring-burgundy"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-charcoal text-sm flex items-center space-x-2">
                            <FiDollarSign className="w-4 h-4 text-burgundy" />
                            <span>Cash on Delivery (COD)</span>
                          </span>
                          <span className="text-[10px] text-charcoal/60">
                            +₹{settings.cod.codFee || 49} convenience fee
                          </span>
                        </div>
                        <p className="text-charcoal/60 mt-1">
                          Pay in cash or UPI directly upon parcel arrival at your doorstep.
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-champagne/40 rounded-sm p-4 sm:p-6 shadow-soft space-y-4">
                <h4 className="font-serif font-bold text-lg text-charcoal pb-3 border-b border-champagne/30">
                  Review Bag ({cartItems.length} Items)
                </h4>

                {/* Items Mini List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-champagne/30 no-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item._id || item.variantSku} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <img
                          src={item.product?.image || item.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200'}
                          alt=""
                          className="w-10 h-12 object-cover rounded-xs border border-champagne/40 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-charcoal truncate">{item.product?.name || item.name}</p>
                          <p className="text-[10px] text-charcoal/60">
                            Qty: {item.quantity} • {item.size} • {item.color}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-burgundy shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Calculation Breakdown */}
                <div className="pt-3 border-t border-champagne/40 space-y-2 text-xs text-charcoal/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? <strong className="text-emerald-800">FREE</strong> : `₹${shippingFee}`}</span>
                  </div>
                  {paymentMethod === 'COD' && (
                    <div className="flex justify-between">
                      <span>COD Fee</span>
                      <span>₹{codFee}</span>
                    </div>
                  )}
                </div>

                {/* Final Total */}
                <div className="pt-4 border-t border-champagne/40 flex justify-between items-baseline">
                  <div>
                    <span className="font-serif text-lg font-bold text-burgundy">Total Payable</span>
                    <span className="text-[10px] text-charcoal/50 block">All taxes included</span>
                  </div>
                  <span className="font-serif text-2xl font-bold text-burgundy">
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-widest transition-all shadow-elevated flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <FiLock className="w-4 h-4" />
                  <span>
                    {processing
                      ? 'Processing...'
                      : paymentMethod === 'COD'
                      ? `Place COD Order (₹${finalPayable.toLocaleString('en-IN')})`
                      : `Pay ₹${finalPayable.toLocaleString('en-IN')}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
