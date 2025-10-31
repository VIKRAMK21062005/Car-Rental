// frontend/src/components/admin/CouponManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minRentalAmount: 0,
    maxDiscount: null,
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: '',
    usageLimit: null,
    userLimit: 1,
    applicableVehicleTypes: ['all'],
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get('/coupons');
      setCoupons(response.data.data || []);
    } catch {
      console.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCoupon) {
        await api.put(`/coupons/${editCoupon._id}`, formData);
        alert('Coupon updated successfully!');
      } else {
        await api.post('/coupons', formData);
        alert('Coupon created successfully!');
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minRentalAmount: coupon.minRentalAmount,
      maxDiscount: coupon.maxDiscount,
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      usageLimit: coupon.usageLimit,
      userLimit: coupon.userLimit,
      applicableVehicleTypes: coupon.applicableVehicleTypes,
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      alert('Coupon deleted successfully!');
      fetchCoupons();
    } catch {
      alert('Failed to delete coupon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minRentalAmount: 0,
      maxDiscount: null,
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: '',
      usageLimit: null,
      userLimit: 1,
      applicableVehicleTypes: ['all'],
      isActive: true
    });
    setEditCoupon(null);
    setShowForm(false);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Coupon Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? '✕ Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {/* Coupon Form */}
      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-4 dark:text-white">
            {editCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Coupon Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="SUMMER2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Discount Type *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Discount Value *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                required
                min="0"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Min Rental Amount (₹)
              </label>
              <input
                type="number"
                value={formData.minRentalAmount}
                onChange={(e) => setFormData({...formData, minRentalAmount: Number(e.target.value)})}
                min="0"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Valid From *
              </label>
              <input
                type="datetime-local"
                value={formData.validFrom}
                onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Valid Until *
              </label>
              <input
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={3}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Get 20% off on all car rentals..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm dark:text-gray-300">Active</label>
            </div>

            <div className="md:col-span-2 flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(coupon => (
          <div key={coupon._id} className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold dark:text-white">{coupon.code}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {coupon.discountType === 'percentage' 
                  ? `${coupon.discountValue}%` 
                  : `₹${coupon.discountValue}`}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {coupon.description}
            </p>

            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <p>• Used: {coupon.usageCount} times</p>
              <p>• Expires: {new Date(coupon.validUntil).toLocaleDateString()}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(coupon)}
                className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(coupon._id)}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No coupons found. Create one to get started!
        </div>
      )}
    </div>
  );
};

export default CouponManagement;