// frontend/src/components/bookings/BookingCard.jsx
import { useState } from 'react';
import { cancelBooking, downloadInvoice } from '../../services/bookingService';

const BookingCard = ({ booking, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setLoading(true);
    try {
      await cancelBooking(booking._id);
      alert('Booking cancelled successfully!');
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadInvoice(booking._id);
      alert('Invoice downloaded successfully!');
    } catch (err) {
      alert('Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold dark:text-white">{booking.car?.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{booking.car?.brand} - {booking.car?.model}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
          booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          {booking.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">From:</span>
          <span className="font-semibold dark:text-white">
            {new Date(booking.bookedTimeSlots.from).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">To:</span>
          <span className="font-semibold dark:text-white">
            {new Date(booking.bookedTimeSlots.to).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Total Hours:</span>
          <span className="font-semibold dark:text-white">{booking.totalHours}h</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">₹{booking.totalAmount}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all transform hover:scale-105"
        >
          📄 Download Invoice
        </button>
        {booking.status === 'confirmed' && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-all transform hover:scale-105"
          >
            ❌ Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;