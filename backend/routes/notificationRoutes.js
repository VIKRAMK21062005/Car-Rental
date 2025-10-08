import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  sendNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Public (OTP maybe)
router.post('/send-otp', sendNotification);

// User routes
router.get('/user/:userId', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

// Admin routes
router.post('/send', protect, authorize('admin'), sendNotification);

export default router;
