import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById } from '../services/carService';
import BookingForm from '../components/bookings/BookingForm';
import Loader from '../components/common/Loader';

const CarDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchCar();
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

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    navigate('/bookings');
  };

  if (loading) return <Loader />;
  if (!car) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={car.image || 'https://via.placeholder.com/600x400?text=Car'}
            alt={car.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4 dark:text-white">{car.name}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {car.brand} - {car.model} ({car.year})
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-300">
              ${car.pricePerDay}
            </span>
            <span className="text-gray-600 dark:text-gray-400">/day</span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{car.seats} Seats</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="capitalize">{car.fuelType}</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="capitalize">{car.transmission}</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="capitalize">{car.type}</span>
            </div>
          </div>

          {car.features && car.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Features</h3>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center mb-6">
            {car.available ? (
              <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold">
                Available Now
              </span>
            ) : (
              <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">
                Not Available
              </span>
            )}
          </div>

          {car.available && (
            <button
              onClick={() => setShowBookingForm(!showBookingForm)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              {showBookingForm ? 'Hide Booking Form' : 'Book This Car'}
            </button>
          )}
        </div>
      </div>

      {showBookingForm && car.available && (
        <div className="mt-8 max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <BookingForm car={car} onSuccess={handleBookingSuccess} />
        </div>
      )}
    </div>
  );
};

export default CarDetailsPage;