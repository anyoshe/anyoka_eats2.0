import React, { createContext, useState, useEffect } from 'react';
import config from '../config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
  const [driver, setDriver] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedDriver = localStorage.getItem('driver');
    const storedToken = localStorage.getItem('driverToken');

    if (storedDriver && storedToken) {
      setDriver(JSON.parse(storedDriver));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // If there's a token, fetch the driver's profile details
    if (token) {
      fetchDriverProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchDriverProfile = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/driver/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');

      setDriver(data);  // Store driver details in context
      setLoading(false);

      if (data.profileCompleted) {
        navigate('/driver/dashboard');  // Redirect to dashboard if profile is complete
      } else {
        navigate('/driver/profile-setup');  // Redirect to profile setup if incomplete
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const signupDriver = async (driverData) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/driver/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driverData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');

    // ✅ Backend should NOT send token until verification, so no localStorage yet
    return { success: true, message: data.message };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Signup failed due to a server error.',
    };
  }
};


  const loginDriver = async (credentials) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/driver/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');

    // ✅ Check if account is verified
    if (!data.driver.isVerified) {
      throw new Error('Please verify your email before logging in.');
    }

    // ✅ Store session data only for verified users
    setDriver(data.driver);
    setToken(data.token);
    localStorage.setItem('driver', JSON.stringify(data.driver));
    localStorage.setItem('driverToken', data.token);

    if (data.driver.profileCompleted) {
      navigate('/driver/dashboard');
    } else {
      navigate('/driver/profile-setup');
    }

    return { success: true, message: 'Login successful!' };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Login failed due to a server error.',
    };
  }
};


  const requestDriverReset = async (email) => {
    try {
      const response = await axios.post(`${config.backendUrl}/api/driver/request-reset`, { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send reset link' };
    }
  };

  const resetDriverPassword = async (token, newPassword) => {
    try {
      const response = await axios.post(`${config.backendUrl}/api/driver/reset-password`, { token, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to reset password' };
    }
  };

  const logoutDriver = () => {
    setDriver(null);
    setToken(null);
    localStorage.removeItem('driver');
    localStorage.removeItem('driverToken');
  };

  return (
    <DriverContext.Provider value={{ driver, setDriver, token, fetchDriverProfile, loading, signupDriver, loginDriver, requestDriverReset, resetDriverPassword, logoutDriver }}>
      {children}
    </DriverContext.Provider>
  );
};
