import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('userToken');
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [currentStore, setCurrentStore] = useState(null);
  const [redirectPath, setRedirectPath] = useState('/');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('userToken'));


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('userToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setToken(null);
      setIsLoggedIn(false);
    }
  }, []);

 
  const fetchUserProfile = async () => {
    try {
      if (!token) return;

      const res = await axios.get(`${config.backendUrl}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
   
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        redirectPath,
        setRedirectPath,
        currentProduct,
        setCurrentProduct,
        user,
        setUser,
        token,
        setToken,
        logout,
        currentStore,
        setCurrentStore,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

