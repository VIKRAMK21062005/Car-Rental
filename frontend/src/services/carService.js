import api from './api';

export const getCars = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/cars?${params}`);
  return response.data;
};

export const getCarById = async (id) => {
  const response = await api.get(`/cars/${id}`);
  return response.data;
};

export const createCar = async (carData) => {
  const response = await api.post('/cars', carData);
  return response.data;
};

export const updateCar = async (id, carData) => {
  const response = await api.put(`/cars/${id}`, carData);
  return response.data;
};

export const deleteCar = async (id) => {
  const response = await api.delete(`/cars/${id}`);
  return response.data;
};

export const uploadCarImage = async (id, formData) => {
  const response = await api.post(`/cars/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const searchCars = async (query) => {
  const response = await api.get(`/cars/search?q=${query}`);
  return response.data;
};