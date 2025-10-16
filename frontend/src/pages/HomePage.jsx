// frontend/src/pages/HomePage.jsx - ENHANCED VERSION
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import api from '../services/api';

const HomePage = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      const response = await api.get('/coupons/active');
      setCoupons(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animation */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl font-extrabold mb-6 animate-fade-in-up">
            Find Your Perfect Ride
          </h1>
          <p className="text-2xl mb-10 animate-fade-in-up animation-delay-300">
            Premium car rental service with the best vehicles and prices
          </p>
          <div className="flex justify-center space-x-4 animate-fade-in-up animation-delay-600">
            <Link to="/cars">
              <button className="group relative bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl">
                <span className="relative z-10">Browse Cars</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            </Link>
            {!user && (
              <Link to="/auth">
                <button className="bg-transparent border-3 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105 shadow-lg">
                  Get Started
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Active Coupons Section */}
      {!loading && coupons.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in">
                🎉 Limited Time Offers
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Grab these exclusive deals before they expire!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.slice(0, 6).map((coupon, index) => (
                <div
                  key={coupon._id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 relative">
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% OFF` 
                        : `₹${coupon.discountValue} OFF`}
                    </div>
                    <h3 className="text-2xl font-bold text-white mt-4">{coupon.code}</h3>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-4 min-h-[3rem]">
                      {coupon.description}
                    </p>
                    
                    <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      {coupon.minRentalAmount > 0 && (
                        <p>• Min. booking: ₹{coupon.minRentalAmount}</p>
                      )}
                      {coupon.maxDiscount && (
                        <p>• Max discount: ₹{coupon.maxDiscount}</p>
                      )}
                      <p className="text-red-600 dark:text-red-400 font-semibold">
                        • Valid until: {new Date(coupon.validUntil).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Code</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section with Animation */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white animate-fade-in">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: '💰',
                title: 'Best Prices',
                description: 'Competitive rates with transparent pricing',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '🚗',
                title: 'Wide Selection',
                description: 'Choose from economy to luxury vehicles',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '⚡',
                title: '24/7 Support',
                description: 'Our AI chatbot is always here to help',
                color: 'from-orange-500 to-red-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-3 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`bg-gradient-to-br ${feature.color} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 text-4xl transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3 dark:text-white group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in">Ready to Hit the Road?</h2>
          <p className="text-2xl mb-10 animate-fade-in animation-delay-300">
            Book your car in just a few clicks
          </p>
          <Link to="/cars">
            <button className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-110 shadow-2xl animate-fade-in animation-delay-600">
              Start Booking Now →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;