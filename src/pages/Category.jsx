import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Convert slug e.g. "ethnic-wear" to Category Name
  const formatCategoryName = (s) => {
    return s
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('Sarees Traditional', 'Sarees & Traditional');
  };

  const categoryName = formatCategoryName(slug);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setLoading(true);
        // Try fetching category details
        try {
          const { data: catData } = await API.get(`/categories/${slug}`);
          if (catData.success && catData.category) {
            setCategory(catData.category);
          }
        } catch {
          // fallback
          setCategory({
            name: categoryName,
            description: `Explore exquisite ${categoryName} designed for effortless grace and confidence.`,
            subcategories: [],
          });
        }

        // Fetch products
        let url = `/products?category=${encodeURIComponent(categoryName)}`;
        if (selectedSubcategory) {
          url += `&subcategory=${encodeURIComponent(selectedSubcategory)}`;
        }

        const { data: prodData } = await API.get(url);
        if (prodData.success) {
          setProducts(prodData.products);
        }
      } catch (err) {
        console.warn('Category fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [slug, categoryName, selectedSubcategory]);

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Category Header Banner */}
        <div className="mb-8 bg-white border border-champagne/40 rounded-sm p-8 sm:p-10 shadow-soft text-center max-w-4xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            Collection Showcase
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal mb-3">
            {category?.name || categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 max-w-lg mx-auto leading-relaxed">
            {category?.description || `Explore our handpicked curation of ${categoryName}.`}
          </p>

          {/* Subcategory Filter Pills */}
          {category?.subcategories && category.subcategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6 pt-6 border-t border-champagne/30">
              <button
                type="button"
                onClick={() => setSelectedSubcategory('')}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-colors ${
                  selectedSubcategory === ''
                    ? 'bg-burgundy text-white font-semibold'
                    : 'bg-ivory border border-champagne/60 text-charcoal hover:border-burgundy'
                }`}
              >
                All {category.name}
              </button>
              {category.subcategories.map((sub, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-colors ${
                    selectedSubcategory === sub
                      ? 'bg-burgundy text-white font-semibold'
                      : 'bg-ivory border border-champagne/60 text-charcoal hover:border-burgundy'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
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
          <div className="text-center py-20 bg-white border border-champagne/40 rounded-sm p-8 max-w-md mx-auto">
            <h3 className="font-serif text-xl font-bold text-burgundy mb-2">No Styles Available</h3>
            <p className="text-xs text-charcoal/60 mb-4">
              We are currently restocking this category. Please explore other curated collections.
            </p>
            <Link
              to="/shop"
              className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase px-5 py-2 rounded-xs"
            >
              Browse Shop
            </Link>
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

export default CategoryPage;
