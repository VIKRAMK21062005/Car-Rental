// controllers/bookingController.js
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import stripe from '../config/stripe.js';

// 🧾 Create Stripe Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // INR to paisa
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
    const user = req.user._id; // Secure: use logged-in user

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
