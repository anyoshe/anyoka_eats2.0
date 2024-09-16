import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const initialState = {
  items: [],
  totalPrice: 0,
  cartCount: 0,
  firstFoodVendor: '',
  vendorLocation: '', // Expecting a human-readable address
  isVisible: false
};

// Action types
const ADD_TO_CART = 'ADD_TO_CART';
const TOGGLE_CART_VISIBILITY = 'TOGGLE_CART_VISIBILITY';
const INCREASE_QUANTITY = 'INCREASE_QUANTITY';
const DECREASE_QUANTITY = 'DECREASE_QUANTITY';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const SET_VENDOR_LOCATION = 'SET_VENDOR_LOCATION';

// Reducer function to handle cart actions
const foodCartReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const { foodDetails } = action.payload;
      const { foodCode, foodName, foodPrice, foodCategory, vendor, discount, discountedPrice } = foodDetails;
      const price = discount > 0 ? discountedPrice : foodPrice * 1.2; 
      const quantity = 1;

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

      // Update localStorage
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingStoredItem = storedCart.find(item => item.foodCode === foodCode);

      if (existingStoredItem) {
        existingStoredItem.quantity++;
      } else {
        storedCart.push({ foodCode, foodName, foodPrice, foodCategory, vendor, quantity });
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

    case SET_VENDOR_LOCATION: {
      return {
        ...state,
        vendorLocation: action.payload
      };
    }

    case INCREASE_QUANTITY: {
      const { foodCode } = action.payload;
      const updatedItems = state.items.map(item =>
        item.foodCode === foodCode ? { ...item, quantity: item.quantity + 1 } : item
      );
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      // Update localStorage
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

      // Update localStorage
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

      // Update localStorage
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

const FoodCartContext = createContext();

const fetchVendorLocation = async (vendorName) => {
  console.log('Fetching location for:', vendorName);
  try {
    const response = await axios.get(`${config.backendUrl}/api/vendors/vendor/${encodeURIComponent(vendorName)}`);
    return response.data.vendorLocation; // Directly return the address
  } catch (error) {
    console.error('Error fetching vendor location:', error);
    return null;
  }
};

export const FreshFoodCartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(foodCartReducer, initialState);

  useEffect(() => {
    const fetchLocation = async () => {
      if (state.firstFoodVendor) {
        const location = await fetchVendorLocation(state.firstFoodVendor);
        if (location) {
          dispatch({ type: SET_VENDOR_LOCATION, payload: location });
        }
      }
    };

    fetchLocation();
  }, [state.firstFoodVendor]);

  return (
    <FoodCartContext.Provider value={{ state, dispatch }}>
      {children}
    </FoodCartContext.Provider>
  );
};

export const useFreshFoodCart = () => useContext(FoodCartContext);

// Action to add to cart, which fetches vendorLocation first
export const addToFoodCartWithVendorLocation = (foodDetails) => async (dispatch) => {
  const vendorLocation = await fetchVendorLocation(foodDetails.vendor);
  if (vendorLocation) {
    dispatch({
      type: ADD_TO_CART,
      payload: { foodDetails, vendorLocation }
    });
  }
};
