// backend/routes/authRoutes.js - COMPLETE FIXED VERSION
import express from 'express';
import { 
  register, 
  login, 
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ PUBLIC ROUTES
router.post('/register', register);
router.post('/login', login);
//router.post('/logout', logoutUser);


// ✅ PROTECTED ROUTES (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;