import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Keyboard } from 'swiper/modules';
import { FiArrowRight } from 'react-icons/fi';

const OccasionCarousel = ({ slides = [] }) => {
  const defaultSlides = [
    {
      title: 'Everyday Essentials',
      description: 'Breathable pure cottons and linens tailored for day-long grace.',
      image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop',
      link: '/shop?occasion=Casual',
    },
    {
      title: 'Office Wear',
      description: 'Polished tunics, crisp formal shirts, and tailored comfort trousers.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
      link: '/shop?occasion=Workwear',
    },
    {
      title: 'Festive Collection',
      description: 'Rich jewel tones, zardozi accents, and festive radiance.',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
      link: '/shop?occasion=Festive',
    },
    {
      title: 'Wedding Guest Edit',
      description: 'Handcrafted anarkalis, silk sarees, and dramatic festive drapes.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
      link: '/shop?occasion=Wedding',
    },
    {
      title: 'Weekend & Vacation',
      description: 'Flowing resort wear, breezy co-ords, and weekend getaway fits.',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
      link: '/shop?occasion=Vacation',
    },
  ];

  const currentSlides = slides && slides.length > 0 ? slides : defaultSlides;

  return (
    <section className="py-16 sm:py-20 bg-ivory border-b border-champagne/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            Styling Your Life Moments
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Dress for the Moment
          </h2>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        {/* Carousel 5 — Swiper */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination, Keyboard]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{
              delay: 4800,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={true}
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            loop={true}
            className="pb-14"
          >
            {currentSlides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                <div className="group relative bg-white border border-champagne/40 rounded-sm overflow-hidden shadow-soft transition-all duration-300 hover:shadow-elevated flex flex-col h-full">
                  <div className="relative aspect-[3/4] overflow-hidden bg-ivory">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <span className="text-[10px] uppercase tracking-widest text-champagne font-bold block mb-1">
                        Occasion Edit
                      </span>
                      <h3 className="font-serif text-2xl font-bold mb-2">
                        {slide.title}
                      </h3>
                      <p className="text-xs text-ivory/80 line-clamp-2 mb-4 leading-relaxed">
                        {slide.description}
                      </p>
                      <Link
                        to={slide.link}
                        className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-hover text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm"
                      >
                        <span>Explore Style</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default OccasionCarousel;
