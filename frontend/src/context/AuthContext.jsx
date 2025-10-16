// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔍 AuthContext Init - Token:', !!token, 'User Data:', !!userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Parsed User:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginService(email, password);
      console.log('🔐 Login Response:', response);
      
      // ✅ FIXED: Backend returns user data directly, not nested
      const userData = {
        _id: response._id,
        name: response.name,
        email: response.email,
        role: response.role,
        phone: response.phone
      };
      
      console.log('✅ Setting User Data:', userData);
      
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return response;
    } catch (error) {
      console.error('❌ Login Error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerService(userData);
      console.log('📝 Register Response:', response);
      
      // ✅ FIXED: Backend returns user data directly
      const userInfo = {
        _id: response._id,
        name: response.name,
        email: response.email,
        role: response.role,
        phone: response.phone
      };
      
      setUser(userInfo);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      return response;
    } catch (error) {
      console.error('❌ Register Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('❌ Logout Error:', error);
    } finally {
      console.log('🚪 Logging out - Clearing state');
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (userData) => {
    console.log('🔄 Updating User:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Debug logging
  useEffect(() => {
    console.log('👤 AuthContext State Changed:', { 
      hasUser: !!user, 
      userName: user?.name,
      userRole: user?.role,
      loading 
    });
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};