// frontend/src/context/AuthProvider.jsx - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { login as loginService, register as registerService, logout as logoutService } from '../services/authService';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          console.log('✅ Auth restored from localStorage:', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('ℹ️ No stored auth found');
        }
      } catch (error) {
        console.error('❌ Error parsing stored auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await loginService(email, password);
      
      // Extract user data from response
      const userData = {
        _id: response._id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        role: response.role
      };

      console.log('✅ Login successful:', userData);

      // Store in localStorage first
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Then update state
      setUser(userData);
      
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      console.log('📝 Attempting registration...');
      const response = await registerService(userData);
      
      const user = {
        _id: response._id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        role: response.role
      };

      console.log('✅ Registration successful:', user);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return response;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Logout complete');
    }
  }, []);

  const updateUser = useCallback((userData) => {
    console.log('🔄 Updating user data:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}