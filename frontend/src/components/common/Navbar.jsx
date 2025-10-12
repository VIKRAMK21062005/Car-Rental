import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Debug: Log user state changes
  useEffect(() => {
    console.log('Navbar - User state:', user);
    console.log('Navbar - Loading:', loading);
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Don't render auth buttons while loading
  if (loading) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">CarRental</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">CarRental</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2">
              Home
            </Link>
            <Link to="/cars" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2">
              Cars
            </Link>
            {user && (
              <Link to="/bookings" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2">
                My Bookings
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2">
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Login
                </button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Home</Link>
            <Link to="/cars" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Cars</Link>
            {user && (
              <>
                <Link to="/bookings" className="block px-3 py-2 text-gray-700 dark:text-gray-300">My Bookings</Link>
                <Link to="/profile" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Profile</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Admin</Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-red-600"
              >
                Logout
              </button>
            ) : (
              <Link to="/auth" className="block px-3 py-2 text-blue-600">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;