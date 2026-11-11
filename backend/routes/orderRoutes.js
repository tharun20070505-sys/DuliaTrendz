import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderTrackingInfo,
  cancelOrder,
  requestReturn,
  getAdminOrders,
  updateOrderStatus,
  updateReturnStatus,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.get('/track/:orderNumber', getOrderTrackingInfo);
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/cancel', protect, cancelOrder);
router.post('/:id/return', protect, requestReturn);

// Admin routes
router.get('/admin/all', protect, admin, getAdminOrders);
router.patch('/admin/:id/status', protect, admin, updateOrderStatus);
router.patch('/admin/:id/return-status', protect, admin, updateReturnStatus);

export default router;
