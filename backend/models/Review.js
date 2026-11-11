import { createTursoModel } from '../config/tursoModel.js';

const Review = createTursoModel('Review', 'reviews', {
  defaults: {
    userAvatar: '',
    images: [],
    isVerifiedPurchase: false,
    status: 'approved',
  },
});

export default Review;
