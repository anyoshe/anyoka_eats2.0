import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { ADMIN_CREDENTIALS } from '../config/adminCredentials';

console.log('ADMIN_CREDENTIALS loaded:', ADMIN_CREDENTIALS);

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Check if user is already logged in (from localStorage)
      const savedUser = localStorage.getItem('admin_user');
      const savedToken = localStorage.getItem('admin_token');
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        apiService.setToken(savedToken);
      }
    } catch (error) {
      console.error('Error loading saved user data:', error);
      // Clear corrupted data
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      // Always authenticate with backend /admin/login endpoint
  const response = await fetch(`${apiService.baseURL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: '1',
          username: username,
          name: 'Anyoka Eats Administrator',
          role: data.role || 'admin'
        };
        // Save to localStorage
        localStorage.setItem('admin_user', JSON.stringify(userData));
        localStorage.setItem('admin_token', data.token);
        // Set token in API service
        apiService.setToken(data.token);
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    apiService.setToken(null);
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
