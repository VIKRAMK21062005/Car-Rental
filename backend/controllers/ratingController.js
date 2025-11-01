// backend/controllers/ratingController.js
import asyncHandler from 'express-async-handler';
import Rating from '../models/Rating.js';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';

// @desc    Create a new rating
// @route   POST /api/ratings
// @access  Private
export const createRating = asyncHandler(async (req, res) => {
  const { bookingId, carId, rating, review } = req.body;
  const userId = req.user._id;

  // Validate rating value
  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  // Check if booking exists and belongs to user
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to rate this booking');
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    res.status(400);
    throw new Error('Can only rate completed bookings');
  }

  // Check if already rated
  const existingRating = await Rating.findOne({ booking: bookingId });
  if (existingRating) {
    res.status(400);
    throw new Error('You have already rated this booking');
  }

  // Create rating
  const newRating = await Rating.create({
    booking: bookingId,
    car: carId,
    user: userId,
    rating,
    review: review || ''
  });

  // Update booking
  booking.hasRated = true;
  await booking.save();

  // Update car average rating
  await updateCarAverageRating(carId);

  res.status(201).json({
    success: true,
    message: 'Rating submitted successfully',
    data: newRating
  });
});

// @desc    Get ratings for a specific car
// @route   GET /api/ratings/car/:carId
// @access  Public
export const getRatingsByCarId = asyncHandler(async (req, res) => {
  const { carId } = req.params;
  
  const ratings = await Rating.find({ 
    car: carId,
    isApproved: true 
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: ratings.length,
    data: ratings
  });
});

// @desc    Get user's own ratings
// @route   GET /api/ratings/user/my-ratings
// @access  Private
export const getUserRatings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const ratings = await Rating.find({ user: userId })
    .populate('car', 'name brand model image')
    .populate('booking')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: ratings.length,
    data: ratings
  });
});

// @desc    Update a rating
// @route   PUT /api/ratings/:id
// @access  Private
export const updateRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;
  const userId = req.user._id;

  const existingRating = await Rating.findById(id);

  if (!existingRating) {
    res.status(404);
    throw new Error('Rating not found');
  }

  if (existingRating.user.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this rating');
  }

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  existingRating.rating = rating || existingRating.rating;
  existingRating.review = review !== undefined ? review : existingRating.review;

  await existingRating.save();

  // Update car average rating
  await updateCarAverageRating(existingRating.car);

  res.json({
    success: true,
    message: 'Rating updated successfully',
    data: existingRating
  });
});

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private
export const deleteRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const rating = await Rating.findById(id);

  if (!rating) {
    res.status(404);
    throw new Error('Rating not found');
  }

  if (rating.user.toString() !== userId.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this rating');
  }

  const carId = rating.car;

  await rating.deleteOne();

  // Update car average rating
  await updateCarAverageRating(carId);

  // Update booking
  await Booking.findByIdAndUpdate(rating.booking, { hasRated: false });

  res.json({
    success: true,
    message: 'Rating deleted successfully'
  });
});

// @desc    Get average rating for a car
// @route   GET /api/ratings/car/:carId/average
// @access  Public
export const getAverageRating = asyncHandler(async (req, res) => {
  const { carId } = req.params;

  const ratings = await Rating.find({ 
    car: carId,
    isApproved: true 
  });

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  res.json({
    success: true,
    data: {
      averageRating: avgRating.toFixed(1),
      totalRatings: ratings.length,
      distribution: {
        5: ratings.filter(r => r.rating === 5).length,
        4: ratings.filter(r => r.rating === 4).length,
        3: ratings.filter(r => r.rating === 3).length,
        2: ratings.filter(r => r.rating === 2).length,
        1: ratings.filter(r => r.rating === 1).length
      }
    }
  });
});

// Helper function to update car's average rating
const updateCarAverageRating = async (carId) => {
  const ratings = await Rating.find({ 
    car: carId,
    isApproved: true 
  });

  if (ratings.length > 0) {
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await Car.findByIdAndUpdate(carId, {
      averageRating: avgRating,
      totalRatings: ratings.length
    });
  } else {
    await Car.findByIdAndUpdate(carId, {
      averageRating: 0,
      totalRatings: 0
    });
  }
};