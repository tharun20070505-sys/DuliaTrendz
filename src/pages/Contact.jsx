import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Thank you! Your message has been received by our concierge.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-ivory py-8 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
            Client Concierge
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal">
            Get in Touch
          </h1>
          <p className="text-xs text-charcoal/70 mt-2">
            Have questions regarding fitting, bespoke orders, or order status? We are here to assist.
          </p>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Contact Details */}
          <div className="lg:col-span-5 bg-white border border-champagne/40 rounded-sm p-5 sm:p-8 shadow-soft space-y-6 text-xs text-charcoal">
            <h3 className="font-serif font-bold text-xl text-burgundy pb-3 border-b border-champagne/30">
              Studio & Atelier
            </h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FiMapPin className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal">Atelier Address</strong>
                  <p className="text-charcoal/70 leading-relaxed">
                    Dulia Trendz Studio, Unit 402, Fashion Boulevard, Bandra West, Mumbai, Maharashtra 400050
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FiMail className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal">Direct Inquiries</strong>
                  <p className="text-charcoal/70">care@duliatrendz.com</p>
                  <p className="text-charcoal/70">concierge@duliatrendz.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FiPhone className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal">Concierge Helpline</strong>
                  <p className="text-charcoal/70">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FiClock className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal">Client Service Hours</strong>
                  <p className="text-charcoal/70">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-champagne/40 rounded-sm p-5 sm:p-8 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-xl text-charcoal pb-3 border-b border-champagne/30">
              Send Us a Note
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Your Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Sizing Advice / Custom Order / Order Tracking"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Message *</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our styling concierge assist you?"
                  required
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase px-6 py-3 tracking-wider rounded-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <FiSend className="w-3.5 h-3.5" />
                <span>{sending ? 'Transmitting...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
