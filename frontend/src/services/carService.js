// frontend/src/services/carService.js
import api from './api';

export const getCars = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.available !== undefined) params.append('available', filters.available);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/cars?${queryString}` : '/cars';
    
    console.log('🔍 Fetching cars from:', url);
    const response = await api.get(url);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('❌ Get Cars Error:', error.response?.data || error);
    throw error;
  }
};

export const getCarById = async (id) => {
  try {
    const response = await api.get(`/cars/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('❌ Get Car Error:', error);
    throw error;
  }
};

export const createCar = async (carData) => {
  try {
    const response = await api.post('/cars', carData);
    return response.data;
  } catch (error) {
    console.error('❌ Create Car Error:', error);
    throw error;
  }
};

export const updateCar = async (id, carData) => {
  try {
    const response = await api.put(`/cars/${id}`, carData);
    return response.data;
  } catch (error) {
    console.error('❌ Update Car Error:', error);
    throw error;
  }
};

export const deleteCar = async (id) => {
  try {
    const response = await api.delete(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete Car Error:', error);
    throw error;
  }
};

export const uploadCarImage = async (id, formData) => {
  try {
    const response = await api.post(`/cars/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Upload Image Error:', error);
    throw error;
  }
};

export const searchCars = async (query) => {
  try {
    const response = await api.get(`/cars?search=${encodeURIComponent(query)}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('❌ Search Cars Error:', error);
    throw error;
  }
};