import { useState } from 'react';
import { createBooking } from '../../services/bookingService';
import CouponInput from './CouponInput';
import ErrorMessage from '../common/ErrorMessage';

const BookingForm = ({ car, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    couponCode: ''
  });
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotal = () => {
    const days = calculateDays();
    const subtotal = days * car.pricePerDay;
    return subtotal - (subtotal * discount / 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const bookingData = {
        carId: car._id,
        ...formData,
        totalPrice: calculateTotal()
      };
      const result = await createBooking(bookingData);
      onSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold dark:text-white">Book {car.name}</h3>
      {error && <ErrorMessage message={error} />}
      
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Date</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          required
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Date</label>
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          min={formData.startDate || new Date().toISOString().split('T')[0]}
          required
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <CouponInput onApply={(code, disc) => {
        setFormData({ ...formData, couponCode: code });
        setDiscount(disc);
      }} />

      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="dark:text-gray-300">Days:</span>
          <span className="font-semibold dark:text-white">{calculateDays()}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="dark:text-gray-300">Price per day:</span>
          <span className="font-semibold dark:text-white">${car.pricePerDay}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between mb-2 text-green-600">
            <span>Discount:</span>
            <span className="font-semibold">{discount}%</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold border-t pt-2 dark:text-white">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || calculateDays() === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </form>
  );
};

export default BookingForm;
