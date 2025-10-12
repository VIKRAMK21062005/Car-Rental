import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <img
        src={car.image || 'https://via.placeholder.com/400x250?text=Car'}
        alt={car.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{car.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">{car.brand} - {car.model}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">{car.type}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{car.seats} Seats</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">${car.pricePerDay}/day</span>
          <Link to={`/cars/${car._id}`}>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Book Now
            </button>
          </Link>
        </div>
        {car.available ? (
          <span className="inline-block mt-2 text-sm text-green-600">Available</span>
        ) : (
          <span className="inline-block mt-2 text-sm text-red-600">Not Available</span>
        )}
      </div>
    </div>
  );
};

export default CarCard;
