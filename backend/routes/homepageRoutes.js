import express from 'express';
import { getHomepageData, updateHomepageSettings } from '../controllers/homepageController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getHomepageData);
router.put('/', protect, admin, updateHomepageSettings);

export default router;
