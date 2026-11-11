import { createTursoModel } from '../config/tursoModel.js';

const Category = createTursoModel('Category', 'categories', {
  defaults: {
    description: '',
    image: '',
    subcategories: [],
    order: 0,
    active: true,
  },
});

export default Category;
