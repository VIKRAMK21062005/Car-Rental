// frontend/src/components/admin/BookingHistory.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/all');
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = 
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.car?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
      confirmed: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      cancelled: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const calculateStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return { total, confirmed, completed, cancelled, totalRevenue };
  };

  const stats = calculateStats();

  if (loading) return <Loader />;

  return (
    <div>
      {/* Statistics Cards */}
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
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">₹{stats.totalRevenue}</p>
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
          <option value="completed">