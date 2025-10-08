const Joi = require('joi');

// User registration validation
const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required()
  });
  
  return schema.validate(data);
};

// User login validation
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  
  return schema.validate(data);
};

// Car validation
const validateCar = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    brand: Joi.string().min(2).max(50).required(),
    model: Joi.string().min(2).max(50).required(),
    year: Joi.number().min(1980).max(new Date().getFullYear() + 1).required(),
    rentPerHour: Joi.number().min(1).required(),
    fuelType: Joi.string().valid('Petrol', 'Diesel', 'Electric', 'Hybrid').required(),
    transmission: Joi.string().valid('Manual', 'Automatic').required(),
    seatingCapacity: Joi.number().min(2).max(8).required(),
    mileage: Joi.number().min(1).required(),
    registrationNumber: Joi.string().required()
  });
  
  return schema.validate(data);
};

// Booking validation
const validateBooking = (data) => {
  const schema = Joi.object({
    car: Joi.string().required(),
    startDate: Joi.date().min('now').required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required()
  });
  
  return schema.validate(data);
};

module.exports = {
  validateRegister,
  validateLogin,
  validateCar,
  validateBooking
};