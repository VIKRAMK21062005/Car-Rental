import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
                <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;