import React from 'react';
import {
  FiCheckCircle,
  FiLock,
  FiShoppingBag,
  FiMaximize2,
  FiTruck,
  FiHeadphones,
} from 'react-icons/fi';

const WhyDuliaTrendz = () => {
  const pillars = [
    {
      icon: FiCheckCircle,
      title: "Curated Women's Fashion",
      desc: "Every design is carefully crafted with premium organic cottons, pure mulmul, and lustrous mulberry silks.",
    },
    {
      icon: FiLock,
      title: "100% Secure Checkout",
      desc: "Bank-grade encrypted payments via Razorpay (UPI, Cards, NetBanking) and verified Cash on Delivery.",
    },
    {
      icon: FiShoppingBag,
      title: "Effortless Shopping",
      desc: "Intuitive multi-filter browsing, responsive drawer navigation, and instant size-stock visibility.",
    },
    {
      icon: FiMaximize2,
      title: "Accurate Size Guidance",
      desc: "Detailed body measurement charts in both inches and cm so you always discover your perfect silhouette.",
    },
    {
      icon: FiTruck,
      title: "Live Order Tracking",
      desc: "Visual milestone tracking from dispatch to doorstep delivery with real-time courier updates.",
    },
    {
      icon: FiHeadphones,
      title: "Dedicated Care Support",
      desc: "Prompt customer assistance for styling inquiries, exchanges, and doorstep return pickup requests.",
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-ivory-light border-b border-champagne/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            The Dulia Standard
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal">
            Why Dulia Trendz?
          </h2>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-champagne/40 rounded-sm p-4 sm:p-6 shadow-soft hover:shadow-elevated transition-all duration-300 hover:border-burgundy/40 group"
              >
                <div className="w-12 h-12 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center mb-4 group-hover:bg-burgundy group-hover:text-white transition-colors duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyDuliaTrendz;
