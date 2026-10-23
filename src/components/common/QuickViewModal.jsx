import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiHeart, FiShoppingBag, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      const firstVariant = product.variants?.[0];
      if (firstVariant) {
        setSelectedColor(firstVariant.color);
        setSelectedSize(firstVariant.size);
      }
      setActiveImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const isFavorited = isInWishlist(product._id);
  const images = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900' }];

  // Available colors
  const availableColors = Array.from(
    new Set(product.variants?.map((v) => JSON.stringify({ color: v.color, colorCode: v.colorCode })))
  ).map((c) => JSON.parse(c));

  // Sizes for selected color
  const variantsForColor = product.variants?.filter((v) => !selectedColor || v.color === selectedColor) || [];
  const currentVariant = product.variants?.find(
    (v) => (!selectedColor || v.color === selectedColor) && v.size === selectedSize
  );

  const stock = currentVariant ? currentVariant.stock : 0;

  // Stock status text
  let stockBadge = null;
  if (!currentVariant || stock === 0) {
    stockBadge = <span className="text-red-600 font-semibold flex items-center text-xs"><FiAlertCircle className="mr-1" /> Out of Stock</span>;
  } else if (stock <= (product.lowStockThreshold || 5)) {
    stockBadge = <span className="text-amber-600 font-semibold flex items-center text-xs"><FiAlertCircle className="mr-1" /> Only {stock} left in stock</span>;
  } else {
    stockBadge = <span className="text-emerald-700 font-semibold flex items-center text-xs"><FiCheck className="mr-1" /> In Stock</span>;
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please choose a size.');
      return;
    }
    if (stock <= 0) {
      toast.error('This size is currently out of stock.');
      return;
    }
    addToCart(product, currentVariant, selectedSize, selectedColor || currentVariant.color, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    if (!selectedSize || stock <= 0) {
      toast.error('Please choose an available size.');
      return;
    }
    addToCart(product, currentVariant, selectedSize, selectedColor || currentVariant.color, quantity);
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-ivory-light border border-champagne shadow-elevated rounded-sm max-w-3xl w-full p-4 sm:p-6 animate-fadeIn max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal/60 hover:text-burgundy focus:outline-none z-10"
          aria-label="Close"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images Area */}
          <div>
            <div className="aspect-[3/4] bg-white border border-champagne/40 rounded-sm overflow-hidden mb-3">
              <img
                src={images[activeImageIndex]?.url}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-18 shrink-0 rounded-xs overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-burgundy' : 'border-champagne/50 opacity-70'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Area */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-charcoal/60 font-semibold mb-1">
                {product.category} • {product.subcategory}
              </p>

              <h2 className="font-serif text-2xl font-bold text-burgundy mb-2">
                {product.name}
              </h2>

              <p className="text-xs text-charcoal/60 mb-3">
                SKU: <span className="font-mono text-charcoal">{currentVariant?.sku || product.sku}</span>
              </p>

              {/* Price */}
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="font-serif text-2xl font-bold text-burgundy">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-sm text-charcoal/50 line-through">
                      ₹{product.mrp?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs bg-rose/20 text-burgundy font-bold px-2 py-0.5 rounded">
                      {product.discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs text-charcoal/80 leading-relaxed mb-4 line-clamp-3">
                {product.shortDescription || product.description}
              </p>

              {/* Color Selector */}
              {availableColors.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-semibold text-charcoal block mb-1.5">
                    Color: <span className="font-normal text-charcoal/70">{selectedColor}</span>
                  </span>
                  <div className="flex gap-2">
                    {availableColors.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(c.color)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedColor === c.color ? 'border-burgundy scale-110' : 'border-transparent'
                        }`}
                        title={c.color}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-gray-300 block shadow-inner"
                          style={{ backgroundColor: c.colorCode || '#000000' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-charcoal">
                    Select Size: <span className="font-normal text-burgundy font-bold">{selectedSize}</span>
                  </span>
                  <div>{stockBadge}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variantsForColor.map((v, idx) => {
                    const isAvail = v.stock > 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!isAvail}
                        onClick={() => setSelectedSize(v.size)}
                        className={`px-3 py-1.5 text-xs font-semibold border rounded-xs transition-colors ${
                          selectedSize === v.size
                            ? 'bg-burgundy text-white border-burgundy'
                            : isAvail
                            ? 'bg-white text-charcoal border-champagne hover:border-burgundy'
                            : 'bg-gray-100 text-gray-300 border-gray-200 line-through cursor-not-allowed'
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-xs font-semibold text-charcoal">Quantity:</span>
                <div className="flex items-center border border-champagne bg-white rounded-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-charcoal hover:bg-champagne/20"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-charcoal">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
                    className="px-2.5 py-1 text-charcoal hover:bg-champagne/20 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-champagne/40">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={stock <= 0}
                  onClick={handleAddToCart}
                  className="flex-1 bg-burgundy hover:bg-burgundy-hover text-white py-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <FiShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
                <button
                  type="button"
                  onClick={() => addToWishlist(product)}
                  className={`p-2.5 border border-champagne rounded-xs transition-colors ${
                    isFavorited ? 'bg-burgundy text-white' : 'text-charcoal hover:bg-champagne/20'
                  }`}
                  aria-label="Wishlist"
                >
                  <FiHeart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                disabled={stock <= 0}
                onClick={handleBuyNow}
                className="w-full bg-champagne hover:bg-champagne-dark text-charcoal font-semibold py-2.5 text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Buy Now
              </button>

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="block text-center text-xs text-burgundy hover:underline pt-2 font-medium"
              >
                View Full Product Details & Specifications →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
