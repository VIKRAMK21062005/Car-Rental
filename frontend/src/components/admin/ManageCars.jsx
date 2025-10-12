import { useState, useEffect } from 'react';
import { getCars, deleteCar } from '../../services/carService';
import CarUploadForm from '../cars/CarUploadForm';
import Loader from '../common/Loader';

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCar, setEditCar] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const data = await getCars();
      setCars(data);
    } catch (err) {
      console.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    try {
      await deleteCar(id);
      fetchCars();
    } catch (err) {
      alert('Failed to delete car');
    }
  };

  const handleEdit = (car) => {
    setEditCar(car);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditCar(null);
    fetchCars();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Manage Cars</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add New Car
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold dark:text-white">
                {editCar ? 'Edit Car' : 'Add New Car'}
              </h3>
              <button onClick={handleFormClose} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CarUploadForm car={editCar} onSuccess={handleFormClose} />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map(car => (
          <div key={car._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <img
              src={car.image || 'https://via.placeholder.com/400x250?text=Car'}
              alt={car.name}
              className="w-full h-40 object-cover rounded mb-3"
            />
            <h3 className="font-bold text-lg dark:text-white">{car.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{car.brand} - {car.model}</p>
            <p className="text-blue-600 font-bold">${car.pricePerDay}/day</p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => handleEdit(car)}
                className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(car._id)}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCars;