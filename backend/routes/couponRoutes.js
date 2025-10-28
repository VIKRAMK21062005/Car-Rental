// backend/routes/couponRoutes.js - FIXED VERSION
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponById,
  getActiveCoupons,
  applyCoupon,
  getCouponStats
} from '../controllers/couponController.js';

const router = express.Router();

// ========================================
// PUBLIC ROUTES (no authentication required)
// ========================================
router.get('/active', getActiveCoupons);  // ✅ Get active coupons

// ========================================
// AUTHENTICATED USER ROUTES
// ========================================
router.post('/validate', protect, validateCoupon);  // Validate coupon
router.post('/apply', protect, applyCoupon);        // Apply coupon to booking

// ========================================
// ADMIN ROUTES (admin authentication required)
// ========================================
router.get('/stats', protect, authorize('admin'), getCouponStats);

router.route('/')
  .get(protect, authorize('admin'), getAllCoupons)     // Get all coupons
  .post(protect, authorize('admin'), createCoupon);    // Create new coupon

router.route('/:id')
  .get(protect, authorize('admin'), getCouponById)     // Get coupon by ID
  .put(protect, authorize('admin'), updateCoupon)      // Update coupon
  .delete(protect, authorize('admin'), deleteCoupon);  // Delete coupon

export default router;