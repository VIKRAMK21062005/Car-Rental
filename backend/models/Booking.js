// backend/models/Booking.js - ENHANCED VERSION
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookedTimeSlots: {
      from: { type: String, required: true },
      to: { type: String, required: true },
    },
    totalHours: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    // ✅ NEW: Additional fields
    paymentMethod: {
      type: String,
      default: 'stripe'
    },
    hasRated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ car: 1, status: 1 });
bookingSchema.index({ 'bookedTimeSlots.from': 1, 'bookedTimeSlots.to': 1 });

export default mongoose.model('Booking', bookingSchema);