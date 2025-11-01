// frontend/src/pages/AuthPage.jsx - ENHANCED WITH ANIMATIONS
import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Car images for animation (you can replace with your own images)
  const carImages = [
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop'
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Left Side - Animated Car Images */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 items-center justify-center">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Car Images Grid with Animations */}
        <div className="relative z-10 grid grid-cols-2 gap-6">
          {carImages.map((img, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <img
                src={img}
                alt={`Car ${index + 1}`}
                className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-bold text-xl mb-1">Premium Car {index + 1}</h3>
                  <p className="text-sm opacity-90">Available for rent</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Statistics */}
        <div className="absolute top-10 right-10 animate-bounce">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">500+</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Cars Available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 animate-bounce animation-delay-1000">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">4.9/5</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Customer Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Text Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl mb-4 animate-fade-in">
            Car Rental
          </h1>
          <p className="text-2xl text-white/90 drop-shadow-lg animate-fade-in animation-delay-300">
            Your Journey Starts Here
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Logo and Title */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-4 animate-bounce">
              <span className="text-5xl">🚗</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome to CarRental
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? 'Login to access your account' : 'Create your account today'}
            </p>
          </div>

          {/* Auth Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-lg border border-gray-200 dark:border-gray-700 animate-fade-in-up">
            {isLogin ? (
              <LoginForm onSwitch={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitch={() => setIsLogin(true)} />
            )}
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in-up animation-delay-600">
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl transition-transform hover:scale-105">
              <div className="text-2xl mb-1">💰</div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Best Prices</p>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl transition-transform hover:scale-105">
              <div className="text-2xl mb-1">🚀</div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Fast Booking</p>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl transition-transform hover:scale-105">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Secure Pay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;