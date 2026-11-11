import express from 'express';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getAdminCustomers,
  getAdminDashboardStats,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Customer address routes
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

// Admin dashboard & customer management routes
router.get('/admin/dashboard-stats', protect, admin, getAdminDashboardStats);
router.get('/admin/customers', protect, admin, getAdminCustomers);

export default router;
