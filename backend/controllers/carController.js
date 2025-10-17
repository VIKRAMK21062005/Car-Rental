// backend/controllers/carController.js - COMPLETE VERSION
import asyncHandler from 'express-async-handler';
import Car from '../models/Car.js';

// -------------------------------
// Create a new car (Admin only)
// -------------------------------
export const createCar = asyncHandler(async (req, res) => {
  const { 
    name, brand, model, year, pricePerDay, 
    type, seats, fuelType, transmission, features, image, available 
  } = req.body;

  // Validate required fields
  if (!name || !brand || !model || !year || !pricePerDay) {
    res.status(400);
    throw new Error('Please provide all required fields: name, brand, model, year, pricePerDay');
  }

  const car = await Car.create({
    name,
    brand,
    model,
    year,
    pricePerDay,
    type: type || 'sedan',
    seats: seats || 5,
    fuelType: fuelType || 'petrol',
    transmission: transmission || 'automatic',
    features: features || [],
    image: image || '',
    available: available !== undefined ? available : true,
  });

  res.status(201).json({
    success: true,
    message: 'Car created successfully',
    car,
  });
});

// -------------------------------
// Get all cars
// -------------------------------
export const getCars = asyncHandler(async (req, res) => {
  const { type, minPrice, maxPrice, available, search } = req.query;
  
  // Build query
  const query = {};
  
  if (type) query.type = type;
  if (available !== undefined) query.available = available === 'true';
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } }
    ];
  }

  const cars = await Car.find(query).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: cars.length,
    data: cars
  });
});

// -------------------------------
// Get car by ID
// -------------------------------
export const getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  
  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }
  
  res.status(200).json({
    success: true,
    data: car
  });
});

// -------------------------------
// Update car (Admin only)
// -------------------------------
export const updateCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  
  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }

  const { 
    name, brand, model, year, pricePerDay, 
    type, seats, fuelType, transmission, features, available, image 
  } = req.body;

  car.name = name || car.name;
  car.brand = brand || car.brand;
  car.model = model || car.model;
  car.year = year || car.year;
  car.pricePerDay = pricePerDay || car.pricePerDay;
  car.type = type || car.type;
  car.seats = seats || car.seats;
  car.fuelType = fuelType || car.fuelType;
  car.transmission = transmission || car.transmission;
  car.features = features || car.features;
  car.image = image !== undefined ? image : car.image;
  if (available !== undefined) car.available = available;

  const updatedCar = await car.save();
  
  res.status(200).json({ 
    success: true,
    message: 'Car updated successfully', 
    car: updatedCar 
  });
});

// -------------------------------
// Delete car (Admin only)
// -------------------------------
export const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  
  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }

  await car.deleteOne();
  
  res.status(200).json({ 
    success: true,
    message: 'Car removed successfully' 
  });
});