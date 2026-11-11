import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiHeart, FiFeather } from 'react-icons/fi';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-ivory py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Title */}
        <div className="text-center space-y-3">
          <img
            src="/logo.png"
            alt="Dulia Trendz Logo"
            className="w-20 h-20 object-contain rounded-full mx-auto shadow-md mb-3"
          />
          <span className="text-xs uppercase tracking-[0.3em] text-burgundy font-bold block">
            Our Heritage & Vision
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
            The Story of Dulia Trendz
          </h1>
          <p className="text-sm italic text-burgundy font-serif">
            "Your Style, Our Passion..."
          </p>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        {/* Narrative & Philosophy */}
        <div className="bg-white border border-champagne/40 rounded-sm p-8 sm:p-12 shadow-soft space-y-6 text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light">
          <p>
            Dulia Trendz was founded with a singular conviction: that modern women should never be forced to choose between the cultural artistry of traditional Indian weaves and the clean minimalism of contemporary global tailoring.
          </p>
          <p>
            From the hand-spun Chanderi cottons of Madhya Pradesh to pure Katan silks of Varanasi, our collections celebrate artisanal mastery while adhering to thoughtful modern design—generous in-seam pockets, breathable lining mulmul, and flattering drape silhouettes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-champagne/40 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center mx-auto">
                <FiFeather className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal">Pure Natural Fibers</h3>
              <p className="text-xs text-charcoal/60">100% Giza cotton, pure European linen, and mulberry silks.</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center mx-auto">
                <FiHeart className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal">Ethical Craft</h3>
              <p className="text-xs text-charcoal/60">Fair wage partnership with master weavers across 6 Indian states.</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center mx-auto">
                <FiShield className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal">Quality Assured</h3>
              <p className="text-xs text-charcoal/60">Pre-washed textiles, anti-shrink stitching, and durable seams.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase px-8 py-3.5 tracking-widest rounded-xs transition-colors shadow-elevated"
          >
            <span>Explore The Collections</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
