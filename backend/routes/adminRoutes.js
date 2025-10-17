// backend/routes/adminRoutes.js - COMPLETE VERSION
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
} from '../controllers/adminController.js';

const router = express.Router();

// Admin dashboard stats
router.get('/stats', protect, authorize('admin'), getDashboardStats);

// User management routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;