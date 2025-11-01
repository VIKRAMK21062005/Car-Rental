// frontend/src/services/ratingService.js
import api from './api';

export const createRating = async (ratingData) => {
  try {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  } catch (error) {
    console.error('Create Rating Error:', error);
    throw error;
  }
};

export const getRatingsByCarId = async (carId) => {
  try {
    const response = await api.get(`/ratings/car/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Get Ratings Error:', error);
    throw error;
  }
};

export const getUserRatings = async () => {
  try {
    const response = await api.get('/ratings/user/my-ratings');
    return response.data;
  } catch (error) {
    console.error('Get User Ratings Error:', error);
    throw error;
  }
};

export const updateRating = async (ratingId, ratingData) => {
  try {
    const response = await api.put(`/ratings/${ratingId}`, ratingData);
    return response.data;
  } catch (error) {
    console.error('Update Rating Error:', error);
    throw error;
  }
};

export const deleteRating = async (ratingId) => {
  try {
    const response = await api.delete(`/ratings/${ratingId}`);
    return response.data;
  } catch (error) {
    console.error('Delete Rating Error:', error);
    throw error;
  }
};

export const getAverageRating = async (carId) => {
  try {
    const response = await api.get(`/ratings/car/${carId}/average`);
    return response.data;
  } catch (error) {
    console.error('Get Average Rating Error:', error);
    throw error;
  }
};