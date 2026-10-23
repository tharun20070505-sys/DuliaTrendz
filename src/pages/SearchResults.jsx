import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data } = await API.get(`/products?search=${encodeURIComponent(query)}&sort=${sortBy}&limit=24`);
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.warn('Search query error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, sortBy]);

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 pb-4 border-b border-champagne/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs text-charcoal/60 uppercase tracking-widest block mb-1">
              Search Results
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-burgundy">
              Search results for "{query}"
            </h1>
            <p className="text-xs text-charcoal/70 mt-1">
              {loading ? 'Searching catalog...' : `${products.length} matching styles found`}
            </p>
          </div>

          {products.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-charcoal/60">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-champagne/60 px-3 py-1.5 text-xs font-semibold text-charcoal"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="bestseller">Bestsellers</option>
              </select>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
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
          /* Empty State */
          <div className="text-center py-20 bg-white border border-champagne/40 rounded-sm p-8 max-w-lg mx-auto shadow-soft">
            <FiSearch className="w-12 h-12 text-champagne-dark mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-burgundy mb-2">
              No matching pieces found for "{query}"
            </h3>
            <p className="text-xs text-charcoal/70 leading-relaxed mb-6">
              Please verify your spelling or try broader search terms like <em>"kurti"</em>, <em>"silk saree"</em>, <em>"dress"</em>, or <em>"linen"</em>.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/shop"
                className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase px-6 py-2.5 rounded-xs transition-colors"
              >
                Browse All Styles
              </Link>
            </div>
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

export default SearchResults;
