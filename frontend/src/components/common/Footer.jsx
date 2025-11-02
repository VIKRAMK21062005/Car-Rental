// frontend/src/components/common/Footer.jsx
import { useState } from "react";

const EnhancedFooter = () => {
  const [activePopup, setActivePopup] = useState(null);

  const togglePopup = (type) => {
    setActivePopup(activePopup === type ? null : type);
  };

  const closeAllPopups = () => {
    setActivePopup(null);
  };

  return (
    <footer id="footer" className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <span className="text-2xl">🚗</span>
              </div>
              <span className="text-2xl font-bold">CarRental</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your trusted partner for premium car rental services.
            </p>
            <a
              href="https://www.linkedin.com/in/vikram-k2161/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-all text-sm"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
              </svg>
              LinkedIn
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-400">
              Quick Links
            </h3>
            <ul className="space-y-1 text-sm">
              {["Home", "Browse Cars", "My Bookings", "Profile"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-400">
              Services
            </h3>
            <ul className="space-y-1 text-sm">
              {[
                "Daily Rentals",
                "Long-term Lease",
                "Airport Transfer",
                "Corporate",
              ].map((s) => (
                <li key={s}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media + Contact */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-center text-blue-400">
              Connect With Us
            </h3>
            <div className="flex justify-center space-x-6">
              {/* WhatsApp */}
              <div className="relative">
                <button
                  onClick={() => togglePopup('whatsapp')}
                  className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 p-3 rounded-2xl transition-all transform hover:scale-110 shadow-lg"
                  title="WhatsApp"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>
                {activePopup === 'whatsapp' && (
                  <div
                    className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-2xl shadow-2xl animate-fade-in z-50"
                    style={{ width: "4.5cm", height: "5.5cm" }}
                  >
                    <button
                      onClick={closeAllPopups}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 z-10"
                    >
                      ×
                    </button>
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/9944043817"
                      alt="WhatsApp QR"
                      className="w-40 h-40 mx-auto"
                    />
                    <p className="text-center text-gray-800 text-sm font-semibold mt-2">
                      Scan to WhatsApp
                    </p>
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div className="relative">
                <button
                  onClick={() => togglePopup('instagram')}
                  className="group bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 p-3 rounded-2xl transition-all transform hover:scale-110 shadow-lg"
                  title="Instagram"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
                {activePopup === 'instagram' && (
                  <div
                    className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-2xl shadow-2xl animate-fade-in z-50"
                    style={{ width: "4.5cm", height: "5.5cm" }}
                  >
                    <button
                      onClick={closeAllPopups}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 z-10"
                    >
                      ×
                    </button>
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://instagram.com/vikram_k2161"
                      alt="Instagram QR"
                      className="w-40 h-40 mx-auto"
                    />
                    <p className="text-center text-gray-800 text-sm font-semibold mt-2">
                      Scan to Follow
                    </p>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <button
                  onClick={() => togglePopup('email')}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 p-3 rounded-2xl transition-all transform hover:scale-110 shadow-lg"
                  title="Email"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>

                {activePopup === 'email' && (
                  <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 py-3 rounded-xl shadow-xl animate-fade-in whitespace-nowrap z-50">
                    <button
                      onClick={closeAllPopups}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-sm z-10"
                    >
                      ×
                    </button>
                    <p className="text-sm font-semibold">
                      vikram2k.thenmozhi@gmail.com
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm font-semibold text-gray-200 text-center mt-4">
              📞 +91 9944043817
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-4 pt-3 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 CarRental. All rights reserved. Designed by{" "}
            <a
              href="https://www.linkedin.com/in/vikram-k2161/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Vikram K
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;