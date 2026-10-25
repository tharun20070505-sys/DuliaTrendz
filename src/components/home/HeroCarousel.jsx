import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade, Keyboard } from 'swiper/modules';
import { FiArrowRight } from 'react-icons/fi';

const HeroCarousel = ({ slides = [] }) => {
  const defaultSlides = [
    {
      heading: 'Elegance in Every Thread',
      description: 'Discover refined styles designed for your everyday confidence.',
      buttonText: 'Shop New Arrivals',
      buttonLink: '/new-arrivals',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1800&auto=format&fit=crop',
      accent: 'AUTUMN / FESTIVE 2026',
    },
    {
      heading: 'Everyday Looks, Elevated',
      description: 'Effortless silhouettes blending comfort with refined couture.',
      buttonText: 'Shop Casual Wear',
      buttonLink: '/category/western-wear',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1800&auto=format&fit=crop',
      accent: 'MINIMAL LUXURY',
    },
    {
      heading: 'Celebrate Every Moment',
      description: 'Rich royal silks, intricate embroidery, and timeless heritage sets.',
      buttonText: 'Explore Ethnic Wear',
      buttonLink: '/category/ethnic-wear',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1800&auto=format&fit=crop',
      accent: 'ROYAL HERITAGE',
    },
    {
      heading: 'Make Every Look Yours',
      description: 'Statement dresses crafted for evening cocktails and daytime brunches.',
      buttonText: 'Shop Dresses',
      buttonLink: '/shop?subcategory=Dresses',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1800&auto=format&fit=crop',
      accent: 'EVENING EDIT',
    },
    {
      heading: 'The New Season Edit',
      description: 'Modern co-ords, flowing fabrics, and tailored separates.',
      buttonText: 'Explore Collection',
      buttonLink: '/collections',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1800&auto=format&fit=crop',
      accent: 'DESIGNER SHOWCASE',
    },
  ];

  const currentSlides = slides && slides.length > 0 ? slides : defaultSlides;

  return (
    <section className="relative w-full overflow-hidden bg-charcoal">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade, Keyboard]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={true}
        pagination={{
          clickable: true,
        }}
        keyboard={{
          enabled: true,
        }}
        loop={true}
        className="h-[550px] sm:h-[650px] lg:h-[750px] w-full"
      >
        {currentSlides.map((slide, idx) => (
          <SwiperSlide key={idx} className="relative w-full h-full">
            {/* Background Fashion Imagery */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.heading}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={idx === 0 ? "high" : "low"}
                className="w-full h-full object-cover object-center filter brightness-[0.85]"
              />
              {/* Soft Gradient Overlay ensuring text legibility without obscuring faces */}
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/40 to-transparent sm:w-2/3" />
            </div>

            {/* Editorial Content Placement */}
            <div className="relative max-w-7xl mx-auto h-full flex items-center px-6 sm:px-10 lg:px-16">
              <div className="max-w-xl space-y-4 text-white">
                {slide.accent && (
                  <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.25em] text-champagne font-semibold py-1 px-3 border border-champagne/40 bg-charcoal/30 backdrop-blur-xs rounded-xs">
                    {slide.accent}
                  </span>
                )}

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-sm">
                  {slide.heading}
                </h1>

                {slide.description && (
                  <p className="text-sm sm:text-base text-ivory/90 leading-relaxed font-light drop-shadow-xs max-w-md">
                    {slide.description}
                  </p>
                )}

                <div className="pt-2">
                  <Link
                    to={slide.buttonLink || '/shop'}
                    className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-hover text-white px-7 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-widest transition-all duration-300 shadow-elevated group"
                  >
                    <span>{slide.buttonText || 'Shop Now'}</span>
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroCarousel;
