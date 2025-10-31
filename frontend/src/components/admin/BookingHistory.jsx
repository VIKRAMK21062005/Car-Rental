// frontend/src/components/admin/BookingHistory.jsx
import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';
import {useAuth} from '../../hooks/useAuth'; // assumed auth hook for role/token

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const { user } = useAuth(); // { user: { role: 'admin'|'user', name, email } }

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/bookings/all'); // ensure backend checks auth
      setBookings(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // normalize once
  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || (booking.status || '').toLowerCase() === filter;
    const userName = (booking.user && booking.user.name) ? booking.user.name.toLowerCase() : '';
    const userEmail = (booking.user && booking.user.email) ? booking.user.email.toLowerCase() : '';
    const carName = (booking.car && booking.car.name) ? booking.car.name.toLowerCase() : '';

    const matchesSearch =
      normalizedSearch === '' ||
      userName.includes(normalizedSearch) ||
      userEmail.includes(normalizedSearch) ||
      carName.includes(normalizedSearch);

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const key = (status || '').toLowerCase();
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
      confirmed: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      cancelled: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
    };
    return colors[key] || 'bg-gray-100 text-gray-600';
  };

  const calculateStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => (b.status || '').toLowerCase() === 'confirmed').length;
    const completed = bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length;
    const cancelled = bookings.filter(b => (b.status || '').toLowerCase() === 'cancelled').length;
    const totalRevenue = bookings
      .filter(b => {
        const s = (b.status || '').toLowerCase();
        return s === 'confirmed' || s === 'completed';
      })
      .reduce((sum, b) => {
        const amt = Number(b.totalAmount) || 0;
        return sum + amt;
      }, 0);

    return { total, confirmed, completed, cancelled, totalRevenue };
  };

  const stats = calculateStats();

  if (loading) return <Loader />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      {/* Statistics */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Bookings</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{stats.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Confirmed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-300">{stats.confirmed}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">{stats.completed}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Cancelled</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-300">{stats.cancelled}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Revenue</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
            ₹{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by user, email, or car..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Booking List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="text-gray-500">No bookings found.</div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking._id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{booking.car?.name || 'Unknown car'}</p>
                <p className="text-sm text-gray-500">{booking.user?.name} • {booking.user?.email}</p>
                <p className="text-sm text-gray-600">Amount: ₹{Number(booking.totalAmount || 0).toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>

                {/* Admin-only actions */}
                {user?.role === 'admin' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {/* open edit booking modal */}}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this booking?')) return;
                        try {
                          await api.delete(`/bookings/${booking._id}`);
                          setBookings(prev => prev.filter(b => b._id !== booking._id));
                        } catch {
                          alert('Failed to delete booking');
                        }
                      }}
                      className="px-2 py-1 border rounded text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
