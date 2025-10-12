export const validateCoupon = async (code) => {
  const response = await api.post('/coupons/validate', { code });
  return response.data;
};
export const getCoupons = async () => {
  const response = await api.get('/coupons');
  return response.data;
};