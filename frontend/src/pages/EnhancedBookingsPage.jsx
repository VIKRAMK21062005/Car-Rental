// frontend/src/pages/EnhancedBookingsPage.jsx
import { useState, useEffect } from 'react';
import { getMyBookings } from '../services/bookingService';
import { getUserRatings } from '../services/ratingService';
import BookingCard from '../components/bookings/BookingCard';
import Loader from '../components/common/Loader';

const EnhancedBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('bookings');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data);
      
      // Fetch user ratings
      const ratingsData = await getUserRatings();
      setUserRatings(ratingsData.data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalSpent: bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalAmount, 0)
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold dark:text-white mb-2">My Bookings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your car rental history and leave reviews
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
              <p className="text-4xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Confirmed</p>
              <p className="text-4xl font-bold mt-1">{stats.confirmed}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Completed</p>
              <p className="text-4xl font-bold mt-1">{stats.completed}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Cancelled</p>
              <p className="text-4xl font-bold mt-1">{stats.cancelled}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Total Spent</p>
              <p className="text-3xl font-bold mt-1">₹{stats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📋 All Bookings
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'ratings'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            ⭐ My Reviews ({userRatings.length})
          </button>
        </div>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {['all', 'confirmed', 'completed', 'pending', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                    {bookings.filter(b => b.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bookings Grid */}
          {filteredBookings.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredBookings.map(booking => (
                <BookingCard 
                  key={booking._id} 
                  booking={booking} 
                  onUpdate={fetchBookings} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No {filter !== 'all' ? filter : ''} bookings found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {filter === 'all' 
                  ? "You haven't made any bookings yet" 
                  : `You don't have any ${filter} bookings`}
              </p>
            </div>
          )}
        </>
      )}

      {/* Ratings Tab */}
      {activeTab === 'ratings' && (
        <div className="space-y-6">
          {userRatings.length > 0 ? (
            userRatings.map(rating => (
              <div key={rating._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-start space-x-4">
                  <img
                    src={rating.car?.image || 'https://via.placeholder.com/100'}
                    alt={rating.car?.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold dark:text-white">{rating.car?.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rating.car?.brand} {rating.car?.model}
                        </p>
                      </div>
                      <div className="flex items-center bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-lg">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= rating.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {rating.review && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                        "{rating.review}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Reviewed on {new Date(rating.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Complete bookings to leave reviews and help others!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedBookingsPage;