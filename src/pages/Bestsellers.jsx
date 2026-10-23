import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';

const Bestsellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/products?bestseller=true&limit=24');
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.warn('Error fetching bestsellers:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            Most Coveted
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal mb-3">
            Bestsellers
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
            Our most loved staples and timeless statements, celebrated by women across the country.
          </p>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-champagne/20 rounded-sm" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-champagne/40 rounded-sm p-6 max-w-md mx-auto">
            <p className="text-xs text-charcoal/60">Bestseller curation updating...</p>
          </div>
        )}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default Bestsellers;
