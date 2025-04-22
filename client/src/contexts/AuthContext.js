import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('authToken');
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [redirectPath, setRedirectPath] = useState('/'); // Track where to redirect after login
  const [currentProduct, setCurrentProduct] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  
  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   const storedToken = localStorage.getItem('authToken');
  //   if (storedUser && storedToken) {
  //     setUser(JSON.parse(storedUser));
  //     setIsLoggedIn(true);
  //   } else {
  //     setUser(null);
  //     setIsLoggedIn(false);
  //   }
  // }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

