import React, { useState, useEffect } from 'react';
import API from '../services/api';

// Carousels
import HeroCarousel from '../components/home/HeroCarousel';
import CategoryCarousel from '../components/home/CategoryCarousel';
import NewArrivalsCarousel from '../components/home/NewArrivalsCarousel';
import BestsellersCarousel from '../components/home/BestsellersCarousel';
import OccasionCarousel from '../components/home/OccasionCarousel';

// Editorial & Feature Sections
import ShopByCategoryGrid from '../components/home/ShopByCategoryGrid';
import TrendingSection from '../components/home/TrendingSection';
import TheDuliaEdit from '../components/home/TheDuliaEdit';
import ShopTheLook from '../components/home/ShopTheLook';
import LimitedTimeOffers from '../components/home/LimitedTimeOffers';
import WhyDuliaTrendz from '../components/home/WhyDuliaTrendz';
import CustomerReviewsSection from '../components/home/CustomerReviewsSection';
import InstagramGallery from '../components/home/InstagramGallery';
import RecentlyViewed from '../components/home/RecentlyViewed';
import QuickViewModal from '../components/common/QuickViewModal';

const Home = () => {
  const [homepageData, setHomepageData] = useState({
    heroSlides: [],
    categorySlides: [],
    occasionSlides: [],
    newArrivals: [],
    bestsellers: [],
    trending: [],
  });
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const { data } = await API.get('/homepage');
        if (data.success) {
          setHomepageData(data);
        }
      } catch (err) {
        console.warn('Homepage fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepage();
  }, []);

  return (
    <div className="min-h-screen">
      {/* 1. CAROUSEL 1 — HERO CAROUSEL (5 Slides) */}
      <HeroCarousel slides={homepageData.heroSlides} />

      {/* 2. CAROUSEL 2 — SHOP BY CATEGORY CAROUSEL (5 Slides) */}
      <CategoryCarousel slides={homepageData.categorySlides} />

      {/* 3. CAROUSEL 3 — NEW ARRIVALS CAROUSEL (Dynamic from MongoDB) */}
      <NewArrivalsCarousel
        products={homepageData.newArrivals}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* Editorial Grid: Shop by Category */}
      <ShopByCategoryGrid />

      {/* 4. CAROUSEL 4 — BESTSELLERS CAROUSEL (Admin Selected Bestsellers) */}
      <BestsellersCarousel
        products={homepageData.bestsellers}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* Trending Now Section */}
      <TrendingSection
        products={homepageData.trending}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* The Dulia Edit — Fashion Editorial */}
      <TheDuliaEdit />

      {/* Shop the Look — Curated Head-to-toe Outfits */}
      <ShopTheLook onQuickView={(p) => setQuickViewProduct(p)} />

      {/* 5. CAROUSEL 5 — OCCASION COLLECTIONS CAROUSEL (5 Slides) */}
      <OccasionCarousel slides={homepageData.occasionSlides} />

      {/* Limited Time Offers & Promo Coupons Banner */}
      <LimitedTimeOffers />

      {/* Why Dulia Trendz — Trust & Assurance */}
      <WhyDuliaTrendz />

      {/* Verified Customer Reviews */}
      <CustomerReviewsSection />

      {/* Social Community / Instagram Style Gallery */}
      <InstagramGallery />

      {/* Recently Viewed Items */}
      <RecentlyViewed onQuickView={(p) => setQuickViewProduct(p)} />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default Home;
