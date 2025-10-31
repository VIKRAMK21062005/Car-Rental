import { useState } from 'react';
import { validateCoupon } from '../../services/couponService';

const CouponInput = ({ onApply }) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setMessage('');

    try {
      const { valid, discount } = await validateCoupon(code);
      if (valid) {
        onApply(code, discount);
        setMessage(`Coupon applied! ${discount}% discount`);
      } else {
        setMessage('Invalid coupon code');
      }
    } catch {
      setMessage('Failed to validate coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Coupon Code</label>
      <div className="flex space-x-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? '...' : 'Apply'}
        </button>
      </div>
      {message && (
        <p className={`text-sm mt-1 ${message.includes('applied') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default CouponInput;