import Coupon from '../models/Coupon.js';
import mongoose from 'mongoose';

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minRentalAmount,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      userLimit,
      applicableVehicleTypes,
      isActive
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code already exists'
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minRentalAmount: minRentalAmount || 0,
      maxDiscount: maxDiscount || null,
      validFrom: validFrom || Date.now(),
      validUntil,
      usageLimit: usageLimit || null,
      userLimit: userLimit || 1,
      applicableVehicleTypes: applicableVehicleTypes || ['all'],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?._id || null
    });

    res.status(201).json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('Create Coupon Error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create coupon'
    });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res) => {
  try {
    const { isActive, discountType, page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (discountType) {
      query.discountType = discountType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Coupon.countDocuments(query);

    res.status(200).json({
      success: true,
      count: coupons.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: coupons
    });

  } catch (error) {
    console.error('Get All Coupons Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve coupons'
    });
  }
};

// @desc    Get active/valid coupons (for users)
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
      ]
    })
      .select('-usedBy -createdBy')
      .sort({ discountValue: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });

  } catch (error) {
    console.error('Get Active Coupons Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve active coupons'
    });
  }
};

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coupon ID'
      });
    }

    const coupon = await Coupon.findById(id).populate('createdBy', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('Get Coupon By ID Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve coupon'
    });
  }
};

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Public/Private
export const validateCoupon = async (req, res) => {
  try {
    const { code, rentalAmount, vehicleType, userId } = req.body;

    if (!code || !rentalAmount) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code and rental amount are required'
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Invalid coupon code'
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        error: 'This coupon is no longer active'
      });
    }

    // Check if coupon is within valid date range
    const now = new Date();
    if (now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        error: `This coupon is valid from ${coupon.validFrom.toDateString()}`
      });
    }

    if (now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        error: 'This coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        error: 'This coupon has reached its usage limit'
      });
    }

    // Check minimum rental amount
    if (rentalAmount < coupon.minRentalAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum rental amount for this coupon is ₹${coupon.minRentalAmount}`
      });
    }

    // Check vehicle type applicability
    if (vehicleType && !coupon.applicableVehicleTypes.includes('all') && 
        !coupon.applicableVehicleTypes.includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        error: 'This coupon is not applicable for the selected vehicle type'
      });
    }

    // Check user usage limit (if userId provided)
    if (userId && !coupon.canUserUseCoupon(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already used this coupon the maximum number of times'
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(rentalAmount);
    const finalAmount = rentalAmount - discountAmount;

    res.status(200).json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        },
        originalAmount: rentalAmount,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        savings: discountAmount
      }
    });

  } catch (error) {
    console.error('Validate Coupon Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate coupon'
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coupon ID'
      });
    }

    let coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    // Don't allow updating the code
    const { code, ...updateData } = req.body;

    coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('Update Coupon Error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update coupon'
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coupon ID'
      });
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Delete Coupon Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete coupon'
    });
  }
};

// @desc    Apply coupon to booking
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = async (req, res) => {
  try {
    const { code, rentalAmount, vehicleType, userId, bookingId } = req.body;

    if (!code || !rentalAmount || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code, rental amount, and user ID are required'
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired coupon'
      });
    }

    // All validation checks (same as validateCoupon)
    if (rentalAmount < coupon.minRentalAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum rental amount is ₹${coupon.minRentalAmount}`
      });
    }

    if (!coupon.canUserUseCoupon(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Coupon usage limit reached for this user'
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(rentalAmount);

    // Update coupon usage
    coupon.usageCount += 1;
    coupon.usedBy.push({
      user: userId,
      usedAt: new Date(),
      bookingId: bookingId || null
    });

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        discountAmount,
        finalAmount: rentalAmount - discountAmount
      }
    });

  } catch (error) {
    console.error('Apply Coupon Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply coupon',
      details: error.message
    });
  }
};

// @desc    Get coupon statistics
// @route   GET /api/coupons/stats
// @access  Private/Admin
export const getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const expiredCoupons = await Coupon.countDocuments({
      validUntil: { $lt: new Date() }
    });

    const stats = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalUsage: { $sum: '$usageCount' },
          averageDiscount: { $avg: '$discountValue' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUsage: stats[0]?.totalUsage || 0,
        averageDiscount: stats[0]?.averageDiscount || 0
      }
    });

  } catch (error) {
    console.error('Get Coupon Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve coupon statistics'
    });
  }
};