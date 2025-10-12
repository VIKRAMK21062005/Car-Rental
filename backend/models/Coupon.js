import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code must not exceed 20 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  minRentalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum rental amount cannot be negative']
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount cannot be negative']
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required'],
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  userLimit: {
    type: Number,
    default: 1, // How many times a single user can use this coupon
    min: [1, 'User limit must be at least 1']
  },
  applicableVehicleTypes: {
    type: [String],
    enum: ['economy', 'sedan', 'suv', 'luxury', 'van', 'all'],
    default: ['all']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Virtual property to check if coupon is valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  const isDateValid = now >= this.validFrom && now <= this.validUntil;
  const isLimitValid = !this.usageLimit || this.usageCount < this.usageLimit;
  return this.isActive && isDateValid && isLimitValid;
});

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(rentalAmount) {
  if (rentalAmount < this.minRentalAmount) {
    return 0;
  }

  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (rentalAmount * this.discountValue) / 100;
    
    // Apply max discount limit if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.discountType === 'fixed') {
    discount = this.discountValue;
  }

  // Ensure discount doesn't exceed rental amount
  return Math.min(discount, rentalAmount);
};

// Method to check if user can use this coupon
couponSchema.methods.canUserUseCoupon = function(userId) {
  const userUsageCount = this.usedBy.filter(
    usage => usage.user.toString() === userId.toString()
  ).length;

  return userUsageCount < this.userLimit;
};

// Pre-save middleware to ensure validUntil is after validFrom
couponSchema.pre('save', function(next) {
  if (this.validUntil <= this.validFrom) {
    next(new Error('Valid until date must be after valid from date'));
  }
  next();
});

// Ensure virtuals are included when converting to JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

export default mongoose.model('Coupon', couponSchema);  