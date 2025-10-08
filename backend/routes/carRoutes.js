// routes/carRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

import {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
} from '../controllers/carController.js';

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);

// Protected routes for admin only
router.post('/', protect, authorize('admin'), createCar);
router.put('/:id', protect, authorize('admin'), updateCar);
router.delete('/:id', protect, authorize('admin'), deleteCar);

export default router; // ✅ ES Module default export
