import React, { useState, useEffect } from 'react';
import {
  FiSliders,
  FiSave,
  FiImage,
  FiLink,
  FiEdit,
  FiCheck,
  FiEye,
  FiLayers,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const HomepageManagement = () => {
  const [activeTab, setActiveTab] = useState('announcement'); // 'announcement' | 'hero' | 'category' | 'occasion'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [announcementBar, setAnnouncementBar] = useState({
    text: 'NEW SEASON COLLECTION — FREE SHIPPING ON ELIGIBLE ORDERS',
    enabled: true,
    backgroundColor: '#641F36',
    textColor: '#FFFFFF',
    link: '/shop',
  });

  const [heroSlides, setHeroSlides] = useState([]);
  const [categorySlides, setCategorySlides] = useState([]);
  const [occasionSlides, setOccasionSlides] = useState([]);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        setLoading(true);
        const res = await api.get('/homepage');
        if (res.data.announcementBar) {
          setAnnouncementBar(res.data.announcementBar);
        }
        if (res.data.heroSlides) {
          setHeroSlides(res.data.heroSlides);
        }
        if (res.data.categorySlides) {
          setCategorySlides(res.data.categorySlides);
        }
        if (res.data.occasionSlides) {
          setOccasionSlides(res.data.occasionSlides);
        }
      } catch (err) {
        toast.error('Failed to load homepage configuration');
      } finally {
        setLoading(false);
      }
    };
    fetchHomepage();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/homepage', {
        announcementBar,
        heroSlides,
        categorySlides,
        occasionSlides,
      });
      toast.success('Homepage banners & carousels saved to boutique store!');
    } catch (err) {
      toast.error('Failed to update homepage settings');
    } finally {
      setSaving(false);
    }
  };

  const handleHeroChange = (idx, field, value) => {
    const updated = [...heroSlides];
    updated[idx][field] = value;
    setHeroSlides(updated);
  };

  const handleCategorySlideChange = (idx, field, value) => {
    const updated = [...categorySlides];
    updated[idx][field] = value;
    setCategorySlides(updated);
  };

  const handleOccasionSlideChange = (idx, field, value) => {
    const updated = [...occasionSlides];
    updated[idx][field] = value;
    setOccasionSlides(updated);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-charcoal/50 text-xs">
        Loading homepage configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">Homepage Banners & Carousels</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Configure boutique announcements and all 5 dedicated Swiper.js image carousels dynamically without code edits.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-dark text-white px-5 py-2.5 rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
        >
          <FiSave className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-champagne/40 bg-white px-4 pt-3 rounded-t-xs space-x-4 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'announcement', label: '1. Announcement Bar' },
          { key: 'hero', label: '2. Hero Carousel (5 Slides)' },
          { key: 'category', label: '3. Category Carousel (5 Slides)' },
          { key: 'occasion', label: '4. Occasion Carousel (5 Slides)' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-burgundy text-burgundy font-bold'
                : 'border-transparent text-charcoal/60 hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {/* 1. Announcement Bar */}
      {activeTab === 'announcement' && (
        <div className="bg-white p-4 sm:p-6 rounded-b-xs border border-champagne/40 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2">
            Top Header Announcement Bar
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="barEnabled"
                checked={announcementBar.enabled}
                onChange={(e) =>
                  setAnnouncementBar({ ...announcementBar, enabled: e.target.checked })
                }
                className="accent-burgundy"
              />
              <label htmlFor="barEnabled" className="font-semibold text-charcoal cursor-pointer">
                Display top announcement bar across boutique
              </label>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Announcement Copy</label>
              <input
                type="text"
                value={announcementBar.text}
                onChange={(e) =>
                  setAnnouncementBar({ ...announcementBar, text: e.target.value })
                }
                placeholder="e.g. FESTIVE SEASON EDIT — COMPLIMENTARY SHIPPING OVER ₹999"
                className="w-full p-2.5 border border-champagne/60 rounded-xs focus:outline-hidden focus:border-burgundy font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Background Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={announcementBar.backgroundColor || '#641F36'}
                    onChange={(e) =>
                      setAnnouncementBar({ ...announcementBar, backgroundColor: e.target.value })
                    }
                    className="w-9 h-9 border border-champagne/60 rounded cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={announcementBar.backgroundColor || '#641F36'}
                    onChange={(e) =>
                      setAnnouncementBar({ ...announcementBar, backgroundColor: e.target.value })
                    }
                    className="flex-1 p-2 border border-champagne/60 rounded-xs font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Text Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={announcementBar.textColor || '#FFFFFF'}
                    onChange={(e) =>
                      setAnnouncementBar({ ...announcementBar, textColor: e.target.value })
                    }
                    className="w-9 h-9 border border-champagne/60 rounded cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={announcementBar.textColor || '#FFFFFF'}
                    onChange={(e) =>
                      setAnnouncementBar({ ...announcementBar, textColor: e.target.value })
                    }
                    className="flex-1 p-2 border border-champagne/60 rounded-xs font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Optional Banner Link</label>
                <input
                  type="text"
                  value={announcementBar.link || ''}
                  onChange={(e) =>
                    setAnnouncementBar({ ...announcementBar, link: e.target.value })
                  }
                  placeholder="/shop or /sale"
                  className="w-full p-2 border border-champagne/60 rounded-xs"
                />
              </div>
            </div>

            {/* Live Preview Bar */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-charcoal/60 uppercase block mb-1.5">
                Live Top Bar Preview:
              </span>
              <div
                style={{
                  backgroundColor: announcementBar.backgroundColor || '#641F36',
                  color: announcementBar.textColor || '#FFFFFF',
                }}
                className="p-2 text-center text-xs tracking-wider uppercase font-semibold rounded-xs shadow-xs"
              >
                {announcementBar.text || 'Announcement message preview'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Hero Carousel (5 Slides) */}
      {activeTab === 'hero' && (
        <div className="space-y-4">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xs border border-champagne/40 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-champagne/30 pb-2">
                <span className="font-serif font-bold text-sm text-burgundy">
                  Hero Slide {idx + 1}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-charcoal/50 font-mono">
                  Swiper.js AutoSlide
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Image preview */}
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Image URL</label>
                  <input
                    type="url"
                    value={slide.image}
                    onChange={(e) => handleHeroChange(idx, 'image', e.target.value)}
                    className="w-full p-2 border border-champagne/60 rounded-xs mb-2"
                  />
                  <div className="h-32 rounded-xs overflow-hidden border border-champagne/40 bg-ivory">
                    <img src={slide.image} alt={slide.heading} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Content */}
                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-charcoal mb-1">Accent Badge</label>
                      <input
                        type="text"
                        value={slide.accent || ''}
                        onChange={(e) => handleHeroChange(idx, 'accent', e.target.value)}
                        placeholder="e.g. AUTUMN / FESTIVE 2026"
                        className="w-full p-2 border border-champagne/60 rounded-xs font-mono text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-charcoal mb-1">Heading</label>
                      <input
                        type="text"
                        value={slide.heading}
                        onChange={(e) => handleHeroChange(idx, 'heading', e.target.value)}
                        className="w-full p-2 border border-champagne/60 rounded-xs font-serif font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal mb-1">Description Subtitle</label>
                    <input
                      type="text"
                      value={slide.description}
                      onChange={(e) => handleHeroChange(idx, 'description', e.target.value)}
                      className="w-full p-2 border border-champagne/60 rounded-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-charcoal mb-1">Button CTA Text</label>
                      <input
                        type="text"
                        value={slide.buttonText}
                        onChange={(e) => handleHeroChange(idx, 'buttonText', e.target.value)}
                        className="w-full p-2 border border-champagne/60 rounded-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-charcoal mb-1">Button CTA Link</label>
                      <input
                        type="text"
                        value={slide.buttonLink}
                        onChange={(e) => handleHeroChange(idx, 'buttonLink', e.target.value)}
                        className="w-full p-2 border border-champagne/60 rounded-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Category Carousel (5 Slides) */}
      {activeTab === 'category' && (
        <div className="space-y-4">
          {categorySlides.map((slide, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xs border border-champagne/40 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-champagne/30 pb-2">
                <span className="font-serif font-bold text-sm text-burgundy">
                  Category Carousel Slide {idx + 1}: {slide.categoryName}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Image URL</label>
                  <input
                    type="url"
                    value={slide.image}
                    onChange={(e) => handleCategorySlideChange(idx, 'image', e.target.value)}
                    className="w-full p-2 border border-champagne/60 rounded-xs mb-2"
                  />
                  <div className="h-28 rounded-xs overflow-hidden border border-champagne/40 bg-ivory">
                    <img src={slide.image} alt={slide.categoryName} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-charcoal mb-1">Category Title</label>
                      <input
                        type="text"
                        value={slide.categoryName}
                        onChange={(e) => handleCategorySlideChange(idx, 'categoryName', e.target.value)}
                        className="w-full p-2 border border-champagne/60 rounded-xs font-serif font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-charcoal mb-1">Link</label>
                      <input
                        type="text"
                        value={slide.link}
                        onChange={(e) => handleCategorySlideChange(idx, 'link', e.target.value)}
                        className="w-full p-2 border border-champagne/60 rounded-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal mb-1">Short Description</label>
                    <input
                      type="text"
                      value={slide.description}
                      onChange={(e) => handleCategorySlideChange(idx, 'description', e.target.value)}
                      className="w-full p-2 border border-champagne/60 rounded-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Occasion Carousel (5 Slides) */}
      {activeTab === 'occasion' && (
        <div className="space-y-4">
          {occasionSlides.map((slide, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xs border border-champagne/40 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-champagne/30 pb-2">
                <span className="font-serif font-bold text-sm text-burgundy">
                  Occasion Slide {idx + 1}: {slide.title}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Image URL</label>
                  <input
                    type="url"
                    value={slide.image}
                    onChange={(e) => handleOccasionSlideChange(idx, 'image', e.target.value)}
                    className="w-full p-2 border border-champagne/60 rounded-xs mb-2"
                  />
                  <div className="h-28 rounded-xs overflow-hidden border border-champagne/40 bg-ivory">
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-charcoal mb-1">Occasion Title</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleOccasionSlideChange(idx, 'title', e.target.value)}
                        className="w-full p-2 border border-champagne/60 rounded-xs font-serif font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-charcoal mb-1">Link</label>
                      <input
                        type="text"
                        value={slide.link}
                        onChange={(e) => handleOccasionSlideChange(idx, 'link', e.target.value)}
                        className="w-full p-2 border border-champagne/60 rounded-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal mb-1">Description</label>
                    <input
                      type="text"
                      value={slide.description}
                      onChange={(e) => handleOccasionSlideChange(idx, 'description', e.target.value)}
                      className="w-full p-2 border border-champagne/60 rounded-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomepageManagement;
