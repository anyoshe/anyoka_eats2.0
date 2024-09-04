import React, { createContext, useContext, useReducer } from 'react';

// Initial state of the cart
const initialState = {
  items: [],
  totalPrice: 0,
  cartCount: 0,
  firstDishRestaurant: ''
};

// Action types
const ADD_TO_CART = 'ADD_TO_CART';
const TOGGLE_CART_VISIBILITY = 'TOGGLE_CART_VISIBILITY';
const INCREASE_QUANTITY = 'INCREASE_QUANTITY';
const DECREASE_QUANTITY = 'DECREASE_QUANTITY';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';

// Reducer function to handle cart actions
const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const { dishDetails } = action.payload;
      const { dishCode, dishName, dishPrice, dishCategory, restaurant, discount, discountedPrice } = dishDetails;
    
      // Use discounted price if available, otherwise use the original price
      const price = discount > 0 ? discountedPrice : dishPrice * 1.2; 
      const quantity = 1; 
    
      const existingItem = state.items.find(item => item.dishCode === dishCode);
    
      let updatedItems;
      if (existingItem) {
        updatedItems = state.items.map(item =>
          item.dishCode === dishCode ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [...state.items, { ...dishDetails, price, quantity }];
      }
    
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    
      let firstDishRestaurant = state.firstDishRestaurant;
      if (!firstDishRestaurant) {
        firstDishRestaurant = restaurant;
      } else if (firstDishRestaurant !== restaurant) {
        const userConfirmation = window.confirm(
          `You are currently ordering from ${firstDishRestaurant}. Do you want to add dishes from ${restaurant}?`
        );
        if (!userConfirmation) {
          return state;
        }
      }
    
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingStoredItem = storedCart.find(item => item.dishCode === dishCode);
    
      if (existingStoredItem) {
        existingStoredItem.quantity++;
      } else {
        storedCart.push({ dishCode, dishName, dishPrice, dishCategory, restaurant, quantity });
      }
    
      localStorage.setItem('cart', JSON.stringify(storedCart));
    
      return {
        ...state,
        items: updatedItems,
        totalPrice: newTotalPrice,
        cartCount: newCartCount,
        firstDishRestaurant
      };
    }

    case INCREASE_QUANTITY: {
      const { dishCode } = action.payload;
      const updatedItems = state.items.map(item =>
        item.dishCode === dishCode ? { ...item, quantity: item.quantity + 1 } : item
      );
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingStoredItem = storedCart.find(item => item.dishCode === dishCode);
    
      if (existingStoredItem) {
        existingStoredItem.quantity++;
      }
    
      localStorage.setItem('cart', JSON.stringify(storedCart));
    
      return {
        ...state,
        items: updatedItems,
        totalPrice: newTotalPrice,
        cartCount: newCartCount
      };
    }
    
    case DECREASE_QUANTITY: {
      const { dishCode } = action.payload;
      const updatedItems = state.items.map(item =>
        item.dishCode === dishCode
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : item.quantity }
          : item
      ).filter(item => item.quantity > 0);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingStoredItem = storedCart.find(item => item.dishCode === dishCode);
    
      if (existingStoredItem) {
        if (existingStoredItem.quantity > 1) {
          existingStoredItem.quantity--;
        } else {
          const index = storedCart.findIndex(item => item.dishCode === dishCode);
          if (index !== -1) storedCart.splice(index, 1);
        }
      }
    
      localStorage.setItem('cart', JSON.stringify(storedCart));
    
      return {
        ...state,
        items: updatedItems,
        totalPrice: newTotalPrice,
        cartCount: newCartCount
      };
    }
    
    case REMOVE_FROM_CART: {
      const { dishCode } = action.payload;
      const updatedItems = state.items.filter(item => item.dishCode !== dishCode);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const updatedStoredCart = storedCart.filter(item => item.dishCode !== dishCode);

      localStorage.setItem('cart', JSON.stringify(updatedStoredCart));

      return {
        ...state,
        items: updatedItems,
        totalPrice: newTotalPrice,
        cartCount: newCartCount
      };
    }
    case TOGGLE_CART_VISIBILITY: {
      return {
        ...state,
        isVisible: !state.isVisible
      };
    }
    default:
      return state;
  }
};

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);


