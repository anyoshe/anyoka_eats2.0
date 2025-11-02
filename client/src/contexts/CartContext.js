// // src/contexts/CartContext.js
// import React, { createContext, useState, useEffect } from 'react';

// export const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState(() => {
//     // Load cart from localStorage initially
//     const storedCart = localStorage.getItem('cart');
//     return storedCart ? JSON.parse(storedCart) : [];
//   });

//   // Save cart to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('cart', JSON.stringify(cart));
//   }, [cart]);

//   const addToCart = (item) => {
//     setCart(prevCart => {
//       const existingIndex = prevCart.findIndex(i => i._id === item._id);
//       if (existingIndex >= 0) {
//         const updatedCart = [...prevCart];
//         updatedCart[existingIndex].quantity =
//           (updatedCart[existingIndex].quantity || 1) + 1;
//         return updatedCart;
//       }
//       return [...prevCart, { ...item, quantity: 1 }];
//     });
//   };

//   const removeFromCart = (itemId) => {
//     setCart(prevCart => prevCart.filter(item => item._id !== itemId));
//   };

//   const updateCartItem = (index, newItem) => {
//     setCart(prevCart => {
//       const updatedCart = [...prevCart];
//       updatedCart[index] = newItem;
//       return updatedCart;
//     });
//   };

//   const clearCart = () => setCart([]);

//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         setCart,
//         addToCart,
//         removeFromCart,
//         updateCartItem,
//         clearCart,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// src/contexts/CartContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const userKey = user ? `cart_${user._id}` : 'cart_guest';

  const [cart, setCart] = useState(() => {
    // Load cart for current user
    const storedCart = localStorage.getItem(userKey);
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // When user changes (e.g., logout/login), load that user’s cart
  useEffect(() => {
    const newKey = user ? `cart_${user._id}` : 'cart_guest';
    const storedCart = localStorage.getItem(newKey);
    setCart(storedCart ? JSON.parse(storedCart) : []);
  }, [user]);

  // Save cart changes for this specific user
  useEffect(() => {
    localStorage.setItem(userKey, JSON.stringify(cart));
  }, [cart, userKey]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i._id === item._id);
      if (existingIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity =
          (updatedCart[existingIndex].quantity || 1) + 1;
        return updatedCart;
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));
  };

  const updateCartItem = (index, newItem) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart[index] = newItem;
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(userKey);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
