// backend/controllers/authController.js - COMPLETE VERSION
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// -------------------------------
// Register user/admin
// -------------------------------
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, adminSecret } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please provide name, email, password, and phone');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Admin registration requires secret key
  let userRole = 'user';
  if (role === 'admin') {
    const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'your-super-secret-admin-key-2024';
    if (adminSecret !== ADMIN_SECRET) {
      res.status(403);
      throw new Error('Invalid admin secret key');
    }
    userRole = 'admin';
  }

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    phone,
  });

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token: generateToken(user),
  });
});

// -------------------------------
// Login user/admin
// -------------------------------
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token: generateToken(user),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// -------------------------------
// Get User Profile
// -------------------------------
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user) {
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// -------------------------------
// Update User Profile
// -------------------------------
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    
    // Only allow email update if it's not taken
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already taken');
      }
      user.email = req.body.email;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// -------------------------------
// Change Password
// -------------------------------
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } else {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
});

// -------------------------------
// Logout User
// -------------------------------
export const logoutUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// -------------------------------
// Create First Admin (One-time setup)
// -------------------------------
export const createFirstAdmin = asyncHandler(async (req, res) => {
  const adminExists = await User.findOne({ role: 'admin' });
  
  if (adminExists) {
    res.status(400);
    throw new Error('Admin already exists. Use registration with admin secret.');
  }

  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const admin = await User.create({
    name,
    email,
    password,
    phone,
    role: 'admin'
  });

  res.status(201).json({
    success: true,
    message: 'First admin created successfully',
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin)
    }
  });
});