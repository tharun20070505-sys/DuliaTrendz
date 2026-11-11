import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedFabric, setSelectedFabric] = useState(searchParams.get('fabric') || '');
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get('occasion') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  // Data States
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Sync state from URL query params
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedSubcategory(searchParams.get('subcategory') || '');
    setSelectedSize(searchParams.get('size') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedOccasion(searchParams.get('occasion') || '');
    if (searchParams.get('sort')) setSortBy(searchParams.get('sort'));
  }, [searchParams]);

  // Fetch Products with filters
  const fetchFilteredProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
      if (selectedSize) params.append('size', selectedSize);
      if (selectedColor) params.append('color', selectedColor);
      if (selectedFabric) params.append('fabric', selectedFabric);
      if (selectedOccasion) params.append('occasion', selectedOccasion);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (inStockOnly) params.append('inStock', 'true');
      if (sortBy) params.append('sort', sortBy);
      params.append('page', page);
      params.append('limit', 12);

      const { data } = await API.get(`/products?${params.toString()}`);
      if (data.success) {
        setProducts(data.products);
        setTotalProducts(data.total);
        setTotalPages(data.pages);
      }
    } catch (err) {
      console.warn('Error fetching products:', err.message);
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedSize,
    selectedColor,
    selectedFabric,
    selectedOccasion,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
    page,
  ]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedSize('');
    setSelectedColor('');
    setSelectedFabric('');
    setSelectedOccasion('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const categoriesList = [
    'Ethnic Wear',
    'Western Wear',
    'Co-ord Sets',
    'Sarees & Traditional',
    'Bottom Wear',
    'Occasion Wear',
  ];

  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
  const colorsList = ['Blush Pink', 'Burgundy', 'Ivory', 'Champagne', 'Black', 'Wine', 'Teal', 'Blue', 'Gold'];
  const fabricsList = ['Cotton', 'Silk', 'Linen', 'Chanderi', 'Organza', 'Velvet', 'Crepe', 'Denim'];
  const occasionsList = ['Casual', 'Workwear', 'Festive', 'Wedding', 'Vacation', 'Party'];

  // Sidebar Filter Component (used in desktop sidebar and mobile drawer)
  const FilterContent = () => (
    <div className="space-y-6 text-xs text-charcoal">
      <div className="flex items-center justify-between pb-3 border-b border-champagne/40">
        <span className="font-serif font-bold text-base text-burgundy">Filters</span>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-charcoal/60 hover:text-burgundy flex items-center space-x-1"
        >
          <FiRefreshCw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Category */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2.5">Category</h4>
        <div className="space-y-1.5">
          {categoriesList.map((cat, idx) => (
            <label key={idx} className="flex items-center space-x-2 cursor-pointer hover:text-burgundy">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat}
                onChange={() => {
                  setSelectedCategory(selectedCategory === cat ? '' : cat);
                  setSelectedSubcategory('');
                  setPage(1);
                }}
                className="text-burgundy focus:ring-burgundy"
              />
              <span className={selectedCategory === cat ? 'font-bold text-burgundy' : ''}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2.5">Price Range (₹)</h4>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="w-20 bg-white border border-champagne/60 px-2 py-1 text-xs"
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="w-20 bg-white border border-champagne/60 px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2.5">Sizes</h4>
        <div className="flex flex-wrap gap-1.5">
          {sizesList.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedSize(selectedSize === s ? '' : s);
                setPage(1);
              }}
              className={`px-2.5 py-1 border rounded-xs transition-colors ${
                selectedSize === s
                  ? 'bg-burgundy text-white border-burgundy'
                  : 'bg-white text-charcoal border-champagne/60 hover:border-burgundy'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2.5">Colours</h4>
        <div className="flex flex-wrap gap-1.5">
          {colorsList.map((col, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedColor(selectedColor === col ? '' : col);
                setPage(1);
              }}
              className={`px-2.5 py-1 border rounded-xs transition-colors ${
                selectedColor === col
                  ? 'bg-burgundy text-white border-burgundy'
                  : 'bg-white text-charcoal border-champagne/60 hover:border-burgundy'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2.5">Fabric</h4>
        <div className="space-y-1.5">
          {fabricsList.map((fab, idx) => (
            <label key={idx} className="flex items-center space-x-2 cursor-pointer hover:text-burgundy">
              <input
                type="checkbox"
                checked={selectedFabric === fab}
                onChange={() => {
                  setSelectedFabric(selectedFabric === fab ? '' : fab);
                  setPage(1);
                }}
                className="rounded text-burgundy focus:ring-burgundy"
              />
              <span className={selectedFabric === fab ? 'font-bold text-burgundy' : ''}>{fab}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Occasion */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2.5">Occasion</h4>
        <div className="space-y-1.5">
          {occasionsList.map((occ, idx) => (
            <label key={idx} className="flex items-center space-x-2 cursor-pointer hover:text-burgundy">
              <input
                type="checkbox"
                checked={selectedOccasion === occ}
                onChange={() => {
                  setSelectedOccasion(selectedOccasion === occ ? '' : occ);
                  setPage(1);
                }}
                className="rounded text-burgundy focus:ring-burgundy"
              />
              <span className={selectedOccasion === occ ? 'font-bold text-burgundy' : ''}>{occ}</span>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="pt-2 border-t border-champagne/40">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded text-burgundy focus:ring-burgundy"
          />
          <span className="font-medium">In Stock Items Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <span className="text-xs text-charcoal/60 uppercase tracking-widest block mb-1">
            Home / Shop All
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-burgundy">
            {selectedCategory || 'Women’s Fashion Catalogue'}
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Showing {totalProducts} sophisticated styles curated for modern elegance.
          </p>
        </div>

        {/* Toolbar: Mobile Filter Trigger & Desktop Sort */}
        <div className="bg-white border border-champagne/40 p-4 rounded-sm mb-8 flex items-center justify-between shadow-xs">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-burgundy"
          >
            <FiFilter className="w-4 h-4" />
            <span>Filters ({[selectedCategory, selectedSize, selectedColor, selectedFabric, selectedOccasion].filter(Boolean).length})</span>
          </button>

          <div className="hidden lg:flex items-center space-x-2 text-xs text-charcoal/70">
            <span>Active filters:</span>
            {[selectedCategory, selectedSubcategory, selectedSize, selectedColor, selectedFabric, selectedOccasion].filter(Boolean).length === 0 ? (
              <span className="italic">None</span>
            ) : (
              <button onClick={resetFilters} className="text-burgundy underline font-medium">
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-charcoal/60 hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-ivory border border-champagne/60 px-3 py-1.5 text-xs font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-burgundy"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="bestseller">Bestsellers</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>

        {/* Layout Grid: Sidebar (Desktop) + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 bg-white border border-champagne/40 p-6 rounded-sm shadow-soft self-start sticky top-28">
            <FilterContent />
          </aside>

          {/* Product Listing Grid: 4 cols desktop, 3 tablet, 2 mobile */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-champagne/20 rounded-sm" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-2">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 border border-champagne text-xs font-semibold uppercase tracking-wider rounded-xs disabled:opacity-40 hover:bg-burgundy hover:text-white transition-colors"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 text-xs font-bold rounded-xs transition-colors ${
                          page === i + 1
                            ? 'bg-burgundy text-white'
                            : 'border border-champagne/60 hover:bg-champagne/20'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 border border-champagne text-xs font-semibold uppercase tracking-wider rounded-xs disabled:opacity-40 hover:bg-burgundy hover:text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-20 bg-white border border-champagne/40 rounded-sm p-8">
                <FiSearch className="w-12 h-12 text-champagne-dark mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-burgundy mb-2">
                  No Matching Styles Found
                </h3>
                <p className="text-xs text-charcoal/60 max-w-sm mx-auto mb-6">
                  We couldn't find any products matching your current filters. Try relaxing your selections or reset to explore all.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-burgundy hover:bg-burgundy-hover text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-ivory-light shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-champagne/50 mb-4">
              <span className="font-serif text-lg font-bold text-burgundy">Filter Styles</span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="text-charcoal hover:text-burgundy"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <FilterContent />
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full bg-burgundy text-white py-3 text-xs font-semibold uppercase tracking-widest rounded-xs"
            >
              Apply Filters ({totalProducts} Items)
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default Shop;
