import { useState } from 'react';
import { createCar, updateCar } from '../../services/carService';
import InputField from '../auth/InputField';

const CarUploadForm = ({ car, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: car?.name || '',
    brand: car?.brand || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    type: car?.type || 'sedan',
    seats: car?.seats || 5,
    pricePerDay: car?.pricePerDay || 0,
    fuelType: car?.fuelType || 'petrol',
    transmission: car?.transmission || 'automatic',
    features: car?.features?.join(', ') || '',
    image: car?.image || '',
    available: car?.available ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };

      if (car) {
        await updateCar(car._id, data);
      } else {
        await createCar(data);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <div className="grid md:grid-cols-2 gap-4">
        <InputField label="Car Name" name="name" value={formData.name} onChange={handleChange} required />
        <InputField label="Brand" name="brand" value={formData.brand} onChange={handleChange} required />
        <InputField label="Model" name="model" value={formData.model} onChange={handleChange} required />
        <InputField label="Year" name="year" type="number" value={formData.year} onChange={handleChange} required />
        
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type</label>
          <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="sports">Sports</option>
            <option value="luxury">Luxury</option>
            <option value="van">Van</option>
          </select>
        </div>

        <InputField label="Seats" name="seats" type="number" value={formData.seats} onChange={handleChange} required />
        <InputField label="Price Per Day" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleChange} required />
        
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fuel Type</label>
          <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Transmission</label>
          <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      <InputField 
        label="Features (comma-separated)" 
        name="features" 
        value={formData.features} 
        onChange={handleChange}
        placeholder="AC, GPS, Bluetooth, etc."
      />
      
      <InputField label="Image URL" name="image" value={formData.image} onChange={handleChange} />

      <div className="flex items-center">
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm dark:text-gray-300">Available for rent</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Saving...' : car ? 'Update Car' : 'Add Car'}
      </button>
    </form>
  );
};

export default CarUploadForm;