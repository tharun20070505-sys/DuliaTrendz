import { createTursoModel } from '../config/tursoModel.js';

const Coupon = createTursoModel('Coupon', 'coupons', {
  defaults: {
    minOrderAmount: 0,
    usageLimit: 1000,
    perUserLimit: 1,
    usedCount: 0,
    applicableCategories: [],
    applicableProducts: [],
    active: true,
  },
});

export default Coupon;
