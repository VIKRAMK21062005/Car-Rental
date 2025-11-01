// backend/routes/ratingRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRating,
  getRatingsByCarId,
  getUserRatings,
  updateRating,
  deleteRating,
  getAverageRating
} from '../controllers/ratingController.js';

const router = express.Router();

// Public routes
router.get('/car/:carId', getRatingsByCarId);
router.get('/car/:carId/average', getAverageRating);

// Protected routes (user must be logged in)
router.post('/', protect, createRating);
router.get('/user/my-ratings', protect, getUserRatings);
router.put('/:id', protect, updateRating);
router.delete('/:id', protect, deleteRating);

export default router;

// ====================================
// ADD THIS TO backend/server.js
// ====================================
// Import at the top:
// import ratingRoutes from './routes/ratingRoutes.js';

// Add this line with other route registrations:
// app.use('/api/ratings', ratingRoutes);