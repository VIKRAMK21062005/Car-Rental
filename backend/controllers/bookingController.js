// backend/controllers/bookingController.js - ENHANCED VERSION
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import stripe from '../config/stripe.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧾 Create Stripe Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : null,
    });
  }
};

// 🚗 Create New Booking
export const createBooking = async (req, res) => {
  try {
    const { car, bookedTimeSlots, totalHours, totalAmount, transactionId } = req.body;
    const user = req.user._id;

    const bookedCar = await Car.findById(car);
    if (!bookedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const overlappingBooking = await Booking.findOne({
      car,
      $or: [
        { 'bookedTimeSlots.from': { $lt: bookedTimeSlots.to, $gte: bookedTimeSlots.from } },
        { 'bookedTimeSlots.to': { $lte: bookedTimeSlots.to, $gt: bookedTimeSlots.from } },
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Car is already booked for the selected time slot' });
    }

    const newBooking = new Booking({
      car,
      user,
      bookedTimeSlots,
      totalHours,
      totalAmount,
      transactionId,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    await newBooking.save();

    bookedCar.bookedTimeSlots = bookedCar.bookedTimeSlots || [];
    bookedCar.bookedTimeSlots.push(bookedTimeSlots);
    await bookedCar.save();

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: newBooking,
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
      .populate('user')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
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

    // Check if user owns this booking or is admin
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
        slot => slot.from !== booking.bookedTimeSlots.from || slot.to !== booking.bookedTimeSlots.to
      );
      await car.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error(error);
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

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
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
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Update Booking Status (Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('car').populate('user');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};