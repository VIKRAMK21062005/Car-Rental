// backend/controllers/authController.js - ENHANCED VERSION
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
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
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
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// -------------------------------
// Create First Admin (One-time setup)
// -------------------------------
export const createFirstAdmin = asyncHandler(async (req, res) => {
  // Check if any admin exists
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