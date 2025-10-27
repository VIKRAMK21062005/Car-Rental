// backend/controllers/bookingController.js - ENHANCED VERSION
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import Rating from '../models/Rating.js';
import stripe from '../config/stripe.js';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 🧾 Create Stripe Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, carId, startDate, endDate } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Verify car availability
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { 'bookedTimeSlots.from': { $lt: endDate, $gte: startDate } },
        { 'bookedTimeSlots.to': { $lte: endDate, $gt: startDate } },
        { 
          'bookedTimeSlots.from': { $lte: startDate },
          'bookedTimeSlots.to': { $gte: endDate }
        }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ 
        message: 'Car is already booked for the selected time period' 
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
      metadata: {
        carId,
        userId: req.user._id.toString(),
        startDate,
        endDate
      }
    });

    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : null,
    });
  }
};

// 🚗 Create New Booking (After Payment Success)
export const createBooking = async (req, res) => {
  try {
    const { car, bookedTimeSlots, totalHours, totalAmount, transactionId } = req.body;
    const user = req.user._id;

    // Validate required fields
    if (!car || !bookedTimeSlots || !totalHours || !totalAmount) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['car', 'bookedTimeSlots', 'totalHours', 'totalAmount']
      });
    }

    const bookedCar = await Car.findById(car);
    if (!bookedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Final check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      car,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { 'bookedTimeSlots.from': { $lt: bookedTimeSlots.to, $gte: bookedTimeSlots.from } },
        { 'bookedTimeSlots.to': { $lte: bookedTimeSlots.to, $gt: bookedTimeSlots.from } },
        { 
          'bookedTimeSlots.from': { $lte: bookedTimeSlots.from },
          'bookedTimeSlots.to': { $gte: bookedTimeSlots.to }
        }
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        message: 'Car is already booked for the selected time slot. Please refresh and try again.' 
      });
    }

    const newBooking = new Booking({
      car,
      user,
      bookedTimeSlots,
      totalHours,
      totalAmount,
      transactionId: transactionId || 'PENDING',
      status: transactionId ? 'confirmed' : 'pending',
      paymentStatus: transactionId ? 'paid' : 'unpaid',
    });

    await newBooking.save();

    // Update car's booked slots
    bookedCar.bookedTimeSlots = bookedCar.bookedTimeSlots || [];
    bookedCar.bookedTimeSlots.push(bookedTimeSlots);
    await bookedCar.save();

    // Populate booking details
    await newBooking.populate('car');
    await newBooking.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Booking Creation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : null,
    });
  }
};

// 👤 Get All Bookings for a User
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate('car')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : null,
    });
  }
};

// 🧭 Get All Bookings (Admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('car')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : null,
    });
  }
};

// 🆕 Cancel Booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Remove from car's booked slots
    const car = await Car.findById(booking.car);
    if (car) {
      car.bookedTimeSlots = car.bookedTimeSlots.filter(
        slot => {
          const slotFrom = new Date(slot.from).getTime();
          const slotTo = new Date(slot.to).getTime();
          const bookingFrom = new Date(booking.bookedTimeSlots.from).getTime();
          const bookingTo = new Date(booking.bookedTimeSlots.to).getTime();
          return slotFrom !== bookingFrom || slotTo !== bookingTo;
        }
      );
      await car.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Generate Invoice PDF
export const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(id)
      .populate('car')
      .populate('user');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking._id}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(24).text('CAR RENTAL INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Invoice #: ${booking._id}`, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    // Customer Info
    doc.fontSize(14).text('Bill To:', { underline: true });
    doc.fontSize(10)
      .text(`Name: ${booking.user.name}`)
      .text(`Email: ${booking.user.email}`)
      .text(`Phone: ${booking.user.phone || 'N/A'}`)
      .moveDown(2);

    // Car Info
    doc.fontSize(14).text('Car Details:', { underline: true });
    doc.fontSize(10)
      .text(`Car: ${booking.car.name}`)
      .text(`Brand: ${booking.car.brand}`)
      .text(`Model: ${booking.car.model}`)
      .moveDown(2);

    // Booking Details
    doc.fontSize(14).text('Booking Details:', { underline: true });
    doc.fontSize(10)
      .text(`From: ${new Date(booking.bookedTimeSlots.from).toLocaleString()}`)
      .text(`To: ${new Date(booking.bookedTimeSlots.to).toLocaleString()}`)
      .text(`Total Hours: ${booking.totalHours}`)
      .text(`Status: ${booking.status.toUpperCase()}`)
      .moveDown(2);

    // Payment Summary
    doc.fontSize(14).text('Payment Summary:', { underline: true });
    doc.fontSize(10)
      .text(`Amount: ₹${booking.totalAmount}`)
      .text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`)
      .text(`Transaction ID: ${booking.transactionId || 'N/A'}`)
      .moveDown(2);

    // Total
    doc.fontSize(16)
      .text(`TOTAL AMOUNT: ₹${booking.totalAmount}`, { bold: true })
      .moveDown(3);

    // Footer
    doc.fontSize(8)
      .text('Thank you for choosing our car rental service!', { align: 'center' })
      .text('For support, contact: support@carrental.com', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Invoice Generation Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Update Booking Status (Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('car').populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Add Rating to Completed Booking
export const addRating = async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Can only rate completed bookings' 
      });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ booking: bookingId });
    if (existingRating) {
      return res.status(400).json({ message: 'Booking already rated' });
    }

    const newRating = await Rating.create({
      booking: bookingId,
      car: booking.car,
      user: userId,
      rating,
      review
    });

    // Update car average rating
    await updateCarRating(booking.car);

    res.status(201).json({
      success: true,
      message: 'Rating added successfully',
      rating: newRating
    });
  } catch (error) {
    console.error('Add Rating Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Get Car Ratings
export const getCarRatings = async (req, res) => {
  try {
    const { carId } = req.params;
    
    const ratings = await Rating.find({ car: carId, isApproved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.status(200).json({
      success: true,
      averageRating: avgRating.toFixed(1),
      totalRatings: ratings.length,
      ratings
    });
  } catch (error) {
    console.error('Get Ratings Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update car average rating
const updateCarRating = async (carId) => {
  try {
    const ratings = await Rating.find({ car: carId, isApproved: true });
    
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      await Car.findByIdAndUpdate(carId, {
        averageRating: avgRating,
        totalRatings: ratings.length
      });
    }
  } catch (error) {
    console.error('Update Car Rating Error:', error);
  }
};

export default {
  createPaymentIntent,
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  generateInvoice,
  updateBookingStatus,
  addRating,
  getCarRatings
};