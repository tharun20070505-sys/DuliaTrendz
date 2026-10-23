import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-ivory py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block">
            Legal & Governance
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal">
            Privacy Policy
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="bg-white border border-champagne/40 rounded-sm p-5 sm:p-12 shadow-soft space-y-6 text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">1. Commitment to Privacy</h2>
            <p>
              At Dulia Trendz, protecting customer confidentiality and financial privacy is paramount. We collect solely the information necessary to fulfill orders, verify transactions, provide personalized styling advice, and enhance your shopping experience.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">2. Information We Collect</h2>
            <p>
              When you browse or place an order on our boutique website, we receive customer name, shipping address, contact phone number, email address, and order items. Payment card and bank details are processed directly via PCI-DSS compliant Razorpay gateways and are never stored on Dulia Trendz servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">3. Non-Disclosure & Security</h2>
            <p>
              We do not sell, rent, or distribute personal customer data to any third-party marketing firms. Information is shared strictly with accredited logistics partners for physical parcel transport.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
