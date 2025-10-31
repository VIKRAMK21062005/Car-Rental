// frontend/src/components/bookings/EnhancedBookingForm.jsx - FIXED DATE VALIDATION
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': { color: '#aab7c4' }
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

  // ✅ FIXED: Get current date/time in local timezone for min attribute
  const getLocalDateTimeMin = () => {
    const now = new Date();
    // Subtract 1 hour to allow bookings starting "now"
    now.setHours(now.getHours() - 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Calculate hours and amount
  const calculateBooking = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const now = new Date();
    
    // ✅ FIXED: Allow bookings starting from 1 hour ago (for timezone issues)
    const minStartTime = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Validate dates
    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    if (start < minStartTime) {
      setError('Start date cannot be more than 1 hour in the past');
      return;
    }

    // Calculate hours (round up to nearest hour)
    const diffMs = end - start;
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    // Calculate days for pricing (minimum 1 day = 24 hours)
    const days = Math.ceil(hours / 24);
    const amount = days * car.pricePerDay;
    
    if (hours < 1) {
      setError('Rental period must be at least 1 hour');
      return;
    }

    console.log('📊 Booking Calculation:', {
      start: start.toISOString(),
      end: end.toISOString(),
      hours,
      days,
      pricePerDay: car.pricePerDay,
      amount,
      now: now.toISOString(),
      minStartTime: minStartTime.toISOString()
    });

    setBookingData(prev => ({
      ...prev,
      totalHours: hours,
      totalAmount: amount
    }));
    setError('');
    setStep(2);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system not ready. Please refresh the page.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please login to continue');
      }

      console.log('💳 Step 1: Creating payment intent...');
      
      // Step 1: Create payment intent
      const intentResponse = await fetch(`${API_URL}/bookings/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: bookingData.totalAmount,
          carId: car._id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate
        })
      });

      const rawText = await intentResponse.text();
      console.log("🔍 Raw response from backend:", rawText);

      let intentData;
      try {
        intentData = JSON.parse(rawText);
      } catch {
        throw new Error("Invalid JSON received from backend: " + rawText);
      }

      if (!intentResponse.ok) {
        throw new Error(intentData.message || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = intentData;

      if (!clientSecret) {
        throw new Error('No payment client secret received');
      }

      console.log('✅ Payment intent created:', paymentIntentId);

      // Step 2: Confirm card payment
      console.log('💳 Step 2: Confirming payment...');
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: localStorage.getItem('user') 
                ? JSON.parse(localStorage.getItem('user')).name 
                : 'Customer'
            }
          }
        }
      );

      if (stripeError) {
        console.error('❌ Stripe Error:', stripeError);
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment was not successful');
      }

      console.log('✅ Payment confirmed:', paymentIntent.id);

      // Step 3: Create booking in database
      console.log('📝 Step 3: Creating booking...');
      
      const bookingResponse = await fetch(`${API_URL}/bookings/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        console.error('❌ Booking Error:', errorData);
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const bookingResult = await bookingResponse.json();

      if (!bookingResult.success) {
        throw new Error(bookingResult.message || 'Booking creation failed');
      }

      console.log('✅ Booking created successfully:', bookingResult.booking._id);

      // Success!
      setStep(3);
      
      // Wait 2 seconds then redirect
      setTimeout(() => {
        onSuccess(bookingResult.booking);
      }, 2000);

    } catch (err) {
      console.error('❌ Payment/Booking Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      
      if (err.message.includes('booking') || err.message.includes('already booked')) {
        setError('Payment successful but booking failed. Please contact support with your transaction ID.');
      }
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
              step >= num 
                ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                : 'bg-gray-300 text-gray-600'
            }`}>
              {step > num ? '✓' : num}
            </div>
            <span className="text-xs mt-2 dark:text-gray-300 font-medium">
              {num === 1 ? 'Select Dates' : num === 2 ? 'Payment' : 'Confirmed'}
            </span>
            {num < 3 && (
              <div className={`h-1 w-full mt-2 ${
                step > num ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg animate-shake">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-700 dark:text-red-300 font-semibold">Error</p>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Date Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold dark:text-white">Select Rental Period</h2>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <img 
                src={car.image || 'https://via.placeholder.com/80'}
                alt={car.name}
                className="w-20 h-20 rounded-lg object-cover mr-4"
              />
              <div>
                <h3 className="font-bold dark:text-white">{car.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{car.brand} {car.model}</p>
                <p className="text-blue-600 dark:text-blue-400 font-bold">₹{car.pricePerDay}/day</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              📅 Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={bookingData.startDate}
              onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
              min={getLocalDateTimeMin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ℹ️ You can book starting from the current time
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              📅 End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={bookingData.endDate}
              onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
              min={bookingData.startDate || getLocalDateTimeMin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={calculateBooking}
              disabled={!bookingData.startDate || !bookingData.endDate}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold dark:text-white">Payment Information</h2>

          {/* Booking Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-4 dark:text-white">📋 Booking Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">📆 From:</span>
                <span className="font-semibold dark:text-white">
                  {new Date(bookingData.startDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">📆 To:</span>
                <span className="font-semibold dark:text-white">
                  {new Date(bookingData.endDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">⏱️ Duration:</span>
                <span className="font-semibold dark:text-white">
                  {bookingData.totalHours}h ({Math.ceil(bookingData.totalHours / 24)} days)
                </span>
              </div>
              <div className="flex justify-between border-t dark:border-gray-600 pt-2 mt-2">
                <span className="font-bold dark:text-white">💰 Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{bookingData.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Card Details */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              💳 Card Details
            </label>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus-within:border-blue-500 transition">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              🧪 Test card: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">4242 4242 4242 4242</code> | Any future date | Any CVC
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">🔒 Secure Payment</p>
                <p>Your payment information is encrypted and secure. We use Stripe for processing.</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(1)}
              disabled={processing}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold disabled:opacity-50 transition"
            >
              ← Back
            </button>
            <button
              onClick={handlePayment}
              disabled={!stripe || processing}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold disabled:opacity-50 flex items-center justify-center transition shadow-lg hover:shadow-xl"
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
                `💳 Pay ₹${bookingData.totalAmount}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
            Your booking has been successfully confirmed
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            You'll receive a confirmation email shortly
          </p>
          <div className="animate-pulse text-blue-600 dark:text-blue-400 font-medium">
            Redirecting to your bookings...
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBookingForm;