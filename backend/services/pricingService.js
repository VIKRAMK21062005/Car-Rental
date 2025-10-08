const Car = require('../models/Car');
const logger = require('../utils/logger');

// Calculate dynamic pricing
const calculatePrice = async (carId, hours, startDate) => {
  try {
    const car = await Car.findById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    let basePrice = car.rentPerHour * hours;
    let multiplier = 1;

    // Weekend pricing (Friday, Saturday, Sunday)
    const dayOfWeek = new Date(startDate).getDay();
    if ([0, 5, 6].includes(dayOfWeek)) {
      multiplier += 0.2; // 20% increase on weekends
    }

    // Holiday pricing (simplified - you can enhance this)
    const holidays = [
      '2024-01-01', '2024-08-15', '2024-10-02', '2024-12-25'
    ];
    const dateString = new Date(startDate).toISOString().split('T')[0];
    if (holidays.includes(dateString)) {
      multiplier += 0.3; // 30% increase on holidays
    }

    // Long term discount
    if (hours >= 168) { // 7 days or more
      multiplier -= 0.15; // 15% discount for weekly rentals
    } else if (hours >= 72) { // 3 days or more
      multiplier -= 0.1; // 10% discount for 3+ days
    }

    // Demand-based pricing (simplified)
    const currentBookings = await require('../models/Booking').countDocuments({
      startDate: { $lte: new Date(startDate) },
      endDate: { $gte: new Date(startDate) },
      bookingStatus: { $in: ['confirmed', 'ongoing'] }
    });

    if (currentBookings > 10) {
      multiplier += 0.15; // 15% increase during high demand
    }

    const finalPrice = Math.round(basePrice * multiplier);
    
    logger.info(`Price calculated for car ${carId}: Base: ${basePrice}, Multiplier: ${multiplier}, Final: ${finalPrice}`);
    
    return finalPrice;

  } catch (error) {
    logger.error('Pricing calculation error:', error);
    // Return base price as fallback
    const car = await Car.findById(carId);
    return car ? car.rentPerHour * hours : 0;
  }
};

// Get price breakdown
const getPriceBreakdown = async (carId, hours, startDate, couponCode = null) => {
  try {
    const car = await Car.findById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    const basePrice = car.rentPerHour * hours;
    const finalPrice = await calculatePrice(carId, hours, startDate);
    const adjustments = finalPrice - basePrice;

    let discount = 0;
    if (couponCode) {
      const Coupon = require('../models/Coupon');
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validTill: { $gte: new Date() }
      });

      if (coupon && finalPrice >= coupon.minimumAmount) {
        discount = coupon.discountType === 'percentage' 
          ? Math.min((finalPrice * coupon.discountValue) / 100, coupon.maximumDiscount || finalPrice)
          : coupon.discountValue;
      }
    }

    return {
      basePrice,
      adjustments,
      discount,
      finalPrice: finalPrice - discount,
      breakdown: {
        hourlyRate: car.rentPerHour,
        hours,
        subtotal: basePrice,
        priceAdjustments: adjustments,
        couponDiscount: -discount,
        total: finalPrice - discount
      }
    };

  } catch (error) {
    logger.error('Price breakdown error:', error);
    throw error;
  }
};

module.exports = {
  calculatePrice,
  getPriceBreakdown
};
