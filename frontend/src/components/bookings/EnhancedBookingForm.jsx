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
    invalid: { color: '#fa755a', iconColor: '#fa755a' }
  }
};

const EnhancedBookingFormWithCoupon = ({ car, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'offline'
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    totalHours: 0,
    totalAmount: 0,
    couponCode: '',
    discount: 0,
    finalAmount: 0
  });

  const getLocalDateTimeMin = () => {
    const now = new Date();
    now.setHours(now.getHours() - 1);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const calculateBooking = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const now = new Date();
    const minStartTime = new Date(now.getTime() - 60 * 60 * 1000);
    
    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    if (start < minStartTime) {
      setError('Start date cannot be more than 1 hour in the past');
      return;
    }

    const diffMs = end - start;
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.ceil(hours / 24);
    const amount = days * car.pricePerDay;
    
    if (hours < 1) {
      setError('Rental period must be at least 1 hour');
      return;
    }

    setBookingData(prev => ({
      ...prev,
      totalHours: hours,
      totalAmount: amount,
      finalAmount: amount - (amount * prev.discount / 100)
    }));
    setError('');
    setStep(2);
  };

  const applyCoupon = async () => {
    if (!bookingData.couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setProcessing(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: bookingData.couponCode,
          rentalAmount: bookingData.totalAmount,
          vehicleType: car.type
        })
      });

      const data = await response.json();

      if (data.success) {
        const discountAmount = data.data.discountAmount;
        const discountPercent = (discountAmount / bookingData.totalAmount) * 100;
        
        setBookingData(prev => ({
          ...prev,
          discount: discountPercent,
          finalAmount: data.data.finalAmount
        }));
        setError('');
        alert(`✅ Coupon applied! You saved ₹${discountAmount}`);
      } else {
        setError(data.error || 'Invalid coupon code');
      }
    } catch (err) {
      setError('Failed to validate coupon');
    } finally {
      setProcessing(false);
    }
  };

  const removeCoupon = () => {
    setBookingData(prev => ({
      ...prev,
      couponCode: '',
      discount: 0,
      finalAmount: prev.totalAmount
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'offline') {
      // Create booking without payment
      await createBookingOffline();
      return;
    }

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

      // Step 1: Create payment intent
      const intentResponse = await fetch(`${API_URL}/bookings/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: bookingData.finalAmount,
          carId: car._id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate
        })
      });

      const intentData = await intentResponse.json();

      if (!intentResponse.ok) {
        throw new Error(intentData.message || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = intentData;

      // Step 2: Confirm card payment
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
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment was not successful');
      }

      // Step 3: Create booking in database
      await createBooking(paymentIntent.id);

    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const createBooking = async (transactionId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
          totalAmount: bookingData.finalAmount,
          transactionId: transactionId,
          couponCode: bookingData.couponCode || null
        })
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResult.success) {
        throw new Error(bookingResult.message || 'Booking creation failed');
      }

      // Apply coupon if used
      if (bookingData.couponCode) {
        await fetch(`${API_URL}/coupons/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            code: bookingData.couponCode,
            rentalAmount: bookingData.totalAmount,
            userId: JSON.parse(localStorage.getItem('user'))._id,
            bookingId: bookingResult.booking._id
          })
        });
      }

      setStep(3);
      setTimeout(() => {
        onSuccess(bookingResult.booking);
      }, 2000);

    } catch (err) {
      throw new Error(err.message || 'Failed to create booking');
    }
  };

  const createBookingOffline = async () => {
    setProcessing(true);
    try {
      await createBooking('OFFLINE_PAYMENT');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
      {/* Progress Steps */}
      <div className="flex justify-between mb-6">
        {[1, 2, 3].map(num => (
          <div key={num} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              step >= num 
                ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                : 'bg-gray-300 text-gray-600'
            }`}>
              {step > num ? '✓' : num}
            </div>
            <span className="text-xs mt-1 dark:text-gray-300 font-medium">
              {num === 1 ? 'Dates' : num === 2 ? 'Payment' : 'Done'}
            </span>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Date Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold dark:text-white">Select Rental Period</h2>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 p-3 rounded-lg">
            <div className="flex items-center">
              <img 
                src={car.image || 'https://via.placeholder.com/60'}
                alt={car.name}
                className="w-16 h-16 rounded-lg object-cover mr-3"
              />
              <div>
                <h3 className="font-bold dark:text-white">{car.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-bold">₹{car.pricePerDay}/day</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              📅 Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={bookingData.startDate}
              onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
              min={getLocalDateTimeMin()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              📅 End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={bookingData.endDate}
              onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
              min={bookingData.startDate || getLocalDateTimeMin()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={calculateBooking}
              disabled={!bookingData.startDate || !bookingData.endDate}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:opacity-50 transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold dark:text-white">Complete Booking</h2>

          {/* Booking Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm">
            <h3 className="font-semibold mb-2 dark:text-white">📋 Summary</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-semibold dark:text-white">
                  {Math.ceil(bookingData.totalHours / 24)} days ({bookingData.totalHours}h)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-semibold dark:text-white">₹{bookingData.totalAmount}</span>
              </div>
              {bookingData.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({bookingData.discount.toFixed(0)}%):</span>
                  <span className="font-semibold">-₹{(bookingData.totalAmount - bookingData.finalAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t dark:border-gray-600 pt-2 mt-2">
                <span className="font-bold dark:text-white">Total:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{bookingData.finalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              🎟️ Have a Coupon Code?
            </label>
            {!bookingData.discount ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bookingData.couponCode}
                  onChange={(e) => setBookingData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={applyCoupon}
                  disabled={processing || !bookingData.couponCode}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-100 dark:bg-green-900/30 p-2 rounded">
                <span className="text-green-700 dark:text-green-300 font-semibold text-sm">
                  ✅ {bookingData.couponCode} applied
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-red-600 hover:text-red-700 text-sm font-semibold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              💳 Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('online')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'online'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="font-semibold text-sm dark:text-white">Online Payment</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pay now</div>
              </button>
              <button
                onClick={() => setPaymentMethod('offline')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'offline'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="font-semibold text-sm dark:text-white">Pay Later</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">At pickup</div>
              </button>
            </div>
          </div>

          {/* Card Details (if online payment) */}
          {paymentMethod === 'online' && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                💳 Card Details
              </label>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                🧪 Test: 4242 4242 4242 4242 | Any future date | Any CVC
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setStep(1)}
              disabled={processing}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold text-sm disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              onClick={handlePayment}
              disabled={processing || (paymentMethod === 'online' && !stripe)}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold text-sm disabled:opacity-50 flex items-center justify-center"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                `${paymentMethod === 'online' ? '💳 Pay' : '📝 Confirm'} ₹${bookingData.finalAmount}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your booking has been successfully confirmed
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting...
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedBookingFormWithCoupon;