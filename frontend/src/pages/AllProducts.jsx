import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import QuickViewModal from '../components/common/QuickViewModal';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiRefreshCw,
  FiSearch,
  FiGrid,
  FiList,
  FiSliders,
  FiShoppingBag,
  FiHeart,
  FiCheck,
} from 'react-icons/fi';

const CATEGORIES = [
  { name: 'All Styles', value: '' },
  { name: 'Ethnic Wear', value: 'Ethnic Wear' },
  { name: 'Western Wear', value: 'Western Wear' },
  { name: 'Co-ord Sets', value: 'Co-ord Sets' },
  { name: 'Sarees & Traditional', value: 'Sarees & Traditional' },
  { name: 'Bottom Wear', value: 'Bottom Wear' },
  { name: 'Occasion Wear', value: 'Occasion Wear' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

const COLORS = [
  { name: 'Blush Pink', hex: '#F8BBD0' },
  { name: 'Burgundy', hex: '#6B1D2F' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Champagne', hex: '#F7E7CE' },
  { name: 'Black', hex: '#1C1917' },
  { name: 'Wine', hex: '#722F37' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Navy', hex: '#000080' },
];

const FABRICS = ['Cotton', 'Silk', 'Linen', 'Chanderi', 'Organza', 'Velvet', 'Crepe', 'Georgette', 'Denim'];

const OCCASIONS = ['Casual', 'Workwear', 'Festive', 'Wedding', 'Vacation', 'Party'];

const AllProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [page, setPage] = useState(1);

  // Data states
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { isInWishlist, addToWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Synchronize state when URL query params change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedSubcategory(searchParams.get('subcategory') || '');
    setSelectedSize(searchParams.get('size') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedOccasion(searchParams.get('occasion') || '');
    if (searchParams.get('sort')) setSortBy(searchParams.get('sort'));
    if (searchParams.get('q')) setSearchKeyword(searchParams.get('q'));
  }, [searchParams]);

  // Fetch all filtered products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchKeyword.trim()) params.append('search', searchKeyword.trim());
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
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.warn('Error fetching all products:', err.message);
    } finally {
      setLoading(false);
    }
  }, [
    searchKeyword,
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
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const resetAllFilters = () => {
    setSearchKeyword('');
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

  const activeFiltersCount = [
    searchKeyword,
    selectedCategory,
    selectedSubcategory,
    selectedSize,
    selectedColor,
    selectedFabric,
    selectedOccasion,
    minPrice,
    maxPrice,
    inStockOnly ? 'inStock' : '',
  ].filter(Boolean).length;

  // Filter Sidebar Content (used in both desktop sidebar & mobile drawer)
  const FilterSidebar = () => (
    <div className="space-y-6 text-xs text-charcoal">
      <div className="flex items-center justify-between pb-3 border-b border-champagne/40">
        <div className="flex items-center space-x-2">
          <FiSliders className="text-burgundy w-4 h-4" />
          <span className="font-serif font-bold text-base text-charcoal">Filter Catalog</span>
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs text-burgundy font-semibold hover:underline flex items-center space-x-1"
          >
            <FiRefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2.5">Category</h4>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat, idx) => (
            <label
              key={idx}
              className="flex items-center justify-between cursor-pointer hover:text-burgundy transition-colors py-0.5"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="catFilter"
                  checked={selectedCategory === cat.value}
                  onChange={() => {
                    setSelectedCategory(cat.value);
                    setSelectedSubcategory('');
                    setPage(1);
                  }}
                  className="text-burgundy focus:ring-burgundy"
                />
                <span className={selectedCategory === cat.value ? 'font-bold text-burgundy' : ''}>
                  {cat.name}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2">Price Range (₹)</h4>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-champagne/60 px-2.5 py-1.5 text-xs rounded-xs focus:ring-1 focus:ring-burgundy"
          />
          <span className="text-charcoal/50">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-champagne/60 px-2.5 py-1.5 text-xs rounded-xs focus:ring-1 focus:ring-burgundy"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMinPrice('');
              setMaxPrice('1500');
              setPage(1);
            }}
            className="px-2 py-0.5 bg-ivory text-[10px] text-charcoal/70 border border-champagne rounded-xs hover:border-burgundy"
          >
            Under ₹1,500
          </button>
          <button
            type="button"
            onClick={() => {
              setMinPrice('1500');
              setMaxPrice('3000');
              setPage(1);
            }}
            className="px-2 py-0.5 bg-ivory text-[10px] text-charcoal/70 border border-champagne rounded-xs hover:border-burgundy"
          >
            ₹1,500 - ₹3,000
          </button>
          <button
            type="button"
            onClick={() => {
              setMinPrice('3000');
              setMaxPrice('');
              setPage(1);
            }}
            className="px-2 py-0.5 bg-ivory text-[10px] text-charcoal/70 border border-champagne rounded-xs hover:border-burgundy"
          >
            Above ₹3,000
          </button>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2">Sizes</h4>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((sz, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedSize(selectedSize === sz ? '' : sz);
                setPage(1);
              }}
              className={`px-2.5 py-1 text-xs border rounded-xs transition-colors ${
                selectedSize === sz
                  ? 'bg-burgundy text-white border-burgundy font-bold shadow-xs'
                  : 'bg-white text-charcoal border-champagne/60 hover:border-burgundy'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Colour Swatches */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2">Colours</h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((col, idx) => {
            const isSelected = selectedColor.toLowerCase() === col.name.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedColor(isSelected ? '' : col.name);
                  setPage(1);
                }}
                title={col.name}
                className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center relative ${
                  isSelected ? 'ring-2 ring-burgundy ring-offset-1 scale-110' : 'border-champagne/80 hover:scale-105'
                }`}
                style={{ backgroundColor: col.hex }}
              >
                {isSelected && (
                  <FiCheck
                    className={`w-3.5 h-3.5 ${
                      col.name === 'Ivory' || col.name === 'Champagne' || col.name === 'Blush Pink'
                        ? 'text-charcoal'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fabric */}
      <div>
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2">Fabric</h4>
        <div className="space-y-1.5">
          {FABRICS.map((fab, idx) => (
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
        <h4 className="font-semibold uppercase tracking-wider text-charcoal mb-2">Occasion</h4>
        <div className="space-y-1.5">
          {OCCASIONS.map((occ, idx) => (
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

      {/* In Stock Only */}
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
          <span className="font-medium text-charcoal">In-Stock Pieces Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* 1. Luxurious Page Banner */}
      <section className="bg-gradient-to-r from-charcoal via-charcoal-light to-charcoal text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-champagne/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-champagne font-medium">
              <Link to="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span className="text-white">All Products</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ivory">
              All Haute Couture Creations
            </h1>
            <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed font-light">
              Explore the entire Dulia Trendz collection — from handloom silk sarees and royal velvet anarkalis to contemporary designer co-ords and tailored separates.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xs border border-white/10 text-xs">
            <div>
              <span className="font-serif font-bold text-lg text-champagne block">{totalProducts}</span>
              <span className="text-[10px] text-ivory/70 uppercase tracking-wider">Curated Styles</span>
            </div>
            <div className="w-[1px] h-8 bg-white/20" />
            <div>
              <span className="font-serif font-bold text-lg text-champagne block">100%</span>
              <span className="text-[10px] text-ivory/70 uppercase tracking-wider">Authentic Handloom</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Horizontal Category Pills Bar */}
      <div className="bg-white border-b border-champagne/40 py-3 relative z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setSelectedSubcategory('');
                  setPage(1);
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 uppercase tracking-wider ${
                  isSelected
                    ? 'bg-burgundy text-white shadow-soft ring-1 ring-burgundy'
                    : 'bg-ivory hover:bg-champagne/30 text-charcoal/80 border border-champagne/60'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search, Sort & Toolbar */}
        <div className="bg-white border border-champagne/40 p-4 rounded-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          {/* Search bar inside catalog */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by piece name, fabric, style, or SKU..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-ivory border border-champagne/60 rounded-full pl-9 pr-8 py-2 text-xs text-charcoal focus:outline-hidden focus:border-burgundy"
            />
            <FiSearch className="absolute left-3 top-2.5 text-charcoal/40 w-4 h-4" />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  setPage(1);
                }}
                className="absolute right-3 top-2.5 text-charcoal/40 hover:text-burgundy"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Right Toolbar Controls */}
          <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-1.5 px-3 py-2 bg-ivory border border-champagne rounded-xs font-semibold text-burgundy"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filters ({activeFiltersCount})</span>
            </button>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="hidden sm:flex items-center border border-champagne/60 rounded-xs bg-ivory p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-burgundy text-white' : 'text-charcoal/60 hover:text-charcoal'
                }`}
                title="Grid view"
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xs transition-colors ${
                  viewMode === 'list' ? 'bg-burgundy text-white' : 'text-charcoal/60 hover:text-charcoal'
                }`}
                title="List view"
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-charcoal/60 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-ivory border border-champagne/60 px-3 py-2 text-xs font-semibold text-charcoal rounded-xs focus:ring-1 focus:ring-burgundy"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="bestseller">Bestsellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Row */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="text-charcoal/60 font-medium">Active Filters:</span>
            {selectedCategory && (
              <span className="bg-white border border-champagne px-2.5 py-1 rounded-full flex items-center space-x-1">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('')}><FiX className="w-3 h-3 text-burgundy" /></button>
              </span>
            )}
            {selectedSize && (
              <span className="bg-white border border-champagne px-2.5 py-1 rounded-full flex items-center space-x-1">
                <span>Size: {selectedSize}</span>
                <button onClick={() => setSelectedSize('')}><FiX className="w-3 h-3 text-burgundy" /></button>
              </span>
            )}
            {selectedColor && (
              <span className="bg-white border border-champagne px-2.5 py-1 rounded-full flex items-center space-x-1">
                <span>Colour: {selectedColor}</span>
                <button onClick={() => setSelectedColor('')}><FiX className="w-3 h-3 text-burgundy" /></button>
              </span>
            )}
            {searchKeyword && (
              <span className="bg-white border border-champagne px-2.5 py-1 rounded-full flex items-center space-x-1">
                <span>"{searchKeyword}"</span>
                <button onClick={() => setSearchKeyword('')}><FiX className="w-3 h-3 text-burgundy" /></button>
              </span>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-burgundy font-semibold hover:underline text-xs ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Catalog Body: Left Filter Sidebar + Right Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 bg-white border border-champagne/40 p-6 rounded-xs shadow-soft self-start sticky top-36">
            <FilterSidebar />
          </aside>

          {/* Right Main Product Showcase */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-champagne/20 rounded-xs" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onQuickView={(p) => setQuickViewProduct(p)}
                      />
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-4">
                    {products.map((product) => {
                      const primaryImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600';
                      return (
                        <div
                          key={product._id}
                          className="bg-white border border-champagne/40 p-4 rounded-xs shadow-xs hover:shadow-soft flex flex-col sm:flex-row gap-5 transition-shadow"
                        >
                          <Link to={`/product/${product.slug}`} className="w-full sm:w-44 aspect-[3/4] bg-ivory rounded-xs overflow-hidden flex-shrink-0">
                            <img src={primaryImg} alt={product.name} className="w-full h-full object-cover object-top hover:scale-105 transition-transform" />
                          </Link>

                          <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-burgundy block">
                                    {product.category} • {product.subcategory}
                                  </span>
                                  <Link to={`/product/${product.slug}`} className="font-serif text-lg font-bold text-charcoal hover:text-burgundy transition-colors">
                                    {product.name}
                                  </Link>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addToWishlist(product)}
                                  className={`p-2 rounded-full border ${
                                    isInWishlist(product._id)
                                      ? 'border-burgundy text-burgundy bg-burgundy/10'
                                      : 'border-champagne/60 text-charcoal/60 hover:text-burgundy'
                                  }`}
                                >
                                  <FiHeart className="w-4 h-4" />
                                </button>
                              </div>

                              <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                                {product.shortDescription || product.description}
                              </p>

                              <div className="flex items-center space-x-2 pt-1">
                                <span className="font-serif font-bold text-lg text-burgundy">
                                  ₹{product.price?.toLocaleString('en-IN')}
                                </span>
                                {product.mrp > product.price && (
                                  <>
                                    <span className="text-xs text-charcoal/40 line-through">
                                      ₹{product.mrp?.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-[10px] font-bold text-rose bg-rose/10 px-1.5 py-0.5 rounded">
                                      {product.discountPercent}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-champagne/30 mt-3">
                              <button
                                type="button"
                                onClick={() => setQuickViewProduct(product)}
                                className="px-4 py-2 border border-champagne text-xs font-semibold text-charcoal hover:bg-ivory rounded-xs transition-colors"
                              >
                                Quick View
                              </button>
                              <Link
                                to={`/product/${product.slug}`}
                                className="px-5 py-2 bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-1.5"
                              >
                                <FiShoppingBag className="w-3.5 h-3.5" />
                                <span>Select Options</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

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
                            : 'border border-champagne/60 hover:bg-champagne/20 text-charcoal'
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
              /* Empty Catalog State */
              <div className="text-center py-20 bg-white border border-champagne/40 rounded-xs p-8 shadow-xs">
                <FiSearch className="w-12 h-12 text-champagne-dark mx-auto mb-3" />
                <h3 className="font-serif text-2xl font-bold text-burgundy mb-2">
                  No Matching Creations Found
                </h3>
                <p className="text-xs text-charcoal/60 max-w-sm mx-auto mb-6">
                  We could not find any products matching your chosen filters or search query. Relax your criteria to discover available designs.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="bg-burgundy hover:bg-burgundy-hover text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Slide-in Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-ivory shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-champagne/50 mb-4">
                <span className="font-serif text-lg font-bold text-burgundy">Filter Catalogue</span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-charcoal hover:text-burgundy"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <FilterSidebar />
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full bg-burgundy text-white py-3 text-xs font-semibold uppercase tracking-widest rounded-xs shadow-soft"
            >
              Show Results ({totalProducts})
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

export default AllProducts;
