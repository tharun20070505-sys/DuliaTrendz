import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Keyboard } from 'swiper/modules';
import ProductCard from '../common/ProductCard';
import { FiArrowRight } from 'react-icons/fi';

const NewArrivalsCarousel = ({ products = [], onQuickView }) => {
  return (
    <section className="py-16 sm:py-20 bg-ivory border-b border-champagne/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-champagne/40">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
              Fresh Off The Runway
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Just Landed
            </h2>
          </div>
          <Link
            to="/new-arrivals"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-semibold text-burgundy hover:text-charcoal transition-colors group"
          >
            <span>View All New Arrivals</span>
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel 3 — Swiper */}
        {products && products.length > 0 ? (
          <div className="relative">
            <Swiper
              modules={[Autoplay, Navigation, Pagination, Keyboard]}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={true}
              pagination={{ clickable: true }}
              keyboard={{ enabled: true }}
              className="pb-14"
            >
              {products.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} onQuickView={onQuickView} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="py-12 text-center text-charcoal/60 text-sm">
            Loading newly arrived styles...
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivalsCarousel;
