// utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'changeme',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export default generateToken;
