import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCopy, FiCheck, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LimitedTimeOffers = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 42,
    seconds: 18,
  });

  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="py-14 bg-gradient-to-r from-burgundy via-burgundy-hover to-burgundy text-white border-b border-champagne/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Offer Details & Countdown */}
          <div className="text-center lg:text-left space-y-3">
            <span className="inline-flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs text-champagne text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-white/20">
              <FiClock className="w-3.5 h-3.5 animate-pulse" />
              <span>Limited Time Seasonal Showcase</span>
            </span>

            <h3 className="font-serif text-3xl sm:text-4xl font-bold">
              Festive Edit Special: Up to 35% Off
            </h3>
            <p className="text-xs sm:text-sm text-ivory/80 max-w-lg font-light">
              Enjoy limited-run discounts on handcrafted Chanderi kurtis, mulberry silk sets, and tailored linens.
            </p>

            {/* Countdown Display */}
            <div className="flex items-center justify-center lg:justify-start space-x-3 pt-2">
              <div className="bg-black/30 border border-white/15 px-3 py-2 rounded-xs text-center min-w-[54px]">
                <span className="font-mono text-xl sm:text-2xl font-bold block">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase tracking-wider text-ivory/60">Hours</span>
              </div>
              <span className="font-bold text-lg text-champagne">:</span>
              <div className="bg-black/30 border border-white/15 px-3 py-2 rounded-xs text-center min-w-[54px]">
                <span className="font-mono text-xl sm:text-2xl font-bold block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase tracking-wider text-ivory/60">Mins</span>
              </div>
              <span className="font-bold text-lg text-champagne">:</span>
              <div className="bg-black/30 border border-white/15 px-3 py-2 rounded-xs text-center min-w-[54px]">
                <span className="font-mono text-xl sm:text-2xl font-bold block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase tracking-wider text-ivory/60">Secs</span>
              </div>
            </div>
          </div>

          {/* Right: Coupon Codes & Shop CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-champagne/30 p-4 rounded-xs text-center sm:text-left space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-ivory/70 block">Use Code at Checkout</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-champagne text-base tracking-wider bg-black/30 px-3 py-1 rounded-xs">
                  WELCOME10
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('WELCOME10')}
                  className="p-1.5 text-white/80 hover:text-white transition-colors"
                  aria-label="Copy Promo Code"
                >
                  {copiedCode === 'WELCOME10' ? <FiCheck className="w-4 h-4 text-emerald-400" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-ivory/60">10% OFF on all orders above ₹999</p>
            </div>

            <Link
              to="/shop?collection=sale"
              className="bg-champagne hover:bg-champagne-dark text-charcoal font-semibold px-6 py-3.5 text-xs uppercase tracking-widest transition-colors shadow-elevated flex items-center space-x-2 shrink-0"
            >
              <span>Explore Offers</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LimitedTimeOffers;
