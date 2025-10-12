const Footer = () => (
  <footer className="bg-gray-800 text-white py-8 mt-12">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">CarRental</h3>
          <p className="text-gray-400">Your trusted car rental service with the best rates and vehicles.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/cars" className="hover:text-white">Browse Cars</a></li>
            <li><a href="/bookings" className="hover:text-white">My Bookings</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Email: info@carrental.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Address: 123 Main St, City, Country</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
        <p>&copy; 2025 CarRental. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;