import express from 'express';
import {
  getInventory,
  getLowStock,
  updateVariantStock,
  getMovements,
} from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, admin);

router.get('/', getInventory);
router.get('/low-stock', getLowStock);
router.patch('/variants/:variantSku', updateVariantStock);
router.get('/movements', getMovements);

export default router;
