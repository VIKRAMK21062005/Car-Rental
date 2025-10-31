import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCars } from '../services/carService';

export const useCars = (filters = {}) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stringifiedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCars(JSON.parse(stringifiedFilters));
      setCars(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [stringifiedFilters]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return { cars, loading, error, refetch: fetchCars };
};
