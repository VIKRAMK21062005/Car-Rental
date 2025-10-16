// backend/routes/bookingRoutes.js - ENHANCED VERSION
import express from 'express';
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  createPaymentIntent,
  cancelBooking,
  generateInvoice,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Payment
router.post('/create-payment-intent', protect, createPaymentIntent);

// Booking CRUD
router.post('/book', protect, createBooking);
router.get('/user/:userId', protect, getUserBookings);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/:id/invoice', protect, generateInvoice);

// Admin routes
router.get('/all', protect, authorize('admin'), getAllBookings);
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);

export default router;