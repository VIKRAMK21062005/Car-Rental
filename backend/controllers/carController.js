// controllers/carController.js
import asyncHandler from 'express-async-handler';
import Car from '../models/Car.js';

// -------------------------------
// Create a new car (Admin only)
// -------------------------------
export const createCar = asyncHandler(async (req, res) => {
  const { name, brand, model, year, pricePerDay, image, available } = req.body;

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
  const cars = await Car.find().sort({ createdAt: -1 });
  res.status(200).json(cars);
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
  res.status(200).json(car);
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

  const { name, brand, model, year, pricePerDay, available, image } = req.body;

  car.name = name || car.name;
  car.brand = brand || car.brand;
  car.model = model || car.model;
  car.year = year || car.year;
  car.pricePerDay = pricePerDay || car.pricePerDay;
  car.image = image || car.image;
  if (available !== undefined) car.available = available;

  const updatedCar = await car.save();
  res.status(200).json({ message: 'Car updated successfully', car: updatedCar });
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
  res.status(200).json({ message: 'Car removed successfully' });
});
