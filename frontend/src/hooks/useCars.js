import { useState, useEffect } from 'react';
import { getCars } from '../services/carService';

export const useCars = (filters = {}) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const data = await getCars(filters);
        setCars(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [JSON.stringify(filters)]);

  return { cars, loading, error, refetch: () => fetchCars() };
};
