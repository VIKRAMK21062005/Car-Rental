// frontend/src/components/bookings/EnhancedBookingForm.jsx
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

const EnhancedBookingForm = ({ car, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    totalHours: 0,
    totalAmount: 0
  });

  const calculateBooking = () => {
    if (!bookingData.startDate || !bookingData.endDate) return;

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    if (hours > 0) {
      const days = Math.ceil(hours / 24);
      const amount = days * car.pricePerDay;
      
      setBookingData(prev => ({
        ...prev,
        totalHours: hours,
        totalAmount: amount
      }));
      setStep(2);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

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

      // Step 2: Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Step 3: Create booking
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
        setStep(3);
        setTimeout(() => onSuccess(bookingResult.booking), 2000);
      } else {
        setError(bookingResult.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map(num => (
          <div key={num} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              step >= num ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step > num ? '✓' : num}
            </div>
            <span className="text-xs mt-2 dark:text-gray-300">
              {num === 1 ? 'Select Dates' : num === 2 ? 'Payment' : 'Confirmed'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Date Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold dark:text-white">Select Rental Period</h2>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <img 
                src={car.image || 'https://via.placeholder.com/80'}
                alt={car.name}
                className="w-20 h-20 rounded-lg object-cover mr-4"
              />
              <div>
                <h3 className="font-bold dark:text-white">{car.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{car.brand} {car.model}</p>
                <p className="text-blue-600 font-bold">₹{car.pricePerDay}/day</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={bookingData.startDate}
              onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={bookingData.endDate}
              onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
              min={bookingData.startDate || new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={calculateBooking}
              disabled={!bookingData.startDate || !bookingData.endDate}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold dark:text-white">Payment Information</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Booking Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-4 dark:text-white">Booking Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">From:</span>
                <span className="font-semibold dark:text-white">
                  {new Date(bookingData.startDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">To:</span>
                <span className="font-semibold dark:text-white">
                  {new Date(bookingData.endDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-semibold dark:text-white">{bookingData.totalHours}h</span>
              </div>
              <div className="flex justify-between border-t dark:border-gray-600 pt-2 mt-2">
                <span className="font-bold dark:text-white">Total:</span>
                <span className="text-2xl font-bold text-blue-600">₹{bookingData.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Card Details */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Card Details
            </label>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💳 Test card: 4242 4242 4242 4242 | Any future date | Any CVC
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">🔒 Secure Payment</p>
                <p>Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(1)}
              disabled={processing}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              disabled={!stripe || processing}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 flex items-center justify-center"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay ₹${bookingData.totalAmount}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Booking Confirmed!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your booking has been successfully confirmed
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to your bookings...
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedBookingForm;