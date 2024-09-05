import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DishCard from './DishCard'; 
import config from '../../config';
import RestaurantCard from './RestaurantCard.js';
import './DishCategories.css';


const DishCategories = () => {
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [topRatedHotels, setTopRatedHotels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/dishes-and-restaurants`); 
        console.log('Dishes response:', response.data); 

        const dishes = response.data.dishes || [];
        const restaurants = response.data.restaurants || [];

        setDishes(dishes); 
        setRestaurants(restaurants);

        const topRated = [...restaurants].sort((a, b) => b.averageRating - a.averageRating).slice(0, 4);
        setTopRatedHotels(topRated);

      
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };
      
    fetchData();
    }, []);

    const getTopRatedDishes = () => {
      return [...dishes].sort((a, b) => b.averageRating - a.averageRating).slice(0, 4);
    };


    const getPopularDishes = () => {
      return [...dishes].sort((a, b) => b.averageRating - a.averageRating).slice(0, 12);
    };

    const getPopularRestaurants = () => {
      return [...restaurants].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3);
    };

  return (
    <div id="dish-categories">
      
      <div className='popularDishDiv menuDivs'>
        <h5 className='menuHeader'>Popular Dishes</h5>
        <ul id="popular-dishes" className="dish-list">
          {getPopularDishes().map(dish => (
            <DishCard key={dish.dishCode} dish={dish} addToCart={() => {}} />
          ))}
        </ul>
      </div>
        
      <div className='popularHotelDiv menuDivs'>
        <h5 className='restaurantHeader'>Popular Restaurants</h5>
        <ul id="popular-restaurants" className="restaurant-list">
          {getPopularRestaurants().map(restaurant => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </ul>
      </div> 
    </div>
  );
};

export default DishCategories;
