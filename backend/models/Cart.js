import { createTursoModel } from '../config/tursoModel.js';

const Cart = createTursoModel('Cart', 'carts', {
  defaults: {
    items: [],
    coupon: null,
  },
});

export default Cart;
