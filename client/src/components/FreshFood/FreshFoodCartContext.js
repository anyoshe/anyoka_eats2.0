import React, { createContext, useContext, useReducer } from 'react';

// Initial state of the cart
const initialState = {
  items: [],
  totalPrice: 0,
  cartCount: 0,
  firstFoodVendor: ''
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
      const { foodDetails } = action.payload;
      const { foodCode, foodName, foodPrice, foodCategory, vendor, discountedPrice } = foodDetails;
      
      // Use discount price if available, otherwise use the original price with a 20% markup
      const price = discountedPrice ? discountedPrice : foodPrice * 1.2;
      const quantity = 1; // Always 1 for now

      const existingItem = state.items.find(item => item.foodCode === foodCode);

      let updatedItems;
      if (existingItem) {
        updatedItems = state.items.map(item =>
          item.foodCode === foodCode ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [...state.items, { ...foodDetails, price, quantity }];
      }

      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      let firstFoodVendor = state.firstFoodVendor;
      if (!firstFoodVendor) {
        firstFoodVendor = vendor;
      } else if (firstFoodVendor !== vendor) {
        const userConfirmation = window.confirm(
          `You are currently ordering from ${firstFoodVendor}. Do you want to add foods from ${vendor}?`
        );
        if (!userConfirmation) {
          return state;
        }
      }

      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingStoredItem = storedCart.find(item => item.foodCode === foodCode);

      if (existingStoredItem) {
        existingStoredItem.quantity++;
      } else {
        storedCart.push({ foodCode, foodName, foodPrice, foodCategory, vendor, quantity, price });
      }

      localStorage.setItem('cart', JSON.stringify(storedCart));

      return {
        ...state,
        items: updatedItems,
        totalPrice: newTotalPrice,
        cartCount: newCartCount,
        firstFoodVendor
      };
    }
    case INCREASE_QUANTITY: {
      const { foodCode } = action.payload;
      const updatedItems = state.items.map(item =>
        item.foodCode === foodCode ? { ...item, quantity: item.quantity + 1 } : item
      );
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingStoredItem = storedCart.find(item => item.foodCode === foodCode);

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
      const { foodCode } = action.payload;
      const updatedItems = state.items.map(item =>
        item.foodCode === foodCode
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : item.quantity }
          : item
      ).filter(item => item.quantity > 0);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingStoredItem = storedCart.find(item => item.foodCode === foodCode);

      if (existingStoredItem) {
        if (existingStoredItem.quantity > 1) {
          existingStoredItem.quantity--;
        } else {
          const index = storedCart.findIndex(item => item.foodCode === foodCode);
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
      const { foodCode } = action.payload;
      const updatedItems = state.items.filter(item => item.foodCode !== foodCode);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const updatedStoredCart = storedCart.filter(item => item.foodCode !== foodCode);

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

const FreshFoodCartContext = createContext();


export const FreshFoodCartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <FreshFoodCartContext.Provider value={{ state, dispatch }}>
      {children}
    </FreshFoodCartContext.Provider>
  );
};

export const useFreshFoodCart = () => useContext(FreshFoodCartContext);
export default FreshFoodCartContext;