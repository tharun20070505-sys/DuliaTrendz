import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { FiArrowRight } from 'react-icons/fi';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/collections');
        if (data.success && data.collections) {
          setCollections(data.collections);
        }
      } catch (err) {
        console.warn('Collections fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            Thematic Curations
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal mb-3">
            Collections
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
            Curated wardrobe edits tailored for life’s grand celebrations, workdays, and weekend escapades.
          </p>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-champagne/20 rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => (
              <Link
                key={col._id}
                to={`/shop?collection=${col.slug}`}
                className="group relative bg-white border border-champagne/40 rounded-sm overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
                  <img
                    src={col.image || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800'}
                    alt={col.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase tracking-widest text-champagne block mb-1">
                      Curated Edit
                    </span>
                    <h3 className="font-serif text-2xl font-bold mb-1">{col.title || col.name}</h3>
                    <p className="text-xs text-ivory/80 line-clamp-2 mb-3">{col.description}</p>
                    <span className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-champagne group-hover:text-white transition-colors">
                      <span>Explore Styles</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
