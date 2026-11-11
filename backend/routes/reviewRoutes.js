import express from 'express';
import {
  getProductReviews,
  addProductReview,
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, addProductReview);

// Admin routes
router.get('/admin/all', protect, admin, getAdminReviews);
router.patch('/admin/:id', protect, admin, updateReviewStatus);
router.delete('/admin/:id', protect, admin, deleteReview);

export default router;
