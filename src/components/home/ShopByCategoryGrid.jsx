import React from 'react';
import { Link } from 'react-router-dom';

const ShopByCategoryGrid = () => {
  const categories = [
    {
      title: 'Ethnic Wear',
      subtitle: 'Kurtis, Anarkalis & Festive Sets',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      link: '/category/ethnic-wear',
      colSpan: 'md:col-span-2 md:row-span-2',
    },
    {
      title: 'Dresses & Gowns',
      subtitle: 'Effortless evening & brunch looks',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop',
      link: '/shop?subcategory=Dresses',
      colSpan: 'md:col-span-1',
    },
    {
      title: 'Co-ord Sets',
      subtitle: 'Effortless coordinated harmony',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      link: '/category/co-ord-sets',
      colSpan: 'md:col-span-1',
    },
    {
      title: 'Heritage Sarees',
      subtitle: 'Banarasi, silk & organza drapes',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      link: '/category/sarees-traditional',
      colSpan: 'md:col-span-1',
    },
    {
      title: 'Tailored Bottoms',
      subtitle: 'High-waisted trousers & palazzos',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
      link: '/category/bottom-wear',
      colSpan: 'md:col-span-1',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-ivory-light border-b border-champagne/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            The Wardrobe Edit
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Signature Categories
          </h2>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.link}
              className={`group relative overflow-hidden rounded-sm border border-champagne/40 bg-charcoal min-h-[260px] sm:min-h-[300px] shadow-soft hover:shadow-elevated transition-all duration-300 ${cat.colSpan}`}
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent transition-opacity group-hover:opacity-90" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs uppercase tracking-widest text-champagne font-semibold mb-1">
                  {cat.subtitle}
                </p>
                <h3 className="font-serif text-2xl font-bold mb-2">{cat.title}</h3>
                <span className="inline-block text-xs uppercase tracking-wider font-semibold border-b border-champagne pb-0.5 group-hover:text-champagne transition-colors">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategoryGrid;
