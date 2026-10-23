import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiTag, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CartPage = () => {
  const {
    cartItems,
    cartCount,
    subtotal,
    discountAmount,
    total,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    cart,
  } = useCart();

  const { settings } = useSettings();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Shipping calculation
  const freeThreshold = settings?.shipping?.freeShippingThreshold || 999;
  const standardShipping = settings?.shipping?.standardShippingFee || 99;
  const shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : standardShipping;
  const finalPayable = Math.max(0, total + shippingFee);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code.');
      return;
    }
    setCouponLoading(true);
    await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    setCouponCode('');
  };

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
            Review Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Shopping Bag ({cartCount})
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-3" />
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Bag Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Meter */}
              <div className="bg-white border border-champagne/40 rounded-sm p-4 text-xs shadow-xs">
                {subtotal >= freeThreshold ? (
                  <p className="text-emerald-800 font-semibold flex items-center justify-center">
                    🎉 You have unlocked Free Standard Delivery on this order!
                  </p>
                ) : (
                  <div>
                    <p className="text-charcoal/80 mb-2">
                      Add <strong>₹{(freeThreshold - subtotal).toLocaleString('en-IN')}</strong> more to qualify for <strong>Free Delivery</strong>.
                    </p>
                    <div className="w-full bg-ivory-dark rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-burgundy h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="bg-white border border-champagne/40 rounded-sm divide-y divide-champagne/30 shadow-soft">
                {cartItems.map((item) => (
                  <div key={item._id || item.variantSku} className="p-4 sm:p-6 flex gap-4 sm:gap-6">
                    <img
                      src={item.product?.image || item.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400'}
                      alt={item.product?.name || item.name}
                      className="w-20 sm:w-24 aspect-[3/4] object-cover object-top rounded-xs border border-champagne/40 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-charcoal/60 font-semibold block">
                              {item.product?.category || 'Dulia Trendz'}
                            </span>
                            <Link
                              to={`/product/${item.product?.slug || ''}`}
                              className="font-serif font-bold text-sm sm:text-base text-charcoal hover:text-burgundy transition-colors"
                            >
                              {item.product?.name || item.name}
                            </Link>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id || item.variantSku)}
                            className="text-charcoal/40 hover:text-red-600 p-1 transition-colors"
                            title="Remove"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Variant Attributes */}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-charcoal/70">
                          <p>
                            Size: <strong className="text-charcoal">{item.size}</strong>
                          </p>
                          <p className="flex items-center space-x-1">
                            <span>Colour:</span>
                            {item.colorCode && (
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 inline-block shadow-xs"
                                style={{ backgroundColor: item.colorCode }}
                              />
                            )}
                            <strong className="text-charcoal">{item.color}</strong>
                          </p>
                          <p className="font-mono text-[11px] text-charcoal/50">SKU: {item.variantSku}</p>
                        </div>
                      </div>

                      {/* Pricing and Quantity Controls */}
                      <div className="mt-4 pt-3 border-t border-champagne/20 flex items-center justify-between">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-champagne bg-ivory/50 rounded-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id || item.variantSku, item.quantity - 1)}
                            className="px-2.5 py-1 text-charcoal hover:bg-champagne/20 font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-bold text-charcoal">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id || item.variantSku, item.quantity + 1)}
                            className="px-2.5 py-1 text-charcoal hover:bg-champagne/20 font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <span className="font-serif text-base font-bold text-burgundy">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          {item.mrp && item.mrp > item.price && (
                            <span className="text-xs text-charcoal/40 line-through block">
                              ₹{(item.mrp * item.quantity).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  to="/shop"
                  className="text-xs text-burgundy hover:underline font-semibold uppercase tracking-wider"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right: Order Summary & Coupon */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Application Box */}
              <div className="bg-white border border-champagne/40 rounded-sm p-6 shadow-soft space-y-3">
                <h4 className="font-serif font-bold text-base text-charcoal flex items-center space-x-2">
                  <FiTag className="w-4 h-4 text-burgundy" />
                  <span>Promotional Coupon</span>
                </h4>

                {cart?.coupon ? (
                  <div className="flex items-center justify-between p-3 bg-champagne/20 border border-champagne rounded-xs">
                    <div>
                      <span className="font-mono font-bold text-xs text-burgundy uppercase block">
                        {cart.coupon.code}
                      </span>
                      <span className="text-[11px] text-emerald-800 font-semibold">
                        Discount Applied: -₹{discountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-charcoal/60 hover:text-red-600 p-1"
                      title="Remove coupon"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 uppercase font-mono bg-ivory border border-champagne px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-burgundy"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded-xs disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                <p className="text-[10px] text-charcoal/50">
                  Try <strong>WELCOME10</strong> (10% off) or <strong>DULIA20</strong> (20% off).
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="bg-white border border-champagne/40 rounded-sm p-6 shadow-soft space-y-4">
                <h4 className="font-serif font-bold text-lg text-charcoal pb-3 border-b border-champagne/30">
                  Order Summary
                </h4>

                <div className="space-y-2.5 text-xs text-charcoal/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-charcoal">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Standard Shipping</span>
                    <span>{shippingFee === 0 ? <strong className="text-emerald-800">FREE</strong> : `₹${shippingFee}`}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-champagne/40 flex justify-between items-baseline">
                  <div>
                    <span className="font-serif text-lg font-bold text-burgundy">Total Payable</span>
                    <span className="text-[10px] text-charcoal/50 block">Inclusive of all taxes</span>
                  </div>
                  <span className="font-serif text-2xl font-bold text-burgundy">
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-widest transition-all shadow-elevated flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Bag State as specifically requested in Section 54 */
          <div className="text-center py-20 bg-white border border-champagne/40 rounded-sm p-10 max-w-md mx-auto shadow-soft">
            <FiShoppingBag className="w-14 h-14 text-champagne-dark mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-burgundy mb-2">
              Your bag is waiting for something beautiful.
            </h3>
            <p className="text-xs text-charcoal/60 mb-6 leading-relaxed">
              Discover refined handwoven kurtis, breezy dresses, and elegant festive collections.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase px-7 py-3 tracking-widest rounded-xs transition-colors shadow-sm"
            >
              <span>Continue Shopping</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
