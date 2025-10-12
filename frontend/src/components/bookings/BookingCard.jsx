import { useState } from 'react';
import { cancelBooking, downloadInvoice } from '../../services/bookingService';

const BookingCard = ({ booking, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setLoading(true);
    try {
      await cancelBooking(booking._id);
      onUpdate();
    } catch (err) {
      alert('Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadInvoice(booking._id);
    } catch (err) {
      alert('Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold dark:text-white">{booking.car?.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{booking.car?.brand} - {booking.car?.model}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
          <span className="font-semibold dark:text-white">{booking._id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
          <span className="font-semibold dark:text-white">{new Date(booking.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">End Date:</span>
          <span className="font-semibold dark:text-white">{new Date(booking.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Total Price:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">${booking.totalPrice}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        {booking.status === 'confirmed' && (
          <>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Download Invoice
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              Cancel Booking
            </button>
          </>
        )}
        {booking.status === 'completed' && (
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Download Invoice
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
