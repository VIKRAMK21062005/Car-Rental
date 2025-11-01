// backend/models/Booking.js - ENHANCED WITH COUPON SUPPORT
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
    
    // ✅ FIX: Enhanced pricing fields
    originalAmount: { 
      type: Number, 
      required: true,
      min: 0
    },
    discountAmount: { 
      type: Number, 
      default: 0,
      min: 0
    },
    totalAmount: { 
      type: Number, 
      required: true,
      min: 0
    },
    
    // ✅ FIX: Coupon tracking
    couponCode: {
      type: String,
      default: null,
      uppercase: true
    },
    
    transactionId: { type: String },
    
    // ✅ FIX: More detailed status management
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
    },
    
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },
    
    paymentMethod: {
      type: String,
      default: 'stripe'
    },
    
    // ✅ FIX: Rating tracking
    hasRated: {
      type: Boolean,
      default: false
    },
    
    // ✅ FIX: Status change history
    statusHistory: [{
      status: String,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      changedAt: {
        type: Date,
        default: Date.now
      },
      reason: String
    }],
    
    // ✅ FIX: Cancellation info
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    
    // ✅ FIX: Admin notes
    adminNotes: String,
    
  },
  { 
    timestamps: true 
  }
);

// Indexes for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ car: 1, status: 1 });
bookingSchema.index({ 'bookedTimeSlots.from': 1, 'bookedTimeSlots.to': 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ couponCode: 1 });

// ✅ FIX: Method to update status with history
bookingSchema.methods.updateStatus = async function(newStatus, userId, reason) {
  this.statusHistory.push({
    status: this.status, // Save old status
    changedBy: userId,
    changedAt: new Date(),
    reason: reason || `Status changed to ${newStatus}`
  });
  
  this.status = newStatus;
  return await this.save();
};

// ✅ FIX: Method to cancel booking
bookingSchema.methods.cancel = async function(userId, reason) {
  this.status = 'cancelled';
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  this.cancellationReason = reason || 'User requested cancellation';
  
  this.statusHistory.push({
    status: 'cancelled',
    changedBy: userId,
    changedAt: new Date(),
    reason: this.cancellationReason
  });
  
  return await this.save();
};

export default mongoose.model('Booking', bookingSchema);