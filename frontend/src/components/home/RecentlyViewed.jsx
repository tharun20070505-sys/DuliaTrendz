import React, { useState, useEffect } from 'react';
import ProductCard from '../common/ProductCard';

const RecentlyViewed = ({ onQuickView, currentProductId }) => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dulia_recently_viewed');
      if (saved) {
        let items = JSON.parse(saved);
        if (currentProductId) {
          items = items.filter((p) => p._id !== currentProductId);
        }
        setRecentProducts(items.slice(0, 4));
      }
    } catch {
      setRecentProducts([]);
    }
  }, [currentProductId]);

  if (!recentProducts || recentProducts.length === 0) return null;

  return (
    <section className="py-14 bg-ivory border-b border-champagne/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-champagne/40">
          <div>
            <span className="text-xs uppercase tracking-widest text-burgundy font-bold block mb-1">
              Pick Up Where You Left Off
            </span>
            <h3 className="font-serif text-2xl font-bold text-charcoal">
              Recently Viewed
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recentProducts.map((product) => (
            <ProductCard key={product._id} product={product} onQuickView={onQuickView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
