// frontend/src/pages/CarDetailsPage.jsx - ENHANCED VERSION
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById } from '../services/carService';
import Loader from '../components/common/Loader';
import api from '../services/api';

// Import Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import EnhancedBookingForm from '../components/bookings/EnhancedBookingForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51QYzRkSFCbP0WVsZQfn9fgOL9RJnLnxzxJ4TXPL0KhBhMIKmkEqJVo5SL5mNKSm5eCxKE0qJIYIyXM6lrAQO2Aub00NtOVbRnK');

const CarDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchCar();
    fetchRatings();
  }, [id]);

  const fetchCar = async () => {
    setLoading(true);
    try {
      const data = await getCarById(id);
      setCar(data);
    } catch (err) {
      console.error('Failed to load car details');
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await api.get(`/bookings/ratings/${id}`);
      if (response.data.success) {
        setRatings(response.data.ratings);
        setAverageRating(response.data.averageRating);
        setTotalRatings(response.data.totalRatings);
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    navigate('/bookings');
  };

  if (loading) return <Loader />;
  if (!car) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Car Image */}
        <div>
          <img
            src={car.image || 'https://via.placeholder.com/600x400?text=Car'}
            alt={car.name}
            className="w-full h-96 object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Car Details */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold dark:text-white">{car.name}</h1>
            {averageRating > 0 && (
              <div className="flex items-center bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-lg">
                <svg className="w-5 h-5 text-yellow-400 fill-current mr-1" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-bold text-yellow-700 dark:text-yellow-300">{averageRating}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">({totalRatings})</span>
              </div>
            )}
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {car.brand} - {car.model} ({car.year})
          </p>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl mb-6 text-white">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold">₹{car.pricePerDay}</span>
              <span className="text-xl ml-2">/day</span>
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
                  <p className="font-semibold">{car.seats}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fuel</p>
                  <p className="font-semibold capitalize">{car.fuelType}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transmission</p>
                  <p className="font-semibold capitalize">{car.transmission}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                  <p className="font-semibold capitalize">{car.type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          {car.features && car.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Features</h3>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center mb-6">
            {car.available ? (
              <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                Available Now
              </span>
            ) : (
              <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">
                Not Available
              </span>
            )}
          </div>

          {/* Book Button */}
          {car.available && (
            <button
              onClick={() => setShowBookingForm(!showBookingForm)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              {showBookingForm ? '✕ Close Booking Form' : '🚗 Book This Car Now'}
            </button>
          )}
        </div>
      </div>

      {/* Booking Form */}
      {showBookingForm && car.available && (
        <div className="mb-8">
          <Elements stripe={stripePromise}>
            <EnhancedBookingForm car={car} onSuccess={handleBookingSuccess} onCancel={() => setShowBookingForm(false)} />
          </Elements>
        </div>
      )}

      {/* Customer Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Customer Reviews</h2>
        
        {totalRatings > 0 ? (
          <>
            <div className="flex items-center mb-8 pb-6 border-b dark:border-gray-700">
              <div className="text-center mr-8">
                <div className="text-6xl font-bold text-blue-600">{averageRating}</div>
                <div className="flex items-center justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto">
              {ratings.map((rating) => (
                <div key={rating._id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                        {rating.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold dark:text-white">{rating.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
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
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {rating.review}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No reviews yet</p>
            <p className="text-sm text-gray-400">Be the first to review this car after your rental!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetailsPage;