// backend/models/Car.js - ENHANCED VERSION
import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Car name is required'],
    trim: true 
  },
  brand: { 
    type: String, 
    required: [true, 'Brand is required'],
    trim: true 
  },
  model: { 
    type: String, 
    required: [true, 'Model is required'],
    trim: true 
  },
  year: { 
    type: Number, 
    required: [true, 'Year is required'],
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  pricePerDay: { 
    type: Number, 
    required: [true, 'Price per day is required'],
    min: 0
  },
  type: {
    type: String,
    enum: ['sedan', 'suv', 'sports', 'luxury', 'van'],
    default: 'sedan'
  },
  seats: {
    type: Number,
    default: 5,
    min: 2,
    max: 15
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    default: 'petrol'
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'automatic'
  },
  features: {
    type: [String],
    default: []
  },
  registrationNumber: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  available: { 
    type: Boolean, 
    default: true 
  },
  image: { 
    type: String,
    default: ''
  },
  bookedTimeSlots: {
    type: [{
      from: { type: String },
      to: { type: String }
    }],
    default: []
  },
  // ✅ NEW: Rating fields
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
carSchema.index({ name: 'text', brand: 'text', model: 'text' });
carSchema.index({ available: 1 });
carSchema.index({ type: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ averageRating: -1 });

const Car = mongoose.model('Car', carSchema);

export default Car;