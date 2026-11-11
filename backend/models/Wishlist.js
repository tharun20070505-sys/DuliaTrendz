import { createTursoModel } from '../config/tursoModel.js';

const Wishlist = createTursoModel('Wishlist', 'wishlists', {
  defaults: {
    products: [],
  },
});

export default Wishlist;
