import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiCheck } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const ShopTheLook = ({ onQuickView }) => {
  const { addToCart } = useCart();

  const outfitItems = [
    {
      id: 'ot-1',
      name: 'Oversized Crisp Cotton Poplin Shirt',
      category: 'Western Wear',
      price: 1399,
      mrp: 1999,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop',
      slug: 'oversized-crisp-cotton-poplin-shirt',
      size: 'M',
      color: 'Chalk White',
      sku: 'DT-TOP-010-WHT-M',
      stock: 25,
    },
    {
      id: 'ot-2',
      name: 'Pleated Chiffon Flared Palazzo Trousers',
      category: 'Bottom Wear',
      price: 1199,
      mrp: 1899,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop',
      slug: 'pleated-chiffon-flared-palazzo-trousers',
      size: 'M',
      color: 'Ivory White',
      sku: 'DT-BOT-012-IVO-M',
      stock: 24,
    },
    {
      id: 'ot-3',
      name: 'Handcrafted Zari Border Banarasi Dupatta',
      category: 'Sarees & Traditional',
      price: 1199,
      mrp: 1799,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
      slug: 'handwoven-zari-border-banarasi-dupatta',
      size: 'Free Size',
      color: 'Crimson Red',
      sku: 'DT-DUP-021-RED-FS',
      stock: 12,
    },
  ];

  const handleAddSingleItem = (item) => {
    addToCart(
      { _id: item.id, name: item.name, price: item.price, mrp: item.mrp, images: [{ url: item.image }] },
      { sku: item.sku, stock: item.stock, price: item.price, size: item.size, color: item.color },
      item.size,
      item.color,
      1
    );
  };

  const handleAddFullOutfit = () => {
    outfitItems.forEach((item) => {
      addToCart(
        { _id: item.id, name: item.name, price: item.price, mrp: item.mrp, images: [{ url: item.image }] },
        { sku: item.sku, stock: item.stock, price: item.price, size: item.size, color: item.color },
        item.size,
        item.color,
        1
      );
    });
    toast.success('Complete outfit added to your shopping bag!');
  };

  const totalOutfitPrice = outfitItems.reduce((acc, i) => acc + i.price, 0);
  const totalOutfitMrp = outfitItems.reduce((acc, i) => acc + i.mrp, 0);

  return (
    <section className="py-16 sm:py-20 bg-ivory border-b border-champagne/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
            Curated Ensembles
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Shop the Look
          </h2>
          <p className="text-xs text-charcoal/70 mt-2">
            Harmonious outfit coordination. Purchase individual staples or the entire head-to-toe look.
          </p>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-champagne/50 rounded-sm p-6 sm:p-8 shadow-soft">
          {/* Main Look Image with Hotspot Pins */}
          <div className="lg:col-span-6 relative aspect-[3/4] overflow-hidden rounded-sm bg-ivory">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop"
              alt="Complete Curated Ensemble"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            {/* Visual Hotspot Badges */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-semibold text-burgundy shadow-sm border border-champagne flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-burgundy animate-ping" />
              <span>1. Poplin Shirt</span>
            </div>

            <div className="absolute bottom-1/3 left-1/3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-semibold text-burgundy shadow-sm border border-champagne flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-burgundy" />
              <span>2. Flared Palazzo</span>
            </div>

            <div className="absolute top-1/3 right-8 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-semibold text-burgundy shadow-sm border border-champagne flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-burgundy" />
              <span>3. Banarasi Dupatta</span>
            </div>
          </div>

          {/* Breakdown of Individual Outfit Components */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-burgundy font-bold block mb-1">
                Outfit 01 • The Resort Minimalist
              </span>
              <h3 className="font-serif text-2xl font-bold text-charcoal">
                Crisp Poplin + Fluid Chiffon Palazzo + Silk Accents
              </h3>
            </div>

            <div className="divide-y divide-champagne/40">
              {outfitItems.map((item, idx) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-16 object-cover rounded-xs border border-champagne/40"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-charcoal/60">
                        Size: {item.size} • Color: {item.color}
                      </p>
                      <div className="flex items-baseline space-x-2 mt-0.5">
                        <span className="text-xs font-bold text-burgundy">₹{item.price}</span>
                        <span className="text-[10px] text-charcoal/40 line-through">₹{item.mrp}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSingleItem(item)}
                    className="shrink-0 border border-burgundy hover:bg-burgundy hover:text-white text-burgundy px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-1"
                  >
                    <FiShoppingBag className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Total Ensemble Price and Buy Whole Outfit Button */}
            <div className="pt-4 border-t border-champagne/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-charcoal/60 uppercase tracking-wider block">Total Ensemble</span>
                <div className="flex items-baseline space-x-2">
                  <span className="font-serif text-2xl font-bold text-burgundy">
                    ₹{totalOutfitPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-charcoal/40 line-through">
                    ₹{totalOutfitMrp.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddFullOutfit}
                className="bg-burgundy hover:bg-burgundy-hover text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm flex items-center justify-center space-x-2"
              >
                <FiCheck className="w-4 h-4" />
                <span>Buy Complete Outfit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopTheLook;
