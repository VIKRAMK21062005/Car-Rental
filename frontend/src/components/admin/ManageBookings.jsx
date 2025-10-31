import { useState, useEffect, useCallback } from 'react';
import { getAllBookings, updateBookingStatus } from '../../services/adminService';
import Loader from '../common/Loader';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBookings(filter !== 'all' ? { status: filter } : {});
      setBookings(data);
    } catch {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      fetchBookings();
    } catch {
      alert('Failed to update booking');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Manage Bookings</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Booking ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Car</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Dates</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {bookings.map(booking => (
              <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-sm dark:text-gray-300">{booking._id.slice(-8)}</td>
                <td className="px-4 py-3 text-sm dark:text-gray-300">{booking.user?.name}</td>
                <td className="px-4 py-3 text-sm dark:text-gray-300">{booking.car?.name}</td>
                <td className="px-4 py-3 text-sm dark:text-gray-300">
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600">${booking.totalPrice}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                    className="text-sm px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No bookings found</div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
