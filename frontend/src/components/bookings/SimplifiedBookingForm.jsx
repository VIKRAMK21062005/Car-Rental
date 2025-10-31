// frontend/src/components/bookings/SimplifiedBookingForm.jsx
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

const SimplifiedBookingForm = ({ car, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    totalHours: 0,
    totalAmount: 0
  });

  const calculateBooking = (start, end) => {
    if (!start || !end) return;

    const startTime = new Date(start);
    const endTime = new Date(end);
    
    if (endTime <= startTime) {
      setError('End date must be after start date');
      return;
    }

    const hours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    const days = Math.ceil(hours / 24);
    const amount = days * car.pricePerDay;
    
    setBookingData(prev => ({
      ...prev,
      startDate: start,
      endDate: end,
      totalHours: hours,
      totalAmount: amount
    }));
    setError('');
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!bookingData.startDate || !bookingData.endDate) {
      setError('Please select booking dates');
      return;
    }

    if (!stripe || !elements) {
      setError('Payment system not loaded');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Step 1: Create payment intent
      const intentResponse = await fetch(`${API_URL}/bookings/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: bookingData.totalAmount,
          carId: car._id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate
        })
      });

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await intentResponse.json();

      // Step 2: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Step 3: Create booking record
      const bookingResponse = await fetch(`${API_URL}/bookings/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          car: car._id,
          bookedTimeSlots: {
            from: bookingData.startDate,
            to: bookingData.endDate
          },
          totalHours: bookingData.totalHours,
          totalAmount: bookingData.totalAmount,
          transactionId: paymentIntent.id
        })
      });

      const bookingResult = await bookingResponse.json();

      if (bookingResult.success) {
        setSuccess(true);
        setTimeout(() => onSuccess(bookingResult.booking), 2000);
      } else {
        throw new Error(bookingResult.message || 'Booking failed');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-fade-in-up">
      {/* Success State */}
      {success ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your booking has been successfully confirmed
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to your bookings...
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold dark:text-white mb-2">Complete Your Booking</h2>
            <p className="text-gray-600 dark:text-gray-400">Select dates and confirm payment</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border-l-4 border-red-500 rounded-lg animate-shake">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* Car Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 p-6 rounded-xl mb-8 animate-fade-in animation-delay-300">
            <div className="flex items-center">
              <img 
                src={car.image || 'https://via.placeholder.com/80'}
                alt={car.name}
                className="w-24 h-24 rounded-xl object-cover mr-4 shadow-lg transform hover:scale-105 transition-transform"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold dark:text-white mb-1">{car.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {car.brand} {car.model} • {car.year}
                </p>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-blue-600">₹{car.pricePerDay}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/day</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            {/* Date Selection */}
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in animation-delay-600">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-gray-300">
                  📅 Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.startDate}
                  onChange={(e) => calculateBooking(e.target.value, bookingData.endDate)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all hover:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-gray-300">
                  📅 End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.endDate}
                  onChange={(e) => calculateBooking(bookingData.startDate, e.target.value)}
                  min={bookingData.startDate || new Date().toISOString().slice(0, 16)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all hover:border-blue-400"
                />
              </div>
            </div>

            {/* Booking Summary */}
            {bookingData.totalAmount > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl animate-fade-in">
                <h3 className="font-semibold mb-4 dark:text-white text-lg">📋 Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-semibold dark:text-white">
                      {Math.ceil(bookingData.totalHours / 24)} days ({bookingData.totalHours}h)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Rate per day:</span>
                    <span className="font-semibold dark:text-white">₹{car.pricePerDay}</span>
                  </div>
                  <div className="border-t dark:border-gray-600 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg dark:text-white">Total Amount:</span>
                      <span className="text-3xl font-bold text-blue-600">₹{bookingData.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card Payment Section */}
            {bookingData.totalAmount > 0 && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold mb-3 dark:text-gray-300">
                  💳 Card Details
                </label>
                <div className="bg-white dark:bg-gray-700 p-5 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-all">
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
                <div className="mt-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 p-3 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test card: 4242 4242 4242 4242 | Any future date | Any CVC
                  </p>
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-xl animate-fade-in">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                    🔒 Secure Payment
                  </p>
                  <p className="text-blue-600 dark:text-blue-400">
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={processing}
                className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold text-lg hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50 transition-all transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!stripe || processing || bookingData.totalAmount === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  `💳 Pay ₹${bookingData.totalAmount}`
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default SimplifiedBookingForm;