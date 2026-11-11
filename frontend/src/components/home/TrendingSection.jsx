import React from 'react';
import ProductCard from '../common/ProductCard';

const TrendingSection = ({ products = [], onQuickView }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-ivory border-b border-champagne/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            In High Demand
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Trending Now
          </h2>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} onQuickView={onQuickView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
