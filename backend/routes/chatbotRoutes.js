import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getActiveCoupons,
  getCouponById,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  getCouponStats
} from '../controllers/couponController.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveCoupons);
router.post('/validate', validateCoupon);

// Admin routes (add authentication middleware as needed)
router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.get('/stats', getCouponStats);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

// Apply coupon (requires authentication)
router.post('/apply', applyCoupon);

export default router;