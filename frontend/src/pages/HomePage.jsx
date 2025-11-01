import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ImprovedHomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [coupons, setCoupons] = useState([]);

  const heroImages = [
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1920',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920'
  ];

  const quotes = [
    "Drive Your Dreams Into Reality",
    "Premium Cars. Affordable Prices.",
    "Your Journey Begins Here"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/coupons/active`);
      const data = await response.json();
      setCoupons(data.data || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`✅ Coupon "${code}" copied!`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={img}
                alt="Car"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 animate-fade-in-up">
                {quotes[currentSlide]}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-10 animate-fade-in-up animation-delay-300">
                Explore our premium fleet of vehicles. From economy to luxury, we've got the perfect ride for every journey.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-600">
                <Link to="/cars">
                  <button className="group relative bg-white text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      🚗 Browse Cars
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </Link>
                <Link to="/auth">
                  <button className="bg-transparent border-3 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-black transition-all transform hover:scale-105 shadow-2xl">
                    Get Started →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Special Offers */}
      {coupons.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                🎉 Exclusive Deals
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Limited time offers - Book now and save big!
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {coupons.slice(0, 3).map((coupon, index) => (
                <div
                  key={coupon._id}
                  className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-4 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 p-6">
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg rotate-12">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% OFF` 
                        : `₹${coupon.discountValue} OFF`}
                    </div>
                    <div className="text-3xl font-black text-white mt-6">
                      {coupon.code}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-4 min-h-[4rem] text-lg">
                      {coupon.description}
                    </p>
                    
                    <div className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                      {coupon.minRentalAmount > 0 && (
                        <p className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          Min. booking: ₹{coupon.minRentalAmount}
                        </p>
                      )}
                      <p className="flex items-center text-red-600 dark:text-red-400 font-semibold">
                        <span className="mr-2">⏰</span>
                        Valid until: {new Date(coupon.validUntil).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
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

      {/* Features */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-extrabold text-center mb-16 dark:text-white animate-fade-in">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: '💰',
                title: 'Best Prices',
                description: 'Competitive rates with no hidden charges. Transparent pricing guaranteed.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '🚗',
                title: 'Wide Selection',
                description: 'From budget-friendly to luxury vehicles. Find your perfect match.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '⚡',
                title: '24/7 Support',
                description: 'Round-the-clock assistance with AI-powered chatbot and human support.',
                color: 'from-orange-500 to-red-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group text-center p-10 bg-gray-50 dark:bg-gray-800 rounded-3xl hover:shadow-2xl transition-all transform hover:-translate-y-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`bg-gradient-to-br ${feature.color} rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-6 text-5xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 dark:text-white group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-5xl font-extrabold mb-6 dark:text-white">
                About Our Service
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We're revolutionizing car rentals with cutting-edge technology and customer-first approach. Book instantly, drive confidently.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  '✅ 1000+ Premium Vehicles',
                  '✅ No Hidden Charges',
                  '✅ Instant Booking Confirmation',
                  '✅ 24/7 Roadside Assistance',
                  '✅ Flexible Rental Periods'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-lg text-gray-700 dark:text-gray-300">
                    <span className="mr-3 text-2xl">{item.split(' ')[0]}</span>
                    <span>{item.substring(3)}</span>
                  </li>
                ))}
              </ul>
              <Link to="/cars">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl">
                  Explore Fleet →
                </button>
              </Link>
            </div>
            <div className="relative animate-fade-in animation-delay-300">
              <img
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"
                alt="Luxury Cars"
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">10k+</p>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
            Ready to Hit the Road?
          </h2>
          <p className="text-2xl mb-10 opacity-90 animate-fade-in animation-delay-300">
            Book your perfect car in just 60 seconds
          </p>
          <Link to="/cars">
            <button className="bg-white text-blue-600 px-12 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all transform hover:scale-110 shadow-2xl animate-fade-in animation-delay-600">
              Start Booking Now →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ImprovedHomePage;