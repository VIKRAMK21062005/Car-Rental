export const calculateRentalDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

export const calculateTotalPrice = (pricePerDay, days, discount = 0) => {
  const subtotal = pricePerDay * days;
  const discountAmount = subtotal * (discount / 100);
  return subtotal - discountAmount;
};

export const getBookingStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-600',
    confirmed: 'bg-green-100 text-green-600',
    completed: 'bg-blue-100 text-blue-600',
    cancelled: 'bg-red-100 text-red-600'
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
