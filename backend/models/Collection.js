import { createTursoModel } from '../config/tursoModel.js';

const Collection = createTursoModel('Collection', 'collections', {
  defaults: {
    description: '',
    image: '',
    bannerImage: '',
    active: true,
    featured: false,
    order: 0,
  },
});

export default Collection;
