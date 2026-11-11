import express from 'express';
import {
  getStoreSettings,
  updateStoreSettings,
  checkPincode,
  subscribeNewsletter,
} from '../controllers/storeSettingsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getStoreSettings);
router.post('/check-pincode', checkPincode);
router.post('/newsletter', subscribeNewsletter);
router.put('/', protect, admin, updateStoreSettings);

export default router;
