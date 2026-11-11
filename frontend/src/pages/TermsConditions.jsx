import React from 'react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-ivory py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block">
            Legal & Governance
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal">
            Terms & Conditions
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="bg-white border border-champagne/40 rounded-sm p-5 sm:p-12 shadow-soft space-y-6 text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">1. Electronic Agreement</h2>
            <p>
              By accessing, browsing, or completing a transaction on Dulia Trendz (duliatrendz.com), you acknowledge and agree to comply with these terms, governing purchase contracts, inventory commitments, and online payments.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">2. Product Descriptions & Color Fidelity</h2>
            <p>
              We endeavor to present garment photography, hues, weaves, and embroidery with the utmost fidelity. However, as photographic lighting and device displays vary, subtle variations in shade may naturally occur and are characteristic of handcrafted Indian textiles.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">3. Pricing & Inventory Reservation</h2>
            <p>
              All prices are listed in Indian Rupees (INR) inclusive of applicable GST taxes. Garment inventory is allocated and reserved upon successful payment gateway authorization or confirmed COD placement.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
