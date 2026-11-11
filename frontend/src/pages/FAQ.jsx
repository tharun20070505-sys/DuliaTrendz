import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'How do I know my correct size at Dulia Trendz?',
      a: 'We offer an interactive Size Guide modal on every product page providing precise garment measurements in both inches and centimeters for XS, S, M, L, XL, XXL, and XXXL. If you are between sizes, we recommend opting for the larger size or contacting our styling concierge.',
    },
    {
      q: 'What payment options do you support?',
      a: 'We accept all major online payment methods via Razorpay (including UPI, Google Pay, PhonePe, Paytm, Visa, Mastercard, RuPay, and NetBanking) as well as Cash on Delivery (COD) for eligible pincodes across India.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Metro cities typically receive shipments within 2 to 4 business days. Regional and interior destinations are delivered within 4 to 6 business days. Real-time courier tracking telemetry is dispatched via email and can be tracked anytime on our Track Order page.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We maintain a 7-day return and exchange policy for unworn items in original condition with security tags intact. Our courier partner will coordinate doorstep pickup upon return approval.',
    },
    {
      q: 'How are the fabrics sourced and washed?',
      a: 'All our fabrics—including pure Chanderi, organic cotton, and mulberry silk—are ethically sourced from certified master artisan clusters. Most everyday fabrics are pre-washed to prevent shrinkage.',
    },
  ];

  return (
    <div className="min-h-screen bg-ivory py-8 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-burgundy font-bold block">
            Frequently Asked Questions
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal">
            Help & Guidance
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="bg-white border border-champagne/40 rounded-sm divide-y divide-champagne/30 shadow-soft">
          {faqs.map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-serif text-base font-bold text-charcoal hover:text-burgundy transition-colors focus:outline-none"
              >
                <span>{item.q}</span>
                <FiChevronDown
                  className={`w-5 h-5 text-burgundy shrink-0 transition-transform ${
                    openIdx === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIdx === idx && (
                <p className="mt-3 text-xs sm:text-sm text-charcoal/70 leading-relaxed font-light animate-fadeIn">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
