// frontend/src/components/bookings/BookingCard.jsx - UPDATED
import { useState } from 'react';
import { cancelBooking, downloadInvoice } from '../../services/bookingService';
import RatingModal from './RatingModal';

const BookingCard = ({ booking, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);

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
    } catch {
      alert('Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = () => {
    setShowRating(false);
    alert('Thank you for your rating!');
    onUpdate();
  };

  const getStatusColor = () => {
    switch (booking.status) {
      case 'confirmed': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300';
      case 'completed': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {booking.car?.image && (
                <img 
                  src={booking.car.image} 
                  alt={booking.car.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-bold dark:text-white">{booking.car?.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{booking.car?.brand} - {booking.car?.model}</p>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
            {booking.status.toUpperCase()}
          </span>
        </div>

        <div className="space-y-2 mb-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">📅 From:</span>
            <span className="font-semibold dark:text-white">
              {new Date(booking.bookedTimeSlots.from).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">📅 To:</span>
            <span className="font-semibold dark:text-white">
              {new Date(booking.bookedTimeSlots.to).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">⏱️ Duration:</span>
            <span className="font-semibold dark:text-white">{booking.totalHours}h</span>
          </div>
          <div className="flex justify-between border-t dark:border-gray-600 pt-2 mt-2">
            <span className="text-gray-600 dark:text-gray-400 font-semibold">💰 Total:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">₹{booking.totalAmount}</span>
          </div>
          {booking.transactionId && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-500">Transaction ID:</span>
              <span className="text-gray-500 dark:text-gray-500 font-mono">{booking.transactionId.slice(0, 20)}...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all text-sm font-semibold flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Invoice
          </button>
          
          {booking.status === 'confirmed' && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-all text-sm font-semibold"
            >
              ❌ Cancel
            </button>
          )}
          
          {booking.status === 'completed' && !booking.hasRated && (
            <button
              onClick={() => setShowRating(true)}
              disabled={loading}
              className="col-span-2 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 transition-all text-sm font-semibold flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Rate This Car
            </button>
          )}
          
          {booking.status === 'completed' && booking.hasRated && (
            <div className="col-span-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 py-2 rounded-lg text-center text-sm font-semibold">
              ✅ You rated this booking
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
          Booked on {new Date(booking.createdAt).toLocaleDateString()}
        </div>
      </div>

      {showRating && (
        <RatingModal 
          booking={booking} 
          onClose={() => setShowRating(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </>
  );
};

export default BookingCard;