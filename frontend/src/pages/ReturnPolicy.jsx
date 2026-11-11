import React from 'react';

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-ivory py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block">
            Customer Information
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal">
            Return & Exchange Policy
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="bg-white border border-champagne/40 rounded-sm p-5 sm:p-12 shadow-soft space-y-6 text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">1. 7-Day Return Window</h2>
            <p>
              Dulia Trendz offers a seamless 7-day return and size-exchange policy from the date of confirmed delivery. You may request a return directly from your customer account under <strong>My Orders → View Details → Request Return</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">2. Garment Eligibility Conditions</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Item must be unworn, unwashed, unaltered, and without body scents or cosmetic marks.</li>
              <li>Original brand tags, security ribbons, and packaging must remain completely intact.</li>
              <li>Custom tailored or bespoke altered pieces are final sale and non-returnable.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">3. Doorstep Pickup & Logistics</h2>
            <p>
              Upon return approval, our designated courier partner will schedule reverse pickup from your original delivery address within 48 to 72 hours. Please ensure the parcel is securely packed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">4. Refund Settlement</h2>
            <p>
              For prepaid online orders (Razorpay), refunds are automatically credited back to your original payment source (UPI, Credit/Debit Card, Netbanking) within 5 to 7 banking days following warehouse quality inspection. For Cash on Delivery orders, store credit or direct NEFT transfer is provided.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
