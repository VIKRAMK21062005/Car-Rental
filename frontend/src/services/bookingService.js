// frontend/src/services/bookingService.js
import api from './api';

export const createPaymentIntent = async (amount) => {
  try {
    const response = await api.post('/bookings/create-payment-intent', { amount });
    return response.data;
  } catch (error) {
    console.error('Payment Intent Error:', error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    // ✅ FIXED: Match backend expected format
    const formattedData = {
      car: bookingData.carId,
      bookedTimeSlots: {
        from: bookingData.startDate,
        to: bookingData.endDate
      },
      totalHours: bookingData.totalHours || calculateHours(bookingData.startDate, bookingData.endDate),
      totalAmount: bookingData.totalPrice || bookingData.totalAmount,
      transactionId: bookingData.transactionId || 'pending'
    };
    
    console.log('📤 Sending Booking Data:', formattedData);
    const response = await api.post('/bookings/book', formattedData);
    return response.data;
  } catch (error) {
    console.error('❌ Booking Error:', error.response?.data || error);
    throw error;
  }
};

export const getMyBookings = async () => {
  try {
    // ✅ FIXED: Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
      throw new Error('User not authenticated');
    }
    
    const response = await api.get(`/bookings/user/${user._id}`);
    return response.data;
  } catch (error) {
    console.error('Get Bookings Error:', error);
    throw error;
  }
};

export const getAllBookings = async () => {
  try {
    const response = await api.get('/bookings/all');
    return response.data;
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    throw error;
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get Booking Error:', error);
    throw error;
  }
};

export const cancelBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/cancel`);
  return response.data;
};

export const downloadInvoice = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}/invoice`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice-${bookingId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// Helper function to calculate hours
const calculateHours = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const hours = Math.ceil((end - start) / (1000 * 60 * 60));
  return hours > 0 ? hours : 24; // Minimum 24 hours
};