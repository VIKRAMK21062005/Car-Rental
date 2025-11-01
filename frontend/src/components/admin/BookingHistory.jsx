// frontend/src/components/admin/BookingHistory.jsx - ENHANCED VERSION
import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';
import { useAuth } from '../../hooks/useAuth';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', reason: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/bookings/all');
      setBookings(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

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
      ongoing: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
      cancelled: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
    };
    return colors[key] || 'bg-gray-100 text-gray-600';
  };

  const calculateStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => (b.status || '').toLowerCase() === 'pending').length;
    const confirmed = bookings.filter(b => (b.status || '').toLowerCase() === 'confirmed').length;
    const ongoing = bookings.filter(b => (b.status || '').toLowerCase() === 'ongoing').length;
    const completed = bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length;
    const cancelled = bookings.filter(b => (b.status || '').toLowerCase() === 'cancelled').length;
    
    const totalRevenue = bookings
      .filter(b => {
        const s = (b.status || '').toLowerCase();
        return s === 'confirmed' || s === 'completed' || s === 'ongoing';
      })
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    const totalDiscount = bookings
      .filter(b => b.discountAmount && b.discountAmount > 0)
      .reduce((sum, b) => sum + (Number(b.discountAmount) || 0), 0);

    return { total, pending, confirmed, ongoing, completed, cancelled, totalRevenue, totalDiscount };
  };

  const stats = calculateStats();

  // ✅ FIX: Update booking status
  const handleStatusUpdate = async () => {
    if (!selectedBooking || !statusUpdate.status) {
      alert('Please select a status');
      return;
    }

    try {
      await api.put(`/bookings/${selectedBooking._id}/status`, {
        status: statusUpdate.status,
        reason: statusUpdate.reason || `Status changed by admin`
      });
      
      alert('✅ Booking status updated successfully!');
      setShowModal(false);
      setStatusUpdate({ status: '', reason: '' });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // ✅ FIX: View booking details modal
  const ViewDetailsModal = ({ booking, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Booking Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Name:</p>
                <p className="font-semibold dark:text-white">{booking.user?.name}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Email:</p>
                <p className="font-semibold dark:text-white">{booking.user?.email}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Phone:</p>
                <p className="font-semibold dark:text-white">{booking.user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Car Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Car Details
            </h3>
            <div className="flex items-center">
              {booking.car?.image && (
                <img src={booking.car.image} alt={booking.car.name} className="w-24 h-24 object-cover rounded-lg mr-4" />
              )}
              <div>
                <p className="font-bold text-lg dark:text-white">{booking.car?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{booking.car?.brand} {booking.car?.model}</p>
              </div>
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Booking Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">From:</span>
                <span className="font-semibold dark:text-white">{new Date(booking.bookedTimeSlots.from).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">To:</span>
                <span className="font-semibold dark:text-white">{new Date(booking.bookedTimeSlots.to).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-semibold dark:text-white">{booking.totalHours} hours</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Original Amount:</span>
                <span className="font-semibold dark:text-white">₹{booking.originalAmount || booking.totalAmount}</span>
              </div>
              {booking.discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount {booking.couponCode && `(${booking.couponCode})`}:</span>
                    <span className="font-semibold">-₹{booking.discountAmount}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold dark:text-white">Final Amount:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">₹{booking.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                <span className={`font-semibold ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                  {booking.paymentStatus.toUpperCase()}
                </span>
              </div>
              {booking.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                  <span className="font-mono text-xs dark:text-white">{booking.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Status History
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {booking.statusHistory.map((history, idx) => (
                  <div key={idx} className="text-xs bg-white dark:bg-gray-800 p-2 rounded">
                    <div className="flex justify-between">
                      <span className={`font-semibold ${getStatusColor(history.status)}`}>{history.status.toUpperCase()}</span>
                      <span className="text-gray-500">{new Date(history.changedAt).toLocaleString()}</span>
                    </div>
                    {history.reason && <p className="text-gray-600 dark:text-gray-400 mt-1">{history.reason}</p>}
                    {history.changedBy && (
                      <p className="text-gray-500 dark:text-gray-500 text-xs">By: {history.changedBy.name}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Status:</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                {booking.status.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedBooking(booking);
                setStatusUpdate({ status: booking.status, reason: '' });
                onClose();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <Loader />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      {/* Statistics */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Bookings</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-300">{stats.pending}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Confirmed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-300">{stats.confirmed}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Ongoing</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{stats.ongoing}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">{stats.completed}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Cancelled</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-300">{stats.cancelled}</p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Total Revenue</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-300">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-6 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Total Discounts Given</p>
          <p className="text-4xl font-bold text-orange-600 dark:text-orange-300">
            ₹{stats.totalDiscount.toLocaleString()}
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
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Booking List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="text-gray-500 text-center py-12">No bookings found.</div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking._id} className="p-4 border rounded-lg flex justify-between items-center bg-white dark:bg-gray-800 hover:shadow-lg transition">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {booking.car?.image && (
                    <img src={booking.car.image} alt={booking.car?.name} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div>
                    <p className="font-semibold dark:text-white">{booking.car?.name || 'Unknown car'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.user?.name} • {booking.user?.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ₹{Number(booking.totalAmount || 0).toFixed(2)}
                      {booking.discountAmount > 0 && (
                        <span className="text-green-600 ml-2">(-₹{booking.discountAmount})</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>

                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                  }}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Details Modal */}
      {selectedBooking && !showModal && (
        <ViewDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}

      {/* Update Status Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Update Booking Status</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">New Status</label>
              <select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Reason (Optional)</label>
              <textarea
                value={statusUpdate.reason}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, reason: e.target.value })}
                rows={3}
                placeholder="Enter reason for status change..."
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setStatusUpdate({ status: '', reason: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;