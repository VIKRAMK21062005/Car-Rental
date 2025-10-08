// routes/bookingRoutes.js
import express from 'express';
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  createPaymentIntent,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/book', protect, createBooking);
router.get('/user/:userId', protect, getUserBookings);

// Admin-only route
router.get('/all', protect, authorize('admin'), getAllBookings);

export default router; // ✅ ES Module default export
