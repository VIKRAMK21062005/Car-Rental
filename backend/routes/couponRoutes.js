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

// Public or authenticated routes
router.post('/validate', protect, validateCoupon);  // Validate coupon for a user
router.get('/active', getActiveCoupons);            // Get active coupons (public)

// Admin-only statistics
router.get('/stats', getCouponStats);

// Apply coupon (authenticated users)
router.post('/apply', protect, applyCoupon);


// Admin-only routes
router.use(protect, authorize('admin'));  // All routes below are admin-protected

router.route('/')
  .get(getAllCoupons)  // Get all coupons
  .post(createCoupon); // Create new coupon

router.route('/:id')
  .get(getCouponById)  // Get coupon by ID
  .put(updateCoupon)   // Update coupon
  .delete(deleteCoupon); // Delete coupon



export default router;
