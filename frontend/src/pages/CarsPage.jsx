import { useState, useEffect } from 'react';
import { getCars, searchCars } from '../services/carService';
import CarCard from '../components/cars/CarCard';
import CarFilter from '../components/cars/CarFilter';
import SearchBar from '../components/cars/SearchBar';
import Loader from '../components/common/Loader';

const CarsPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getCars(filters);
      setCars(data);
    } catch (err) {
      setError('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      fetchCars();
      return;
    }
    setLoading(true);
    try {
      const data = await searchCars(query);
      setCars(data);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Browse Our Cars</h1>
      <SearchBar onSearch={handleSearch} />
      <CarFilter onFilter={fetchCars} />
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.length > 0 ? (
          cars.map(car => <CarCard key={car._id} car={car} />)
        ) : (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">No cars found</p>
        )}
      </div>
    </div>
  );
};

export default CarsPage;
