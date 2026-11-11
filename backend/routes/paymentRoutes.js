import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  handleWebhook,
  getAdminPayments,
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/admin/all', protect, admin, getAdminPayments);
router.get('/:orderId/status', protect, getPaymentStatus);
router.post('/webhook', handleWebhook);

export default router;
