import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiShield,
  FiTruck,
  FiRefreshCw,
} from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post('/settings/newsletter', { email });
      toast.success(data.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Could not subscribe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-charcoal text-ivory/80 pt-16 pb-12 border-t border-champagne/20">
      {/* Value Proposition Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-ivory/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex items-center space-x-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-full bg-burgundy/40 flex items-center justify-center text-champagne shrink-0">
              <FiTruck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-white font-semibold text-base">Complimentary Delivery</h4>
              <p className="text-xs text-ivory/60 mt-0.5">Free shipping on all eligible orders over ₹999 across India.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-full bg-burgundy/40 flex items-center justify-center text-champagne shrink-0">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-white font-semibold text-base">Artisanal Integrity</h4>
              <p className="text-xs text-ivory/60 mt-0.5">Ethically sourced natural fabrics with fine attention to detail.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-full bg-burgundy/40 flex items-center justify-center text-champagne shrink-0">
              <FiRefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-white font-semibold text-base">Effortless Returns</h4>
              <p className="text-xs text-ivory/60 mt-0.5">Hassle-free 7-day pickup return policy for unworn items.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="Dulia Trendz Logo"
                className="w-12 h-12 object-contain rounded-full bg-ivory/10 p-0.5 group-hover:scale-105 transition-transform"
              />
              <span className="font-serif text-2xl font-bold tracking-wider text-champagne">
                DULIA TRENDZ
              </span>
            </Link>
            <p className="text-xs italic text-ivory/70 max-w-sm">
              "Your Style, Our Passion..."
            </p>
            <p className="text-xs text-ivory/60 leading-relaxed max-w-sm">
              Dulia Trendz is a curated women's fashion house celebrating modern grace, traditional Indian textiles, and effortless contemporary tailoring.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-ivory/10 hover:bg-burgundy text-ivory flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-ivory/10 hover:bg-burgundy text-ivory flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-ivory/10 hover:bg-burgundy text-ivory flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h5 className="font-serif text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Explore Collections
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/new-arrivals" className="hover:text-champagne transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/bestsellers" className="hover:text-champagne transition-colors">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/category/ethnic-wear" className="hover:text-champagne transition-colors">
                  Ethnic Wear & Kurtis
                </Link>
              </li>
              <li>
                <Link to="/category/western-wear" className="hover:text-champagne transition-colors">
                  Western Wear & Dresses
                </Link>
              </li>
              <li>
                <Link to="/category/co-ord-sets" className="hover:text-champagne transition-colors">
                  Co-ord Sets
                </Link>
              </li>
              <li>
                <Link to="/category/sarees-traditional" className="hover:text-champagne transition-colors">
                  Sarees & Traditional
                </Link>
              </li>
              <li>
                <Link to="/category/bottom-wear" className="hover:text-champagne transition-colors">
                  Denim & Bottom Wear
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h5 className="font-serif text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/track/lookup" className="hover:text-champagne transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-champagne transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-champagne transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-champagne transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-champagne transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-champagne transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-champagne transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h5 className="font-serif text-white font-semibold text-sm tracking-wider uppercase mb-4">
              The Dulia Gazette
            </h5>
            <p className="text-xs text-ivory/60 mb-3 leading-relaxed">
              Receive early access to seasonal edits, new arrivals, and private boutique sales.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-ivory/5 border border-champagne/30 text-white placeholder:text-ivory/30 px-3 py-2 text-xs focus:outline-none focus:border-champagne"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1 top-1 bottom-1 bg-burgundy hover:bg-burgundy-light text-white px-3 flex items-center justify-center transition-colors disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-ivory/10 text-xs text-ivory/50 space-y-1">
              <p className="flex items-center space-x-2">
                <FiMail className="w-3.5 h-3.5 text-champagne shrink-0" />
                <span>care@duliatrendz.com</span>
              </p>
              <p className="flex items-center space-x-2">
                <FiPhone className="w-3.5 h-3.5 text-champagne shrink-0" />
                <span>+91 98765 43210</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory/40">
        <p>© {new Date().getFullYear()} Dulia Trendz. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Designed & Crafted with Pure Elegance.</p>
      </div>
    </footer>
  );
};

export default Footer;
