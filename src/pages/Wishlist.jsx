import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiShoppingBag, FiHeart, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    // Pick first available variant with stock
    const availableVariant = product.variants?.find((v) => v.stock > 0);
    if (!availableVariant) {
      toast.error('This product is currently out of stock.');
      return;
    }

    addToCart(product, availableVariant, availableVariant.size, availableVariant.color, 1);
    removeFromWishlist(product._id);
  };

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
            Saved Favorites
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            My Wishlist ({wishlist.length})
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-3" />
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {wishlist.map((item) => {
              const product = item.product || item;
              if (!product || !product.name) return null;

              const isOutOfStock = product.variants?.every((v) => v.stock === 0);

              return (
                <div
                  key={product._id}
                  className="bg-white border border-champagne/40 rounded-sm overflow-hidden flex flex-col justify-between shadow-soft hover:shadow-elevated transition-shadow"
                >
                  <div className="relative aspect-[3/4] bg-ivory">
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600'}
                        alt={product.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full text-charcoal/70 hover:text-red-600 transition-colors shadow-xs"
                      title="Remove from wishlist"
                    >
                      <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    {isOutOfStock && (
                      <div className="absolute bottom-2 left-2 right-2 bg-charcoal/90 text-white text-[10px] sm:text-[11px] font-bold py-1 text-center uppercase tracking-wider">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[9.5px] sm:text-[10px] uppercase tracking-wider text-charcoal/60 font-semibold block mb-0.5 sm:mb-1 truncate">
                        {product.category}
                      </span>
                      <Link
                        to={`/product/${product.slug}`}
                        className="font-serif text-xs sm:text-sm font-bold text-charcoal hover:text-burgundy line-clamp-1 mb-1.5 sm:mb-2"
                      >
                        {product.name}
                      </Link>
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
                    </div>

                    <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-champagne/30">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleMoveToCart(product)}
                        className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center space-x-1 sm:space-x-1.5 rounded-xs"
                      >
                        <FiShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-champagne/40 rounded-sm p-8 max-w-md mx-auto shadow-soft">
            <FiHeart className="w-12 h-12 text-champagne-dark mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-bold text-burgundy mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-xs text-charcoal/60 mb-6 leading-relaxed">
              Explore our boutique collection and save your favorite garments for later.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase px-6 py-3 tracking-widest rounded-xs transition-colors"
            >
              <span>Explore Collection</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
