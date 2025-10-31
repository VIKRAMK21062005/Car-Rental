// frontend/src/components/auth/LoginForm.jsx - FIXED VERSION
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import InputField from './InputField';
import ErrorMessage from '../common/ErrorMessage';

const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Login form submitting...');
      
      // Perform login
      const response = await login(formData.email, formData.password);
      
      console.log('✅ Login successful, user role:', response.role);
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate based on role - NO PAGE RELOAD
      if (response.role === 'admin') {
        console.log('👑 Navigating to admin dashboard');
        navigate('/admin', { replace: true });
      } else {
        console.log('👤 Navigating to home page');
        navigate('/', { replace: true });
      }
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center dark:text-white">Login</h2>
      
      {error && <ErrorMessage message={error} />}
      
      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        autoComplete="email"
        placeholder="Enter your email"
      />
      
      <InputField
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        autoComplete="current-password"
        placeholder="Enter your password"
      />
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Logging in...
          </span>
        ) : (
          'Login'
        )}
      </button>
      
      <p className="text-center dark:text-gray-300">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-blue-600 hover:underline font-semibold">
          Register
        </button>
      </p>
    </form>
  );
};

export default LoginForm;