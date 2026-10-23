import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-ivory py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block">
            Customer Information
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal">
            Shipping & Delivery Policy
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="bg-white border border-champagne/40 rounded-sm p-5 sm:p-12 shadow-soft space-y-6 text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">1. Dispatch & Processing</h2>
            <p>
              All orders are processed at our dedicated Mumbai fulfillment atelier. Standard orders are dispatched within 24 to 48 business hours following successful online payment verification or COD confirmation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">2. Delivery Timelines</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Tier 1 Metro Zones (Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 2 to 4 business days.</li>
              <li><strong>Tier 2 & 3 Cities / Non-Metro Zones:</strong> 4 to 6 business days.</li>
              <li><strong>Remote / Northeast / Island Regions:</strong> 6 to 8 business days.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">3. Shipping Tariffs</h2>
            <p>
              We provide <strong>Complimentary Standard Delivery</strong> on all orders with a subtotal exceeding ₹999 across India. For orders below ₹999, a nominal standard shipping fee of ₹99 applies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-burgundy">4. Tracking Your Consignment</h2>
            <p>
              Once your parcel has been handed over to our courier partners (Blue Dart, Delhivery, or Xpressbees), a unique tracking identifier will be dispatched via email and SMS. You can also view live milestone updates on our dedicated Track Order portal.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
