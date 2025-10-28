// frontend/src/components/auth/RegisterForm.jsx - COMPLETE FIXED VERSION
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import InputField from './InputField';
import ErrorMessage from '../common/ErrorMessage';

const RegisterForm = ({ onSwitch }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user', // Default to user
    adminSecret: '' // Only shown when admin role selected
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (formData.role === 'admin' && !formData.adminSecret) {
        setError('Admin secret key is required for admin registration');
        setLoading(false);
        return;
      }

      await register(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({ 
      ...formData, 
      role,
      adminSecret: role === 'user' ? '' : formData.adminSecret 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center dark:text-white">Register</h2>
      
      {error && <ErrorMessage message={error} />}
      
      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Register As <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.role}
          onChange={handleRoleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="user">👤 User (Customer)</option>
          <option value="admin">👑 Admin (Administrator)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.role === 'user' 
            ? 'Register as a customer to book cars' 
            : 'Register as an admin to manage the system'}
        </p>
      </div>

      {/* Admin Secret Key - Only shown for admin role */}
      {formData.role === 'admin' && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold mb-2">
                Admin Registration Requires Secret Key
              </p>
              <InputField
                label="Admin Secret Key"
                type="password"
                value={formData.adminSecret}
                onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                required={formData.role === 'admin'}
                placeholder="Enter admin secret key"
              />
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Contact your system administrator to get the admin secret key
              </p>
            </div>
          </div>
        </div>
      )}

      <InputField
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="John Doe"
      />
      
      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        placeholder="john@example.com"
      />
      
      <InputField
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        placeholder="Min 6 characters"
        minLength={6}
      />
      
      <InputField
        label="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
        placeholder="1234567890"
      />
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
      
      <p className="text-center dark:text-gray-300">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-blue-600 hover:underline">
          Login
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;