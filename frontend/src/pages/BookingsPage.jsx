import { useState, useEffect } from 'react';
import { getMyBookings } from '../services/bookingService';
import BookingCard from '../components/bookings/BookingCard';
import Loader from '../components/common/Loader';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">My Bookings</h1>
      {bookings.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} onUpdate={fetchBookings} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No bookings found</p>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;