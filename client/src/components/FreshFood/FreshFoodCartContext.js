import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const initialState = {
  items: [],
  totalPrice: 0,
  cartCount: 0,
  firstFoodVendor: '',
  vendorLocation: '', // Human-readable address for the first vendor
  vendorLocations: [], // Stores all vendors' locations
  vendorCoordinates: [], // Stores coordinates for all vendors
  totalDistance: 0, // Total distance between vendors
  isVisible: false,
};

// Action types
const ADD_TO_CART = 'ADD_TO_CART';
const TOGGLE_CART_VISIBILITY = 'TOGGLE_CART_VISIBILITY';
const INCREASE_QUANTITY = 'INCREASE_QUANTITY';
const DECREASE_QUANTITY = 'DECREASE_QUANTITY';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const SET_VENDOR_LOCATIONS_AND_DISTANCE = 'SET_VENDOR_LOCATIONS_AND_DISTANCE';
const SET_VENDOR_LOCATION = 'SET_VENDOR_LOCATION';

// Reducer function to handle cart actions
const foodCartReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const { foodDetails } = action.payload;
      const { foodCode, foodName, foodPrice, foodCategory, vendor, discount, discountedPrice } = foodDetails;
      const price = discount > 0 ? discountedPrice : foodPrice * 1.1;
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

      // Check if the first vendor is set
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

      // Local storage update
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
        firstFoodVendor,
      };
    }

    case SET_VENDOR_LOCATION: {
      return {
        ...state,
        vendorLocation: action.payload,
      };
    }

    case SET_VENDOR_LOCATIONS_AND_DISTANCE: {
      const { vendorLocations, vendorCoordinates, totalDistance } = action.payload;
      return {
        ...state,
        vendorLocations,
        vendorCoordinates,
        totalDistance,
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

// Context
const FoodCartContext = createContext();

const fallbackLocations = {
  "Old Market Malindi": { lat: -3.2191971243260338, lng: 40.12079213531878 },
  "Linet": { lat: -3.222577, lng: 40.114147 },
  "Vendor C": { lat: -3.210163, lng: 40.117003 },
};

const geocodeVendorName = async (vendorName) => {
  const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
 // Replace with your actual API key
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(vendorName)}&key=${googleApiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return `${location.lat},${location.lng}`; // Return latitude and longitude
    } else {
      console.error('Geocoding error:', response.data.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching geocode:', error);
    return null;
  }
};

const fetchVendorLocation = async (vendorName) => {
  console.log('Fetching location for:', vendorName);
  try {
    const response = await axios.get(`${config.backendUrl}/api/vendors/vendor/${encodeURIComponent(vendorName)}`);
    console.log(response);
    return response.data.vendorLocation;
  } catch (error) {
    console.error('Error fetching vendor location:', error);

    // Try geocoding the vendor name if location not found
    const geocodedLocation = await geocodeVendorName(vendorName);
    if (geocodedLocation) {
      return geocodedLocation;
    }

    // Fall back to hardcoded locations if geocoding fails
    const fallbackLocation = fallbackLocations[vendorName];
    if (fallbackLocation) {
      return fallbackLocation;
    }

    return null; // No location found
  }
};

// Helper function to fetch coordinates for a location
const fetchCoordinates = async (address) => {
  const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleApiKey}`
    );
    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
};

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Provider component
export const FreshFoodCartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(foodCartReducer, initialState);

  useEffect(() => {
    const fetchLocationsAndCalculateDistance = async () => {
      if (state.firstFoodVendor && state.items.length > 1) {
        const vendorLocations = [];
        const vendorCoordinates = [];

        // Fetch location and coordinates for all vendors
        for (const item of state.items) {
          const vendorLocation = await fetchVendorLocation(item.vendor);
          console.log(vendorLocation)
          if (vendorLocation) {
            vendorLocations.push(vendorLocation);
            const coordinates = await fetchCoordinates(vendorLocation);
            console.log(coordinates)
            if (coordinates) {
              vendorCoordinates.push(coordinates);
            }
          }
        }

        // Calculate the total distance between vendors
        let totalDistance = 0;
        for (let i = 0; i < vendorCoordinates.length - 1; i++) {
          totalDistance += calculateDistance(vendorCoordinates[i], vendorCoordinates[i + 1]);
          console.log(totalDistance);
        }

        // Dispatch the updated vendor locations, coordinates, and total distance
        dispatch({
          type: SET_VENDOR_LOCATIONS_AND_DISTANCE,
          payload: {
            vendorLocations,
            vendorCoordinates,
            totalDistance,
          },
        });
      }
    };

    fetchLocationsAndCalculateDistance();
  }, [state.items]);

  return (
    <FoodCartContext.Provider value={{ state, dispatch }}>
      {children}
    </FoodCartContext.Provider>
  );
};

// Hook to use cart context
export const useFreshFoodCart = () => useContext(FoodCartContext);

// Action to add to cart with vendor location fetch
export const addToFoodCartWithVendorLocation = (foodDetails) => async (dispatch) => {
  const vendorLocation = await fetchVendorLocation(foodDetails.vendor);
  if (vendorLocation) {
    dispatch({
      type: ADD_TO_CART,
      payload: { foodDetails, vendorLocation },
    });
  }
};
