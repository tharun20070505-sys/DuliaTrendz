import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getNewArrivals,
  getBestsellers,
  getFeatured,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  uploadImages,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/collections/new-arrivals', getNewArrivals);
router.get('/collections/bestsellers', getBestsellers);
router.get('/collections/featured', getFeatured);
router.get('/:slug', getProductBySlug);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/duplicate', protect, admin, duplicateProduct);
router.post('/upload-images', protect, admin, upload.array('images', 8), uploadImages);

export default router;
