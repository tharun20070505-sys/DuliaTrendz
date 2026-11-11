import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiEye, FiShoppingBag } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onQuickView }) => {
  const { isInWishlist, addToWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  if (!product) return null;

  const isFavorited = isInWishlist(product._id);
  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600';
  const secondaryImage = product.images?.[1]?.url || primaryImage;

  // Extract unique colors & sizes from variants
  const uniqueColors = Array.from(
    new Set(product.variants?.map((v) => JSON.stringify({ color: v.color, colorCode: v.colorCode })))
  ).map((c) => JSON.parse(c));

  const availableSizes = Array.from(new Set(product.variants?.map((v) => v.size) || []));

  // Check overall stock
  const isOutOfStock = product.variants && product.variants.every((v) => v.stock === 0);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize) {
      if (onQuickView) {
        onQuickView(product);
      } else {
        toast.error('Please select a size first.');
      }
      return;
    }

    const matchedVariant = product.variants.find((v) => v.size === selectedSize && v.stock > 0);
    if (!matchedVariant) {
      toast.error(`Size ${selectedSize} is currently out of stock.`);
      return;
    }

    addToCart(product, matchedVariant, selectedSize, matchedVariant.color, 1);
  };

  return (
    <div
      className="group relative bg-white border border-champagne/40 rounded-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-elevated hover:border-champagne"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ivory/50">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={hovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges: New, Bestseller, Discount */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.newArrival && (
            <span className="bg-burgundy text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-sm">
              New
            </span>
          )}
          {product.bestseller && (
            <span className="bg-champagne-dark text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-sm">
              Bestseller
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="bg-rose text-white text-[10px] font-bold px-2 py-0.5 tracking-wider shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-charcoal text-white text-[10px] font-bold px-2 py-0.5 tracking-wider">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addToWishlist(product);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${
            isFavorited
              ? 'bg-burgundy text-white'
              : 'bg-white/80 backdrop-blur-sm text-charcoal hover:bg-burgundy hover:text-white'
          }`}
          aria-label="Add to Wishlist"
        >
          <FiHeart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onQuickView) onQuickView(product);
            }}
            className="flex-1 bg-white/95 hover:bg-burgundy hover:text-white text-charcoal py-2 px-3 text-xs font-semibold uppercase tracking-wider shadow-md backdrop-blur-sm transition-colors flex items-center justify-center space-x-1.5"
          >
            <FiEye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Subcategory */}
          <p className="text-[9.5px] sm:text-[11px] uppercase tracking-wider text-charcoal/60 mb-0.5 sm:mb-1 font-medium truncate">
            {product.subcategory || product.category}
          </p>

          {/* Product Name */}
          <Link
            to={`/product/${product.slug}`}
            className="font-serif text-xs sm:text-sm font-semibold text-charcoal hover:text-burgundy line-clamp-1 transition-colors"
          >
            {product.name}
          </Link>

          {/* Color Indicators */}
          {uniqueColors.length > 0 && (
            <div className="flex items-center space-x-1 sm:space-x-1.5 mt-1.5 sm:mt-2">
              {uniqueColors.slice(0, 4).map((col, idx) => (
                <span
                  key={idx}
                  title={col.color}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-300 inline-block shadow-xs"
                  style={{ backgroundColor: col.colorCode || '#292524' }}
                />
              ))}
              {uniqueColors.length > 4 && (
                <span className="text-[9px] sm:text-[10px] text-charcoal/60 font-medium">
                  +{uniqueColors.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Available Sizes Pills */}
          {availableSizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2.5">
              {availableSizes.slice(0, 5).map((s, idx) => {
                const variantForSize = product.variants?.find((v) => v.size === s);
                const hasStock = variantForSize && variantForSize.stock > 0;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!hasStock}
                    onClick={() => setSelectedSize(s)}
                    className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 border rounded-xs transition-colors ${
                      selectedSize === s
                        ? 'border-burgundy bg-burgundy text-white'
                        : hasStock
                        ? 'border-champagne/60 text-charcoal hover:border-burgundy'
                        : 'border-gray-200 text-gray-300 line-through cursor-not-allowed'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
              {availableSizes.length > 5 && (
                <span className="text-[9px] text-charcoal/50 self-center">
                  +{availableSizes.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-2.5 sm:mt-3 pt-2 border-t border-champagne/30 flex items-baseline justify-between gap-1">
          <div className="flex items-baseline space-x-1.5 sm:space-x-2 flex-wrap">
            <span className="font-serif text-sm sm:text-base font-bold text-burgundy whitespace-nowrap">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-[10px] sm:text-xs text-charcoal/50 line-through whitespace-nowrap">
                ₹{product.mrp?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            title={selectedSize ? `Add size ${selectedSize} to bag` : 'Select size first'}
            className="text-burgundy hover:text-charcoal p-1 transition-colors shrink-0"
            aria-label="Add to bag"
          >
            <FiShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
