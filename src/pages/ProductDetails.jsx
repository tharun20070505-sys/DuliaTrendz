import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/common/ProductCard';
import SizeGuideModal from '../components/common/SizeGuideModal';
import QuickViewModal from '../components/common/QuickViewModal';
import toast from 'react-hot-toast';
import {
  FiHeart,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiStar,
  FiCheck,
  FiAlertCircle,
  FiMaximize2,
  FiMapPin,
  FiShare2,
} from 'react-icons/fi';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Variant selections
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Modals & Tabs
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('specifications'); // 'specifications', 'shipping', 'care', 'reviews'

  // PIN code checker
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${slug}`);
        if (data.success && data.product) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);

          // Set default variant selections
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedColor(data.product.variants[0].color);
            setSelectedSize(data.product.variants[0].size);
          }
          setActiveImageIndex(0);
          setQuantity(1);

          // Save to Recently Viewed in localStorage
          try {
            const raw = localStorage.getItem('dulia_recently_viewed');
            let list = raw ? JSON.parse(raw) : [];
            list = list.filter((p) => p._id !== data.product._id);
            list.unshift(data.product);
            localStorage.setItem('dulia_recently_viewed', JSON.stringify(list.slice(0, 8)));
          } catch (e) {
            console.warn(e);
          }

          // Fetch reviews
          const { data: revData } = await API.get(`/reviews/product/${data.product._id}`);
          if (revData.success) {
            setReviews(revData.reviews || []);
          }
        }
      } catch (err) {
        console.warn('Product details error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-burgundy border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-charcoal/70 text-sm">Presenting signature creation...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-4">
        <h2 className="font-serif text-3xl font-bold text-burgundy mb-2">Product Not Found</h2>
        <p className="text-xs text-charcoal/60 mb-6">Sorry, this product is currently unavailable or has been archived.</p>
        <Link to="/shop" className="bg-burgundy text-white px-6 py-2.5 text-xs uppercase font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const images = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900' }];

  // Unique Colors
  const availableColors = Array.from(
    new Set(product.variants?.map((v) => JSON.stringify({ color: v.color, colorCode: v.colorCode })))
  ).map((c) => JSON.parse(c));

  // Sizes for selected color
  const variantsForColor = product.variants?.filter((v) => !selectedColor || v.color === selectedColor) || [];
  const currentVariant = product.variants?.find(
    (v) => (!selectedColor || v.color === selectedColor) && v.size === selectedSize
  );

  const stock = currentVariant ? currentVariant.stock : 0;

  // Stock indicator
  let stockDisplay = null;
  if (!currentVariant || stock === 0) {
    stockDisplay = (
      <span className="text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-xs text-xs font-bold inline-flex items-center">
        <FiAlertCircle className="mr-1.5 w-4 h-4" /> Out of Stock
      </span>
    );
  } else if (stock <= (product.lowStockThreshold || 5)) {
    stockDisplay = (
      <span className="text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xs text-xs font-bold inline-flex items-center animate-pulse">
        <FiAlertCircle className="mr-1.5 w-4 h-4" /> Only {stock} left in stock — Order soon
      </span>
    );
  } else {
    stockDisplay = (
      <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xs text-xs font-bold inline-flex items-center">
        <FiCheck className="mr-1.5 w-4 h-4" /> In Stock & Ready to Dispatch
      </span>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size first.');
      return;
    }
    if (stock <= 0) {
      toast.error('This size is currently out of stock.');
      return;
    }
    addToCart(product, currentVariant, selectedSize, selectedColor || currentVariant.color, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedSize || stock <= 0) {
      toast.error('Please select an available size.');
      return;
    }
    addToCart(product, currentVariant, selectedSize, selectedColor || currentVariant.color, quantity);
    navigate('/checkout');
  };

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      toast.error('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    try {
      setCheckingPin(true);
      const { data } = await API.post('/settings/check-pincode', { pincode });
      if (data.success) {
        setPincodeResult(data);
      }
    } catch (err) {
      toast.error(err.message || 'Pincode check failed.');
    } finally {
      setCheckingPin(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      const { data } = await API.post(`/reviews/product/${product._id}`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (data.success) {
        toast.success(data.message || 'Review submitted!');
        setReviewComment('');
        setReviewTitle('');
        // Reload reviews
        const { data: revData } = await API.get(`/reviews/product/${product._id}`);
        if (revData.success) setReviews(revData.reviews || []);
      }
    } catch (err) {
      toast.error(err.message || 'Please log in to submit a review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory py-6 sm:py-10 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-charcoal/60 mb-4 sm:mb-6 flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link to="/" className="hover:text-burgundy shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <Link to="/shop" className="hover:text-burgundy shrink-0">Shop</Link>
          <span className="shrink-0">/</span>
          <Link to={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-burgundy shrink-0">
            {product.category}
          </Link>
          <span className="shrink-0">/</span>
          <span className="text-charcoal font-semibold truncate max-w-[140px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Showcase: Left Gallery + Right Purchase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white border border-champagne/40 rounded-sm p-4 sm:p-8 lg:p-10 shadow-soft">
          {/* Left Column: Image Gallery (Thumbs + Big Preview + Zoom/Lightbox) */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Column */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[600px] no-scrollbar shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 rounded-xs overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-burgundy shadow-sm' : 'border-champagne/50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="relative flex-1 aspect-[3/4] bg-ivory rounded-sm overflow-hidden group">
              <img
                src={images[activeImageIndex]?.url}
                alt={product.name}
                className="w-full h-full object-cover object-top cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                onClick={() => setFullscreenImage(images[activeImageIndex]?.url)}
              />

              {/* Fullscreen Trigger */}
              <button
                type="button"
                onClick={() => setFullscreenImage(images[activeImageIndex]?.url)}
                className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-charcoal hover:bg-burgundy hover:text-white transition-colors"
                title="View Fullscreen"
              >
                <FiMaximize2 className="w-4 h-4" />
              </button>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.newArrival && (
                  <span className="bg-burgundy text-white text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                    New Arrival
                  </span>
                )}
                {product.bestseller && (
                  <span className="bg-champagne-dark text-white text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                    Bestseller
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="bg-rose text-white text-[10px] font-bold px-2.5 py-0.5">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Variant Selection, Stock, Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-charcoal/60 mb-2">
                <span className="uppercase tracking-widest font-semibold">{product.category} • {product.subcategory}</span>
                <span className="font-mono text-charcoal">SKU: {currentVariant?.sku || product.sku}</span>
              </div>

              {/* Product Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-burgundy mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center space-x-2 mb-4 text-xs">
                <div className="flex items-center text-champagne-dark">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(product.ratings?.average || 5)
                          ? 'fill-champagne text-champagne'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-charcoal">{product.ratings?.average || 5.0}</span>
                <span className="text-charcoal/50">({product.ratings?.count || reviews.length} verified reviews)</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline space-x-3 pb-4 border-b border-champagne/40 mb-5">
                <span className="font-serif text-3xl font-bold text-burgundy">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-base text-charcoal/50 line-through">
                      ₹{product.mrp?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs bg-rose/20 text-burgundy font-bold px-2 py-0.5 rounded">
                      Save ₹{(product.mrp - product.price).toLocaleString('en-IN')} ({product.discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed mb-6 font-light">
                {product.shortDescription || product.description}
              </p>

              {/* Color Variant Selector */}
              {availableColors.length > 0 && (
                <div className="mb-5">
                  <span className="text-xs font-semibold text-charcoal block mb-2">
                    Colour: <span className="font-bold text-burgundy">{selectedColor}</span>
                  </span>
                  <div className="flex gap-2.5">
                    {availableColors.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(c.color)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedColor === c.color ? 'border-burgundy scale-110 shadow-sm' : 'border-transparent'
                        }`}
                        title={c.color}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-gray-300 block shadow-inner"
                          style={{ backgroundColor: c.colorCode || '#000000' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector with Size Guide Modal Link & Live Variant Stock */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-charcoal">
                    Select Size: <span className="font-bold text-burgundy">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-burgundy underline hover:text-charcoal font-semibold"
                  >
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {variantsForColor.map((v, idx) => {
                    const isAvail = v.stock > 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!isAvail}
                        onClick={() => setSelectedSize(v.size)}
                        className={`px-4 py-2 text-xs font-bold border rounded-xs transition-all ${
                          selectedSize === v.size
                            ? 'bg-burgundy text-white border-burgundy shadow-sm'
                            : isAvail
                            ? 'bg-white text-charcoal border-champagne hover:border-burgundy'
                            : 'bg-gray-100 text-gray-300 border-gray-200 line-through cursor-not-allowed'
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>

                {/* Stock Status Badge */}
                <div className="mt-3">{stockDisplay}</div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-xs font-semibold text-charcoal">Quantity:</span>
                <div className="flex items-center border border-champagne bg-white rounded-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-charcoal hover:bg-champagne/20 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-charcoal">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
                    className="px-3 py-1.5 text-charcoal hover:bg-champagne/20 font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA Buttons: Add to Bag, Buy Now, Wishlist */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={stock <= 0}
                    onClick={handleAddToCart}
                    className="flex-1 bg-burgundy hover:bg-burgundy-hover text-white py-3.5 px-6 text-xs sm:text-sm font-semibold uppercase tracking-widest transition-all shadow-elevated disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <FiShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addToWishlist(product)}
                    className={`p-3.5 border border-champagne rounded-xs transition-colors ${
                      isFavorited ? 'bg-burgundy text-white' : 'text-charcoal hover:bg-champagne/20'
                    }`}
                    aria-label="Wishlist"
                  >
                    <FiHeart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={stock <= 0}
                  onClick={handleBuyNow}
                  className="w-full bg-champagne hover:bg-champagne-dark text-charcoal font-semibold py-3.5 text-xs sm:text-sm uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>

              {/* Delivery PIN Code Checker */}
              <div className="mt-8 pt-6 border-t border-champagne/40">
                <span className="text-xs uppercase font-bold text-charcoal tracking-wider block mb-2">
                  Check Delivery Estimates
                </span>
                <form onSubmit={handleCheckPincode} className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="flex-1 bg-ivory border border-champagne px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                  <button
                    type="submit"
                    disabled={checkingPin}
                    className="bg-charcoal hover:bg-black text-white text-xs font-semibold px-4 py-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    {checkingPin ? 'Checking...' : 'Check'}
                  </button>
                </form>

                {pincodeResult && (
                  <div className="mt-3 p-3 bg-ivory-light border border-champagne/60 rounded-xs text-xs space-y-1">
                    <p className="text-emerald-800 font-semibold flex items-center">
                      <FiCheck className="mr-1.5" /> {pincodeResult.message}
                    </p>
                    <p className="text-charcoal/70">
                      Cash on Delivery: {pincodeResult.codAvailable ? 'Available' : 'Online Payment Only'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs: Specs, Shipping, Fabric Care, Reviews */}
        <div className="mt-12 bg-white border border-champagne/40 rounded-sm p-6 sm:p-8 shadow-soft">
          <div className="flex border-b border-champagne/40 overflow-x-auto gap-6 sm:gap-8 pb-3">
            {[
              { id: 'specifications', label: 'Specifications & Fabric' },
              { id: 'shipping', label: 'Shipping & Returns' },
              { id: 'reviews', label: `Customer Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs sm:text-sm uppercase tracking-wider font-semibold pb-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-burgundy text-burgundy'
                    : 'border-transparent text-charcoal/60 hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {/* Tab 1: Specifications */}
            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xs">
                  <span className="text-charcoal/60 uppercase">Fabric / Weave:</span>
                  <p className="font-semibold text-charcoal text-sm">{product.specifications?.fabric || 'Pure Natural Blend'}</p>
                </div>
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xs">
                  <span className="text-charcoal/60 uppercase">Silhouette / Fit:</span>
                  <p className="font-semibold text-charcoal text-sm">{product.specifications?.fit || 'Regular'}</p>
                </div>
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xs">
                  <span className="text-charcoal/60 uppercase">Pattern & Details:</span>
                  <p className="font-semibold text-charcoal text-sm">{product.specifications?.pattern || 'Artisanal Design'}</p>
                </div>
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xs">
                  <span className="text-charcoal/60 uppercase">Sleeve Style:</span>
                  <p className="font-semibold text-charcoal text-sm">{product.specifications?.sleeve || 'Three-Quarter'}</p>
                </div>
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xs">
                  <span className="text-charcoal/60 uppercase">Neckline:</span>
                  <p className="font-semibold text-charcoal text-sm">{product.specifications?.neck || 'Elegant Cut'}</p>
                </div>
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xs">
                  <span className="text-charcoal/60 uppercase">Garment Length:</span>
                  <p className="font-semibold text-charcoal text-sm">{product.specifications?.length || 'Standard'}</p>
                </div>
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xs">
                  <span className="text-charcoal/60 uppercase">Best Suited Occasion:</span>
                  <p className="font-semibold text-charcoal text-sm">{product.specifications?.occasion || 'Casual & Festive'}</p>
                </div>
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xs sm:col-span-2">
                  <span className="text-charcoal/60 uppercase">Care Instructions:</span>
                  <p className="font-semibold text-charcoal text-sm">{product.specifications?.careInstructions || 'Dry clean recommended.'}</p>
                </div>
              </div>
            )}

            {/* Tab 2: Shipping & Returns */}
            {activeTab === 'shipping' && (
              <div className="space-y-4 text-xs text-charcoal/80 max-w-2xl leading-relaxed">
                <p>
                  <strong>Dispatch:</strong> Orders are hand-packed at our Mumbai atelier and dispatched within 24 to 48 hours.
                </p>
                <p>
                  <strong>Delivery Timeframe:</strong> Metro zones receive delivery within 2 to 4 business days. Regional destinations within 4 to 6 business days.
                </p>
                <p>
                  <strong>Returns & Exchanges:</strong> Unworn items with intact security tags and original packaging are eligible for return or size exchange within 7 calendar days of delivery.
                </p>
              </div>
            )}

            {/* Tab 3: Customer Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Submit New Review Form */}
                <div className="bg-ivory/60 border border-champagne/40 p-6 rounded-xs max-w-xl">
                  <h4 className="font-serif font-bold text-burgundy text-base mb-3">
                    Write a Product Review
                  </h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-charcoal block mb-1">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <FiStar
                              className={`w-5 h-5 ${
                                star <= reviewRating ? 'fill-champagne text-champagne' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-charcoal block mb-1">Review Headline:</label>
                      <input
                        type="text"
                        placeholder="e.g. Stunning craftsmanship and flattering fit!"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full bg-white border border-champagne px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-charcoal block mb-1">Your Review:</label>
                      <textarea
                        rows={3}
                        placeholder="Share your experience regarding the fabric, feel, fit, and styling..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full bg-white border border-champagne px-3 py-2 text-xs"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase px-6 py-2.5 tracking-wider rounded-xs disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>

                {/* List of Reviews */}
                {reviews.length > 0 ? (
                  <div className="divide-y divide-champagne/30">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="py-4 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <div className="flex text-champagne-dark">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-champagne text-champagne' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-xs text-charcoal">{rev.userName}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        {rev.title && <h5 className="font-serif font-bold text-sm text-burgundy">{rev.title}</h5>}
                        <p className="text-xs text-charcoal/80 leading-relaxed font-light">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-charcoal/60 italic">No reviews yet. Be the first to review this style!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products: You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="font-serif text-2xl font-bold text-charcoal mb-6 pb-2 border-b border-champagne/40">
              You May Also Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} onQuickView={(prod) => setQuickViewProduct(prod)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xs shadow-2xl"
          />
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Mobile Sticky Quick-Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-champagne/50 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(41,37,36,0.1)]">
        <div>
          <span className="text-[10px] text-charcoal/60 uppercase block">Total Price</span>
          <span className="font-serif font-bold text-lg text-burgundy">
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            type="button"
            disabled={stock <= 0}
            onClick={handleAddToCart}
            className="flex-1 max-w-[130px] bg-white border border-burgundy text-burgundy py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider rounded-xs disabled:opacity-50 text-center"
          >
            Add to Bag
          </button>
          <button
            type="button"
            disabled={stock <= 0}
            onClick={handleBuyNow}
            className="flex-1 max-w-[130px] bg-burgundy text-white py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider rounded-xs disabled:opacity-50 text-center shadow-sm"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
