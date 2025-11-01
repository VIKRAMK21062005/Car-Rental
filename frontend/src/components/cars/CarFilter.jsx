import { useState } from 'react';

const CarFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    type: '',
    model: '',
    minPrice: '',
    maxPrice: '',
  });

  // Handle any input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit filters to parent
  const handleSubmit = (e) => {
    e.preventDefault();

    if (filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice)) {
      alert('Min price cannot be greater than max price!');
      return;
    }

    // Remove empty values before sending to backend
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );

    onFilter(cleanedFilters); // send to parent
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({ type: '', model: '', minPrice: '', maxPrice: '' });
    onFilter({}); // send empty object to reset backend filter
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg mb-6 border dark:border-gray-700 transition-all duration-300"
    >
      <h3 className="text-xl font-semibold mb-5 dark:text-white text-gray-800">🚗 Filter Cars</h3>

      <div className="grid md:grid-cols-5 gap-5">

        {/* Car Type */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Car Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="sports">Sports</option>
            <option value="luxury">Luxury</option>
            <option value="electric">Electric</option>
            <option value="hatchback">Hatchback</option>
          </select>
        </div>

        {/* Car Model */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Car Model</label>
          <input
            type="text"
            name="model"
            value={filters.model}
            onChange={handleChange}
            placeholder="e.g. Tesla Model 3"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Min Price (₹)</label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700">Max Price (₹)</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="10000"
            min="0"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-end space-x-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
};

export default CarFilter;
