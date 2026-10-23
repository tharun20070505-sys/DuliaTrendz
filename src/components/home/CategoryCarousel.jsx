import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Keyboard } from 'swiper/modules';
import { FiArrowRight } from 'react-icons/fi';

const CategoryCarousel = ({ slides = [] }) => {
  const defaultSlides = [
    {
      categoryName: 'Ethnic Wear',
      description: 'Handcrafted Kurtis, Anarkalis, Salwar Suits & Festive Drapes',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      link: '/category/ethnic-wear',
    },
    {
      categoryName: 'Western Wear',
      description: 'Chic tailored shirts, contemporary blouses & stylish everyday separates',
      image: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=800&auto=format&fit=crop',
      link: '/category/western-wear',
    },
    {
      categoryName: 'Dresses',
      description: 'Flowing linen maxis, bias-cut silk slips & statement cocktail designs',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
      link: '/shop?subcategory=Dresses',
    },
    {
      categoryName: 'Tops & Shirts',
      description: 'Crisp poplins, romantic organza puffs & effortless daywear tops',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
      link: '/shop?subcategory=Tops',
    },
    {
      categoryName: 'Co-ord Sets',
      description: 'Harmonious matching pairings for polished and cohesive style',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      link: '/category/co-ord-sets',
    },
  ];

  const categoryList = slides && slides.length > 0 ? slides : defaultSlides;

  return (
    <section className="py-16 sm:py-20 bg-ivory-light border-b border-champagne/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            Curated Collections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Find Your Style
          </h2>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        {/* Carousel 2 — Swiper */}
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
              delay: 4500,
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
            className="pb-14"
          >
            {categoryList.map((cat, idx) => (
              <SwiperSlide key={idx}>
                <div className="group relative bg-white border border-champagne/40 rounded-sm overflow-hidden shadow-soft transition-all duration-300 hover:shadow-elevated flex flex-col h-full">
                  <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                    <img
                      src={cat.image}
                      alt={cat.categoryName}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-serif text-2xl font-bold mb-1">
                        {cat.categoryName}
                      </h3>
                      <p className="text-xs text-ivory/80 line-clamp-2 mb-3">
                        {cat.description}
                      </p>
                      <Link
                        to={cat.link}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-champagne hover:text-white transition-colors"
                      >
                        <span>Explore Collection</span>
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

export default CategoryCarousel;
