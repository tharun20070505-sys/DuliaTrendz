import { createTursoModel } from '../config/tursoModel.js';

const StoreSettings = createTursoModel('StoreSettings', 'store_settings', {
  defaults: {
    storeName: 'Dulia Trendz',
    tagline: 'Your Style, Our Passion...',
    announcementBar: {
      text: 'NEW SEASON COLLECTION — FREE SHIPPING ON ELIGIBLE ORDERS',
      enabled: true,
      link: '/shop',
    },
    shipping: {
      freeShippingThreshold: 999,
      standardShippingFee: 99,
      expressShippingFee: 199,
    },
    cod: {
      enabled: true,
      minOrderAmount: 499,
      maxOrderAmount: 10000,
      codFee: 49,
      eligiblePincodes: [],
    },
    inventory: {
      lowStockThresholdDefault: 5,
    },
    contact: {
      email: 'care@duliatrendz.com',
      phone: '+91 98765 43210',
      address: 'Dulia Trendz Studio, Fashion Boulevard, Mumbai, MH 400001',
    },
    homepageHeroSlides: [],
    homepageCategorySlides: [],
    occasionSlides: [],
  },
});

export default StoreSettings;
