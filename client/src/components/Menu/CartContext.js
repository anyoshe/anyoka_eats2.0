// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import axios from 'axios';
// import config from '../../config';

// const initialState = {
//   items: [],
//   totalPrice: 0,
//   cartCount: 0,
//   firstDishRestaurant: '',
//   restaurantLocation: null,
//   isVisible: false
// };

// const ADD_TO_CART = 'ADD_TO_CART';
// const TOGGLE_CART_VISIBILITY = 'TOGGLE_CART_VISIBILITY';
// const INCREASE_QUANTITY = 'INCREASE_QUANTITY';
// const DECREASE_QUANTITY = 'DECREASE_QUANTITY';
// const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
// const SET_RESTAURANT_LOCATION = 'SET_RESTAURANT_LOCATION';

// const cartReducer = (state, action) => {
//   switch (action.type) {
//     case ADD_TO_CART: {
//       const { dishDetails } = action.payload;
//       const { dishCode, dishName, dishPrice, dishCategory, restaurant, discount, discountedPrice } = dishDetails;
//       const price = discount > 0 ? discountedPrice : dishPrice * 1;
//       const quantity = 1;

//       const existingItem = state.items.find(item => item.dishCode === dishCode);

//       let updatedItems;
//       if (existingItem) {
//         updatedItems = state.items.map(item =>
//           item.dishCode === dishCode ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       } else {
//         updatedItems = [...state.items, { ...dishDetails, price, quantity }];
//       }

//       const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//       const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

//       let firstDishRestaurant = state.firstDishRestaurant;
//       if (!firstDishRestaurant) {
//         firstDishRestaurant = restaurant;
//       } else if (firstDishRestaurant !== restaurant) {
//         const userConfirmation = window.confirm(
//           `You are currently ordering from ${firstDishRestaurant}. Do you want to add dishes from ${restaurant}?`
//         );
//         if (!userConfirmation) {
//           return state;
//         }
//       }

//       const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
//       const existingStoredItem = storedCart.find(item => item.dishCode === dishCode);

//       if (existingStoredItem) {
//         existingStoredItem.quantity++;
//       } else {
//         storedCart.push({ dishCode, dishName, dishPrice, dishCategory, restaurant, quantity });
//       }

//       localStorage.setItem('cart', JSON.stringify(storedCart));

//       return {
//         ...state,
//         items: updatedItems,
//         totalPrice: newTotalPrice,
//         cartCount: newCartCount,
//         firstDishRestaurant
//       };
//     }

//     case SET_RESTAURANT_LOCATION: {
//       return {
//         ...state,
//         restaurantLocation: action.payload
//       };
//     }

//     case INCREASE_QUANTITY:{
//       const { dishCode } = action.payload;
//       const updatedItems = state.items.map(item =>
//         item.dishCode === dishCode ? { ...item, quantity: item.quantity + 1 } : item
//       );
//       const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//       const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

//       // Update localStorage
//       const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
//       const existingStoredItem = storedCart.find(item => item.dishCode === dishCode);

//       if (existingStoredItem) {
//         existingStoredItem.quantity++;
//       }

//       localStorage.setItem('cart', JSON.stringify(storedCart));

//       return {
//         ...state,
//         items: updatedItems,
//         totalPrice: newTotalPrice,
//         cartCount: newCartCount
//       };
//     }
   

//     case DECREASE_QUANTITY:{
//       const { dishCode } = action.payload;
//       const updatedItems = state.items.map(item =>
//         item.dishCode === dishCode
//           ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : item.quantity }
//           : item
//       ).filter(item => item.quantity > 0);
//       const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//       const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

//       // Update localStorage
//       const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
//       const existingStoredItem = storedCart.find(item => item.dishCode === dishCode);

//       if (existingStoredItem) {
//         if (existingStoredItem.quantity > 1) {
//           existingStoredItem.quantity--;
//         } else {
//           const index = storedCart.findIndex(item => item.dishCode === dishCode);
//           if (index !== -1) storedCart.splice(index, 1);
//         }
//       }

//       localStorage.setItem('cart', JSON.stringify(storedCart));

//       return {
//         ...state,
//         items: updatedItems,
//         totalPrice: newTotalPrice,
//         cartCount: newCartCount
//       };
//     }
//     case REMOVE_FROM_CART: {
//       const { dishCode } = action.payload;
//       const updatedItems = state.items.filter(item => item.dishCode !== dishCode);
//       const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//       const newCartCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

//       // Update localStorage
//       const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
//       const updatedStoredCart = storedCart.filter(item => item.dishCode !== dishCode);

//       localStorage.setItem('cart', JSON.stringify(updatedStoredCart));

//       return {
//         ...state,
//         items: updatedItems,
//         totalPrice: newTotalPrice,
//         cartCount: newCartCount
//       };
//     }

//     case TOGGLE_CART_VISIBILITY:
//       return {
//         ...state,
//         isVisible: !state.isVisible
//       };

//     default:
//       return state;
//   }
// };

// const CartContext = createContext();

// const geocodeAddress = async (address) => {
//   const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
//   try {
//     const response = await axios.get(url);
//     const data = response.data;

//     if (data.status === 'OK' && data.results.length > 0) {
//       const location = data.results[0].geometry.location;
//       return { lat: location.lat, lng: location.lng };
//     } else {
//       console.error('Unable to find coordinates for address:', address);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error geocoding address:', error);
//     return null;
//   }
// };

// const fetchRestaurantLocation = async (restaurantName) => {
//   console.log('Fetching location for:', restaurantName);
//   try {
//     const response = await axios.get(`${config.backendUrl}/api/restaurants/location/${encodeURIComponent(restaurantName)}`);
//     const address = response.data.location;
//     console.log(address);
//     // Convert address to coordinates
//     const coordinates = await geocodeAddress(address);
//     console.log(coordinates);
//     return coordinates;
//   } catch (error) {
//     console.error('Error fetching restaurant location:', error.response?.data || error.message);
//     return null;
//   }
// };

// export const CartProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(cartReducer, initialState);

//   useEffect(() => {
//     const fetchLocation = async () => {
//       if (state.firstDishRestaurant) {
//         const location = await fetchRestaurantLocation(state.firstDishRestaurant);
//         if (location) {
//           dispatch({ type: SET_RESTAURANT_LOCATION, payload: location });
//         }
//       }
//     };

//     fetchLocation();
//   }, [state.firstDishRestaurant]);

//   return (
//     <CartContext.Provider value={{ state, dispatch }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);
