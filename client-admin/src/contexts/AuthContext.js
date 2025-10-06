import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

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
    // On mount, attempt to validate existing session via a lightweight admin endpoint
    (async () => {
      try {
        await apiService.request('/api/admin/stats', { method: 'GET' });
        setUser({ name: 'Anyoka Eats Administrator', role: 'admin' });
      } catch (_err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username, password) => {
    try {
      // Authenticate with backend /admin/login endpoint
      const response = await fetch(`${apiService.baseURL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Keep token only in memory for subsequent requests
        if (data?.token) {
          apiService.setToken(data.token);
        }
        setUser({ username, name: 'Anyoka Eats Administrator', role: data?.role || 'admin' });
        return { username };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    apiService.clearToken();
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
