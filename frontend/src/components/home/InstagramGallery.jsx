import React from 'react';
import { FiInstagram } from 'react-icons/fi';

const InstagramGallery = () => {
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop',
      tag: '#DuliaTrendzStyle',
    },
    {
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      tag: '#ModernEthnic',
    },
    {
      url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
      tag: '#DuliaMoments',
    },
    {
      url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop',
      tag: '#LinenLove',
    },
    {
      url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
      tag: '#FestiveElegance',
    },
    {
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
      tag: '#HeirloomSilks',
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-ivory-light border-b border-champagne/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            Social Community
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal">
            Follow @DuliaTrendz
          </h2>
          <p className="text-xs text-charcoal/70 mt-2">
            Tag us in your moments of poise and confidence to be featured in our style curation.
          </p>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {images.map((item, idx) => (
            <a
              key={idx}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xs bg-charcoal block"
            >
              <img
                src={item.url}
                alt="Instagram Fashion Post"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-burgundy/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-2 text-center">
                <FiInstagram className="w-6 h-6 mb-1 text-champagne" />
                <span className="text-[10px] font-mono tracking-wider">{item.tag}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;
