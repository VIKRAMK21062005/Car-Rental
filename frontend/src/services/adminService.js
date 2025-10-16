// frontend/src/services/adminService.js
import api from './api';

// Dashboard Statistics
export const getDashboardStats = async () => {
  try {
    // Since backend doesn't have a stats endpoint, calculate from available data
    const [cars, bookings, users] = await Promise.all([
      api.get('/cars'),
      api.get('/bookings/all'),
      api.get('/admin/users')
    ]);

    const stats = {
      totalCars: cars.data.length,
      totalBookings: bookings.data.length,
      totalUsers: users.data.length,
      totalRevenue: bookings.data.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
      recentBookings: bookings.data.slice(0, 5).map(booking => ({
        ...booking,
        totalPrice: booking.totalAmount
      }))
    };

    return stats;
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    throw error;
  }
};

// Booking Management
export const getAllBookings = async (filters = {}) => {
  try {
    const response = await api.get('/bookings/all');
    let bookings = response.data;

    // Apply filters
    if (filters.status) {
      bookings = bookings.filter(b => b.status === filters.status);
    }

    return bookings;
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    // Backend doesn't have this endpoint, so we'll create a custom implementation
    const response = await api.put(`/bookings/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    throw error;
  }
};

export const getBookingDetails = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get Booking Details Error:', error);
    throw error;
  }
};

// User Management
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Get All Users Error:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get User Error:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Update User Error:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete User Error:', error);
    throw error;
  }
};

// Coupon Management
export const getAllCoupons = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/coupons?${params}`);
    return response.data;
  } catch (error) {
    console.error('Get All Coupons Error:', error);
    throw error;
  }
};

export const createCoupon = async (couponData) => {
  try {
    const response = await api.post('/coupons', couponData);
    return response.data;
  } catch (error) {
    console.error('Create Coupon Error:', error);
    throw error;
  }
};

export const updateCoupon = async (id, couponData) => {
  try {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data;
  } catch (error) {
    console.error('Update Coupon Error:', error);
    throw error;
  }
};

export const deleteCoupon = async (id) => {
  try {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete Coupon Error:', error);
    throw error;
  }
};

export const getCouponStats = async () => {
  try {
    const response = await api.get('/coupons/stats');
    return response.data;
  } catch (error) {
    console.error('Get Coupon Stats Error:', error);
    throw error;
  }
};

// Notification Management
export const sendNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications/send', notificationData);
    return response.data;
  } catch (error) {
    console.error('Send Notification Error:', error);
    throw error;
  }
};

export const sendBulkNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications/send-bulk', notificationData);
    return response.data;
  } catch (error) {
    console.error('Send Bulk Notification Error:', error);
    throw error;
  }
};

// Analytics
export const getBookingAnalytics = async (period = '30d') => {
  try {
    const bookings = await getAllBookings();
    
    const now = new Date();
    const periodDays = parseInt(period);
    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    
    const filteredBookings = bookings.filter(b => 
      new Date(b.createdAt) >= startDate
    );
    
    return {
      totalBookings: filteredBookings.length,
      totalRevenue: filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      averageBookingValue: filteredBookings.length > 0 
        ? filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / filteredBookings.length 
        : 0,
      bookingsByStatus: {
        confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
        pending: filteredBookings.filter(b => b.status === 'pending').length,
        cancelled: filteredBookings.filter(b => b.status === 'cancelled').length
      }
    };
  } catch (error) {
    console.error('Get Analytics Error:', error);
    throw error;
  }
};

export const getRevenueAnalytics = async (period = '30d') => {
  try {
    const bookings = await getAllBookings();
    
    const now = new Date();
    const periodDays = parseInt(period);
    
    const revenueByDay = {};
    
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      revenueByDay[dateKey] = 0;
    }
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
      if (revenueByDay.hasOwnProperty(bookingDate)) {
        revenueByDay[bookingDate] += booking.totalAmount || 0;
      }
    });
    
    return Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue
    })).reverse();
  } catch (error) {
    console.error('Get Revenue Analytics Error:', error);
    throw error;
  }
};