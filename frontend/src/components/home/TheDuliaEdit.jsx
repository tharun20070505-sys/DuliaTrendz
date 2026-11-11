import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const TheDuliaEdit = () => {
  return (
    <section className="py-20 bg-charcoal text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Storytelling */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6 relative">
            <div className="space-y-4 sm:space-y-6">
              <div className="aspect-[3/4] overflow-hidden rounded-sm border border-champagne/20">
                <img
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=900&auto=format&fit=crop"
                  alt="Dulia Trendz Editorial Model"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-4 bg-charcoal-light/60 border border-champagne/20 rounded-xs">
                <span className="text-[10px] uppercase tracking-widest text-champagne block mb-1">
                  Artisanal Heritage
                </span>
                <p className="text-xs text-ivory/80 leading-relaxed">
                  Every thread is spun from natural textiles—pure mulberry silks, hand-combed Chanderi, and breathable linens.
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 pt-8">
              <div className="p-4 bg-charcoal-light/60 border border-champagne/20 rounded-xs">
                <span className="text-[10px] uppercase tracking-widest text-champagne block mb-1">
                  Modern Craft
                </span>
                <p className="text-xs text-ivory/80 leading-relaxed">
                  Designed for the woman who bridges boardroom poise with festive celebration.
                </p>
              </div>
              <div className="aspect-[3/4] overflow-hidden rounded-sm border border-champagne/20">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop"
                  alt="Traditional Saree Detail"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-champagne font-bold block">
              The Dulia Edit • Issue 04
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              Where Heritage Whispers to Modernity.
            </h2>

            <p className="text-sm text-ivory/80 leading-relaxed font-light">
              We believe women's wear should never force a compromise between quiet luxury and cultural resonance. At Dulia Trendz, classic silhouettes are reimagined with architectural lines, generous pockets, and featherlight fabrics that move with your confidence.
            </p>

            <blockquote className="border-l-2 border-burgundy pl-4 py-1 italic text-sm text-champagne">
              "True style is not about being noticed; it is about being remembered."
            </blockquote>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/collections"
                className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-light text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors shadow-elevated"
              >
                <span>Explore the Edit</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 border border-champagne text-champagne hover:bg-champagne hover:text-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors"
              >
                <span>Our Philosophy</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TheDuliaEdit;
