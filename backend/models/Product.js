import { createTursoModel } from '../config/tursoModel.js';

const Product = createTursoModel('Product', 'products', {
  defaults: {
    brand: 'Dulia Trendz',
    images: [],
    variants: [],
    specifications: {
      fabric: 'Cotton Blend',
      fit: 'Regular',
      pattern: 'Printed / Solid',
      sleeve: 'Three-Quarter Sleeves',
      neck: 'Round Neck',
      length: 'Calf Length',
      occasion: 'Casual & Festive',
      careInstructions: 'Dry clean recommended or gentle hand wash in cold water.',
      countryOfOrigin: 'India',
    },
    shipping: {
      weight: 0.5,
      dimensions: '30x25x3 cm',
      dispatchDays: '2-3 business days',
      returnEligible: true,
    },
    collections: [],
    featured: false,
    bestseller: false,
    newArrival: true,
    status: 'active',
    tags: [],
    ratings: {
      average: 0,
      count: 0,
    },
    totalSold: 0,
    lowStockThreshold: 5,
  },
  virtuals: {
    discountPercent: {
      get: function () {
        if (this.mrp && this.price && this.mrp > this.price) {
          return Math.round(((this.mrp - this.price) / this.mrp) * 100);
        }
        return 0;
      },
    },
    totalStock: {
      get: function () {
        if (!this.variants || this.variants.length === 0) return 0;
        return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      },
    },
  },
});

export default Product;
