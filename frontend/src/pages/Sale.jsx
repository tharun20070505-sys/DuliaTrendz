import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';

const SalePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        setLoading(true);
        // Find products with active discount or in sale collection
        const { data } = await API.get('/products?limit=24');
        if (data.success) {
          const onSale = data.products.filter((p) => p.discountPercent > 0 || p.collections?.includes('sale'));
          setProducts(onSale);
        }
      } catch (err) {
        console.warn('Error fetching sale items:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-rose font-bold block mb-2">
            Limited Seasonal Offerings
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-burgundy mb-3">
            Special Pricing Edit
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
            Curated garments available at special seasonal prices. Discover high fashion with exceptional value.
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
            <p className="text-xs text-charcoal/60">No discounted items currently available.</p>
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

export default SalePage;
