import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiTruck,
  FiMenu,
  FiX,
  FiChevronDown,
  FiArrowRight,
  FiLogOut,
  FiPackage,
  FiMapPin,
  FiShield,
} from 'react-icons/fi';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const megaMenuTimeoutRef = useRef(null);
  const megaMenuContainerRef = useRef(null);

  // Close menus on page route changes
  useEffect(() => {
    setIsCategoryOpen(false);
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCategoryOpen(false);
        setAccountDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setIsCategoryOpen(false);
    }
  };

  // Mega menu hover handlers with smooth debounce
  const handleCategoryMouseEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setIsCategoryOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsCategoryOpen(false);
    }, 200);
  };

  const toggleCategoryClick = (e) => {
    e.stopPropagation();
    setIsCategoryOpen((prev) => !prev);
  };

  // Curated 8 Category Cards with warm, editorial, luxury fashion aesthetics
  const categoriesList = [
    {
      name: 'All Products',
      subtitle: 'Complete Collection',
      link: '/products',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=700&auto=format&fit=crop',
    },
    {
      name: 'Kurtis & Kurta Sets',
      subtitle: 'Everyday & Festive',
      link: '/shop?category=Ethnic%20Wear&subcategory=Kurtis',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=700&auto=format&fit=crop',
    },
    {
      name: 'Sarees',
      subtitle: 'Handloom & Banarasi',
      link: '/category/sarees-traditional',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=700&auto=format&fit=crop',
    },
    {
      name: 'Ethnic Wear',
      subtitle: 'Anarkalis & Suits',
      link: '/category/ethnic-wear',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=700&auto=format&fit=crop',
    },
    {
      name: 'Western Wear / Dresses',
      subtitle: 'Modern Silhouettes',
      link: '/category/western-wear',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=700&auto=format&fit=crop',
    },
    {
      name: 'Festive & Occasion',
      subtitle: 'Royal Celebrations',
      link: '/category/occasion-wear',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=700&auto=format&fit=crop',
    },
    {
      name: 'Co-ord Sets',
      subtitle: 'Statement Ensembles',
      link: '/category/co-ord-sets',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=700&auto=format&fit=crop',
    },
    {
      name: 'Silk Collection',
      subtitle: 'Mulberry & Chanderi',
      link: '/products?search=silk',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=700&auto=format&fit=crop',
    },
  ];

  const featuredBanner = {
    tag: 'AUTUMN / FESTIVE 2026',
    title: 'New Season Edit',
    description: 'Handcrafted silks, bespoke zari embroidery, and effortless modern draping.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
    link: '/collections',
  };

  const isLinkActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full select-none">
      {/* ========================================================
          1. TOP ANNOUNCEMENT BAR (REEL-STYLE MARQUEE)
          Height: 44px, Deep wine/maroon background (#6b1432)
          with a soft horizontal gradient.
          White, uppercase DM Sans text, 14px, letter-spacing 0.18em.
          Linear slow scrolling (about 28s per loop) that pauses on hover.
          Reduced-motion supported.
          ======================================================== */}
      <div className="h-[44px] bg-gradient-to-r from-[#591028] via-[#6b1432] to-[#591028] text-white flex items-center overflow-hidden relative marquee-pause-group border-b border-[#540d24] shadow-xs">
        <div className="animate-marquee-scroll whitespace-nowrap flex items-center">
          {[1, 2, 3, 4].map((blockIdx) => (
            <div
              key={blockIdx}
              className="flex items-center space-x-12 px-6 font-dm text-[14px] font-medium uppercase tracking-[0.18em] text-white"
            >
              <div className="flex items-center space-x-3">
                <span className="text-[#fce7f3] text-[13px]">✦</span>
                <span>NEW SEASON COLLECTION – FREE SHIPPING ON ORDERS ABOVE ₹999</span>
                <Link
                  to="/products"
                  className="underline underline-offset-4 font-semibold text-white hover:text-[#fce7f3] transition-colors inline-block"
                >
                  SHOP NOW
                </Link>
                <span className="text-[#fce7f3] text-[13px]">✦</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          2. MAIN NAVBAR
          Cream/ivory background (#f5f0ea), responsive height and padding
          ======================================================== */}
      <div className="bg-[#f5f0ea] border-b border-[#e7dfd5] shadow-[0_2px_15px_-3px_rgba(41,37,36,0.06)] px-3 sm:px-6 lg:px-[28px] h-[68px] sm:h-[76px] lg:h-[84px] flex items-center justify-between relative transition-all">
        {/* ================= LEFT: LOGO ================= */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Mobile Hamburger (visible below 960px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1 text-[#292524] hover:text-[#6b1432] transition-colors focus:outline-none min-[960px]:hidden"
            aria-label="Open Navigation Menu"
          >
            <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group py-1">
            <img
              src="/logo.png"
              alt="Dulia Trendz Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 lg:w-[52px] lg:h-[52px] object-contain rounded-full shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <div className="font-serif font-bold text-[#6b1432] leading-tight tracking-[0.16em] sm:tracking-[0.2em] text-[16px] sm:text-[19px] lg:text-[21px] uppercase select-none group-hover:opacity-90 transition-opacity">
                DULIA TRENDZ
              </div>
              <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.2em] sm:tracking-[0.26em] text-[#78716c] font-medium mt-0.5 select-none hidden xs:block">
                Your Style, Our Passion
              </span>
            </div>
          </Link>
        </div>

        {/* ================= CENTER: MAIN MENU (in exact requested order) ================= */}
        {/* Visible 960px and up */}
        <nav className="hidden min-[960px]:flex items-center space-x-7 lg:space-x-8 text-[15px] font-normal tracking-[0.16em] uppercase text-[#292524]">
          {/* 1. CATEGORY ⌄ (Mega Menu trigger) */}
          <div
            className="relative"
            onMouseEnter={handleCategoryMouseEnter}
            onMouseLeave={handleCategoryMouseLeave}
          >
            <button
              type="button"
              onClick={toggleCategoryClick}
              className={`py-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap hover:text-[#6b1432] focus:outline-none ${
                isCategoryOpen ? 'text-[#6b1432] font-medium' : ''
              }`}
              aria-expanded={isCategoryOpen}
              aria-haspopup="true"
            >
              <span>CATEGORY</span>
              <FiChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-250 ease-out ${
                  isCategoryOpen ? 'rotate-180 text-[#6b1432]' : ''
                }`}
              />
            </button>
          </div>

          {/* 2. NEW ARRIVALS (with pale rose "NEW" pill) */}
          <Link
            to="/new-arrivals"
            className={`py-2 flex items-center transition-colors whitespace-nowrap hover:text-[#6b1432] ${
              isLinkActive('/new-arrivals') ? 'text-[#6b1432] font-medium' : ''
            }`}
          >
            <span>NEW ARRIVALS</span>
            <span className="ml-1.5 px-1.5 py-[1px] text-[9px] font-bold tracking-wider uppercase bg-[#fce7f3] text-[#6b1432] border border-[#fbcfe8] rounded-full">
              NEW
            </span>
          </Link>

          {/* 3. BESTSELLERS (with pale yellow "★ HOT" pill) */}
          <Link
            to="/bestsellers"
            className={`py-2 flex items-center transition-colors whitespace-nowrap hover:text-[#6b1432] ${
              isLinkActive('/bestsellers') ? 'text-[#6b1432] font-medium' : ''
            }`}
          >
            <span>BESTSELLERS</span>
            <span className="ml-1.5 px-1.5 py-[1px] text-[9px] font-bold tracking-wider uppercase bg-[#fef3c7] text-[#92400e] border border-[#fde68a] rounded-full inline-flex items-center space-x-0.5">
              <span className="text-[#d97706]">★</span>
              <span>HOT</span>
            </span>
          </Link>

          {/* 4. SALE (in bright red with pale pink "SALE" pill) */}
          <Link
            to="/sale"
            className={`py-2 flex items-center transition-colors whitespace-nowrap text-[#dc2626] font-semibold hover:opacity-85 ${
              isLinkActive('/sale') ? 'underline underline-offset-4' : ''
            }`}
          >
            <span>SALE</span>
            <span className="ml-1.5 px-1.5 py-[1px] text-[9px] font-bold tracking-wider uppercase bg-[#fee2e2] text-[#dc2626] border border-[#fecaca] rounded-full">
              SALE
            </span>
          </Link>
        </nav>

        {/* ================= RIGHT CLUSTER: SEARCH + 4 THIN-LINE ICONS ================= */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          {/* White pill-shaped search field (about 250px) on desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden sm:block w-[210px] md:w-[250px]"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search kurtis, dresses, silk..."
              className="w-full bg-white border border-[#e7dfd5] rounded-full pl-9 pr-3.5 py-2 text-xs text-[#292524] placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#6b1432] focus:border-[#6b1432] shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all"
            />
            <FiSearch className="absolute left-3 top-2.5 text-[#78716c] w-3.5 h-3.5 pointer-events-none" />
          </form>

          {/* Mobile search toggle button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden p-1.5 text-[#292524] hover:text-[#6b1432] hover:-translate-y-[1px] transition-all duration-150"
            aria-label="Search Catalog"
            title="Search"
          >
            <FiSearch className="w-5 h-5" />
          </button>

          {/* Four thin-line icons: Delivery Truck, Heart, Shopping Bag, User */}
          <div className="flex items-center space-x-1 sm:space-x-2.5">
            {/* 1. Delivery Truck (Track Order) - visible from 480px up or in mobile drawer */}
            <Link
              to="/track/lookup"
              className="hidden sm:inline-flex p-1.5 text-[#292524] hover:text-[#6b1432] hover:-translate-y-[1px] transition-all duration-150 relative"
              aria-label="Track Order"
              title="Track Order Status"
            >
              <FiTruck className="w-5 h-5 stroke-[1.5]" />
            </Link>

            {/* 2. Heart (Wishlist) */}
            <Link
              to="/wishlist"
              className="p-1.5 text-[#292524] hover:text-[#6b1432] hover:-translate-y-[1px] transition-all duration-150 relative"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <FiHeart className="w-5 h-5 stroke-[1.5]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6b1432] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* 3. Shopping Bag (Cart) */}
            <Link
              to="/cart"
              className="p-1.5 text-[#292524] hover:text-[#6b1432] hover:-translate-y-[1px] transition-all duration-150 relative"
              aria-label="Shopping Bag"
              title="Shopping Bag"
            >
              <FiShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6b1432] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* 4. User (Account / Avatar) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="p-1 text-[#292524] hover:text-[#6b1432] hover:-translate-y-[1px] transition-all duration-150 focus:outline-none flex items-center rounded-full"
                aria-label="Account Menu"
                title={isAuthenticated ? user?.name || 'My Account' : 'Account'}
              >
                {isAuthenticated && user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-[#6b1432]/40 shadow-xs ring-1 ring-[#6b1432]/20"
                  />
                ) : isAuthenticated && user?.name ? (
                  <div className="w-7 h-7 rounded-full bg-[#6b1432] text-white font-semibold text-[11px] flex items-center justify-center shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <FiUser className="w-5 h-5 stroke-[1.5]" />
                )}
              </button>

              {/* Account Dropdown */}
              {accountDropdownOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 bg-white border border-[#e7dfd5] shadow-[0_12px_40px_-5px_rgba(41,37,36,0.12)] rounded-[10px] py-2 z-50 text-xs animate-dropdown-reveal"
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-[#f5f0ea] flex items-center space-x-2.5">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-[#e7dfd5] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#6b1432] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#6b1432] truncate">{user?.name}</p>
                          <p className="text-[11px] text-[#78716c] truncate">{user?.email}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2.5 text-[#6b1432] font-semibold hover:bg-[#f5f0ea] transition-colors"
                        >
                          <FiShield className="w-4 h-4 text-[#6b1432]" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-[#292524] hover:bg-[#f5f0ea] transition-colors"
                      >
                        <FiUser className="w-4 h-4 text-[#78716c]" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2 px-4 py-2 text-[#292524] hover:bg-[#f5f0ea] transition-colors"
                      >
                        <FiPackage className="w-4 h-4 text-[#78716c]" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/addresses"
                        className="flex items-center space-x-2 px-4 py-2 text-[#292524] hover:bg-[#f5f0ea] transition-colors"
                      >
                        <FiMapPin className="w-4 h-4 text-[#78716c]" />
                        <span>Saved Addresses</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setAccountDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors border-t border-[#f5f0ea] mt-1"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 font-semibold text-[#6b1432] hover:bg-[#f5f0ea] transition-colors"
                      >
                        Sign In / Register
                      </Link>
                      <Link
                        to="/track/lookup"
                        className="block px-4 py-2 text-[#292524] hover:bg-[#f5f0ea] transition-colors"
                      >
                        Track Order
                      </Link>
                      <div className="border-t border-[#f5f0ea] my-1"></div>
                      <Link
                        to="/admin/login"
                        className="block px-4 py-1.5 text-[11px] text-[#78716c] hover:text-[#6b1432] hover:bg-[#f5f0ea] transition-colors"
                      >
                        Staff / Admin Portal
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            3. CATEGORY MEGA MENU (FULL-WIDTH DESKTOP PANEL)
            Opens on hover or click of "CATEGORY".
            Full-width white panel with soft fade & slide-down,
            16px bottom radius, soft shadow, hairline border.
            Layout: 8 image cards (3:4 ratio, 14px radius, gentle zoom,
            wine gradient fade, category name in white uppercase,
            slide-in "Shop now →" on hover) + Featured Promo Banner.
            ======================================================== */}
        {isCategoryOpen && (
          <div
            ref={megaMenuContainerRef}
            onMouseEnter={handleCategoryMouseEnter}
            onMouseLeave={handleCategoryMouseLeave}
            className="absolute top-full left-0 right-0 w-full bg-white rounded-b-[16px] shadow-[0_25px_60px_-15px_rgba(41,37,36,0.18)] border-b border-x border-[#e7dfd5] z-50 animate-megamenu-reveal overflow-hidden"
          >
            <div className="max-w-[1360px] mx-auto px-6 py-7">
              <div className="grid grid-cols-12 gap-7 items-stretch">
                {/* LEFT / CENTER: Grid of 8 Image Cards (8/12 cols on large screens) */}
                <div className="col-span-12 lg:col-span-9 flex flex-col justify-between">
                  <div>
                    {/* Subtle section label */}
                    <div className="flex items-center justify-between mb-4 border-b border-[#f5f0ea] pb-2.5">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#6b1432]">
                        Explore Curated Collections
                      </span>
                      <span className="text-[11px] text-[#78716c] tracking-wider uppercase font-medium hidden sm:inline">
                        Indian & Western Haute Couture
                      </span>
                    </div>

                    {/* 8 Image Cards Grid: 4 columns x 2 rows */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {categoriesList.map((cat, idx) => (
                        <Link
                          key={idx}
                          to={cat.link}
                          onClick={() => setIsCategoryOpen(false)}
                          className="group relative aspect-[3/4] rounded-[14px] overflow-hidden shadow-xs border border-[#e7dfd5]/60 bg-[#f5f0ea] transition-all duration-300 hover:shadow-md"
                        >
                          {/* Image with gentle zoom on hover */}
                          <img
                            src={cat.image}
                            alt={cat.name}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=700&auto=format&fit=crop';
                            }}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                          />

                          {/* Wine gradient fade at the bottom */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#6b1432]/95 via-[#6b1432]/45 to-transparent flex flex-col justify-end p-3.5 text-white transition-opacity duration-300">
                            {/* Category name in white uppercase */}
                            <span className="font-serif font-bold text-[13px] tracking-[0.06em] uppercase text-white leading-tight drop-shadow-xs group-hover:text-white">
                              {cat.name}
                            </span>

                            {/* Small "Shop now →" label that slides in on hover */}
                            <div className="overflow-hidden h-4 mt-1">
                              <span className="text-[10px] text-[#fce7f3] font-semibold tracking-widest uppercase flex items-center space-x-1 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-250 ease-out">
                                <span>Shop now</span>
                                <FiArrowRight className="w-3 h-3 ml-0.5" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Under the grid: thin text-link row: "View all categories →" */}
                  <div className="mt-5 pt-3.5 border-t border-[#f5f0ea] flex items-center justify-between">
                    <Link
                      to="/products"
                      onClick={() => setIsCategoryOpen(false)}
                      className="text-[12px] uppercase tracking-[0.16em] font-semibold text-[#6b1432] hover:text-[#591028] flex items-center space-x-1.5 transition-colors group"
                    >
                      <span className="group-hover:underline underline-offset-4">
                        View all categories
                      </span>
                      <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center space-x-2 text-[11px] text-[#78716c] font-medium tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6b1432]" />
                      <span>Complimentary express delivery on orders above ₹999</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Featured Promo Banner (3/12 cols on large screens) */}
                <div className="col-span-12 lg:col-span-3">
                  <Link
                    to={featuredBanner.link}
                    onClick={() => setIsCategoryOpen(false)}
                    className="group relative h-full min-h-[340px] rounded-[14px] overflow-hidden border border-[#e7dfd5] bg-[#591028] flex flex-col justify-end p-6 shadow-sm hover:shadow-lg transition-all duration-300 block"
                  >
                    {/* Background image */}
                    <img
                      src={featuredBanner.image}
                      alt={featuredBanner.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop';
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
                    />

                    {/* Rich luxury wine vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#591028] via-[#6b1432]/60 to-black/30" />

                    {/* Content inside banner */}
                    <div className="relative z-10 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d4af37] block mb-1">
                        {featuredBanner.tag}
                      </span>
                      <h4 className="font-serif text-2xl font-bold tracking-wide text-white leading-tight mb-2">
                        {featuredBanner.title}
                      </h4>
                      <p className="text-xs text-[#f5f0ea]/85 font-light leading-relaxed mb-5">
                        {featuredBanner.description}
                      </p>

                      {/* Gold-outlined "Explore" button */}
                      <div>
                        <span className="inline-flex items-center space-x-2 px-5 py-2 rounded-full border border-[#d4af37] text-white text-[11px] font-semibold tracking-[0.18em] uppercase group-hover:bg-[#d4af37] group-hover:text-[#6b1432] transition-all duration-250 shadow-sm">
                          <span>EXPLORE</span>
                          <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MOBILE COLLAPSIBLE SEARCH BAR (< 640px) ================= */}
      {mobileSearchOpen && (
        <div className="sm:hidden bg-[#f5f0ea] px-4 py-2.5 border-b border-[#e7dfd5] animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search kurtis, dresses, silk..."
              className="w-full bg-white border border-[#e7dfd5] rounded-full pl-9 pr-8 py-2 text-xs text-[#292524] placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#6b1432] focus:border-[#6b1432]"
              autoFocus
            />
            <FiSearch className="absolute left-3 w-4 h-4 text-[#78716c]" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[#78716c] hover:text-[#6b1432]"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* ========================================================
          MOBILE FULL-SCREEN DRAWER (< 960px)
          On mobile, the menu becomes a full-screen drawer with
          a 2-column image grid of the 8 categories.
          ======================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 min-[960px]:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#292524]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content: Full-screen luxurious drawer */}
          <div className="fixed inset-y-0 left-0 w-full max-w-md bg-[#f5f0ea] shadow-2xl overflow-y-auto flex flex-col justify-between z-10 animate-slideIn">
            <div className="p-5 sm:p-6">
              {/* Drawer Brand Header */}
              <div className="flex items-center justify-between border-b border-[#e7dfd5] pb-4 mb-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3"
                >
                  <img
                    src="/logo.png"
                    alt="Dulia Trendz Logo"
                    className="w-10 h-10 object-contain rounded-full shadow-xs"
                  />
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-[#6b1432] tracking-[0.18em] text-base uppercase leading-tight">
                      DULIA TRENDZ
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.22em] text-[#78716c] font-medium">
                      Your Style, Our Passion
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#292524] hover:text-[#6b1432] focus:outline-none"
                  aria-label="Close Navigation"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Quick Nav Pills */}
              <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-[#e7dfd5]">
                <Link
                  to="/new-arrivals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 px-2 bg-white rounded-lg border border-[#e7dfd5] text-[11px] font-semibold uppercase tracking-wider text-[#292524] hover:text-[#6b1432] flex items-center justify-center space-x-1 shadow-2xs"
                >
                  <span>NEW</span>
                  <span className="px-1 py-[0.5px] text-[8px] bg-[#fce7f3] text-[#6b1432] rounded-full">
                    NEW
                  </span>
                </Link>

                <Link
                  to="/bestsellers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 px-2 bg-white rounded-lg border border-[#e7dfd5] text-[11px] font-semibold uppercase tracking-wider text-[#292524] hover:text-[#6b1432] flex items-center justify-center space-x-1 shadow-2xs"
                >
                  <span>HOT</span>
                  <span className="px-1 py-[0.5px] text-[8px] bg-[#fef3c7] text-[#92400e] rounded-full">
                    ★
                  </span>
                </Link>

                <Link
                  to="/sale"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 px-2 bg-white rounded-lg border border-[#fecaca] text-[11px] font-bold uppercase tracking-wider text-[#dc2626] flex items-center justify-center space-x-1 shadow-2xs"
                >
                  <span>SALE</span>
                  <span className="px-1 py-[0.5px] text-[8px] bg-[#fee2e2] text-[#dc2626] rounded-full">
                    %
                  </span>
                </Link>
              </div>

              {/* 2-Column Image Grid of Categories for Mobile */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#6b1432]">
                    Categories
                  </span>
                  <Link
                    to="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[11px] text-[#6b1432] font-semibold hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {categoriesList.map((cat, idx) => (
                    <Link
                      key={idx}
                      to={cat.link}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group relative aspect-[3/4] rounded-[12px] overflow-hidden shadow-xs border border-[#e7dfd5] bg-[#f5f0ea]"
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#6b1432]/95 via-[#6b1432]/45 to-transparent flex flex-col justify-end p-2.5 text-white">
                        <span className="font-serif font-bold text-[12px] uppercase leading-tight tracking-wide">
                          {cat.name}
                        </span>
                        <span className="text-[9.5px] text-[#fce7f3] font-medium tracking-widest uppercase mt-0.5 flex items-center">
                          Shop now →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Promo Banner */}
              <Link
                to={featuredBanner.link}
                onClick={() => setMobileMenuOpen(false)}
                className="relative rounded-[12px] overflow-hidden border border-[#e7dfd5] bg-[#591028] p-4 flex flex-col justify-end text-white min-h-[140px] shadow-xs mb-4 block"
              >
                <img
                  src={featuredBanner.image}
                  alt={featuredBanner.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#591028] via-[#6b1432]/70 to-transparent" />
                <div className="relative z-10">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                    {featuredBanner.tag}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-white mb-1">
                    {featuredBanner.title}
                  </h4>
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full border border-[#d4af37] text-white text-[9.5px] font-semibold tracking-wider uppercase">
                    <span>Explore Collection</span>
                    <FiArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Drawer Bottom Actions: Track Order & Account */}
            <div className="p-5 border-t border-[#e7dfd5] bg-white/70 space-y-2 text-xs">
              <Link
                to="/track/lookup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 py-2 text-[#292524] hover:text-[#6b1432]"
              >
                <FiTruck className="w-4 h-4 text-[#6b1432]" />
                <span>Track Your Order</span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-[#292524] hover:text-[#6b1432]"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover border border-[#6b1432]/40"
                      />
                    ) : (
                      <FiUser className="w-4 h-4 text-[#6b1432]" />
                    )}
                    <span>My Account ({user?.name})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-2 py-2 text-red-600 hover:text-red-700"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 py-2 text-[#6b1432] font-semibold"
                >
                  <FiUser className="w-4 h-4" />
                  <span>Customer Sign In / Register</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
