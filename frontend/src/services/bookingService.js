import api from './api';

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings');
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/cancel`);
  return response.data;
};

export const createPaymentIntent = async (bookingId) => {
  const response = await api.post('/bookings/create-payment-intent', { bookingId });
  return response.data;
};

export const confirmPayment = async (bookingId, paymentIntentId) => {
  const response = await api.post('/bookings/confirm-payment', { bookingId, paymentIntentId });
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