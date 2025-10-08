
// services/bookingService.js
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import { validateBookingData } from '../utils/validateInputs.js';

/**
 * Create a new booking with transactional integrity.
 * @param {object} bookingData - The data for the new booking.
 * @param {string} userId - The ID of the user creating the booking.
 * @returns {object} The newly created booking.
 * @throws {Error} If the booking process fails.
 */
export const createBookingWithTransaction = async (bookingData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate booking data
    const { error } = validateBookingData(bookingData);
    if (error) {
      throw new Error(`Invalid booking data: ${error.details[0].message}`);
    }

    const { car, bookedTimeSlots, totalHours, totalAmount, transactionId } = bookingData;

    // 2. Check for car availability and overlapping bookings
    const bookedCar = await Car.findById(car).session(session);
    if (!bookedCar) {
      throw new Error('Car not found');
    }

    const overlappingBooking = await Booking.findOne({
      car,
      'bookedTimeSlots.from': { $lt: bookedTimeSlots.to },
      'bookedTimeSlots.to': { $gt: bookedTimeSlots.from },
    }).session(session);

    if (overlappingBooking) {
      throw new Error('Car is already booked for the selected time slot');
    }

    // 3. Create and save the new booking
    const newBooking = new Booking({
      car,
      user: userId,
      bookedTimeSlots,
      totalHours,
      totalAmount,
      transactionId,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    await newBooking.save({ session });

    // 4. Update the car's booked time slots
    bookedCar.bookedTimeSlots.push(bookedTimeSlots);
    await bookedCar.save({ session });

    // 5. Commit the transaction
    await session.commitTransaction();

    return newBooking;
  } catch (error) {
    // 6. Abort the transaction on error
    await session.abortTransaction();
    throw error; // Re-throw the error to be handled by the controller
  } finally {
    // 7. End the session
    session.endSession();
  }
};
