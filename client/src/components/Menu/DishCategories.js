import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DishCard from './DishCard'; 
import config from '../../config';
import RestaurantCard from './RestaurantCard.js';
import './DishCategories.css';
import { useLocation } from 'react-router-dom';


const DishCategories = () => {
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [topRatedHotels, setTopRatedHotels] = useState([]);
  const [discountedDishes, setDiscountedDishes] = useState([]);

  const location = useLocation();
  const [view, setView] = useState('all'); 
  useEffect(() => {
    // Check if the location state has a view
    if (location.state && location.state.view) {
      setView(location.state.view);
    }
  }, [location.state]); 

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

  // Fetch discounted dishes when the view changes to 'discounted'
  useEffect(() => {
    if (view === 'discounted') {
      const fetchDiscountedDishes = async () => {
        try {
          const response = await axios.get(`${config.backendUrl}/api/discounted-dishes`);
          setDiscountedDishes(response.data.dishes || []);
        } catch (error) {
          console.error('Error fetching discounted dishes:', error);
        }
      };
      fetchDiscountedDishes();
    }
  }, [view]);

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
      <section className='dishesSection'>

        <div className="category-buttons-div">
          <button onClick={() => setView('all')} className='menu-category-buttons'>All</button>
          <button onClick={() => setView('popular')} className='menu-category-buttons'>Popular</button>
          <button onClick={() => setView('discounted')} className='menu-category-buttons'>Offers</button>
        </div>
        
        <div className="dishes-to-display">
          {view === 'popular' && (
            <div className='popularDishDiv menuDivs'>
              <h5 className='menuHeader'>Popular Dishes</h5>
              <ul id="popular-dishes" className="dish-list">
                {getPopularDishes().map(dish => (
                  <DishCard key={dish.dishCode} dish={dish} addToCart={() => {}} />
                ))}
              </ul>
            </div>
          )}

          {view === 'all' && (
            <div className='allDishDiv menuDivs'>
              <h5 className='menuHeader'>All Dishes</h5>
              <ul id="all-dishes" className="dish-list">
                {dishes.map(dish => (
                  <DishCard key={dish.dishCode} dish={dish} addToCart={() => {}} />
                ))}
              </ul>
            </div>
          )}

          {view === 'discounted' && (
            <div className='discountedDishDiv menuDivs'>
              <h5 className='menuHeader'>On Offers Dishes</h5>
              <ul id="discounted-dishes" className="dish-list">
                {discountedDishes.map(dish => (
                  <DishCard key={dish.dishCode} dish={dish} addToCart={() => {}} />
                ))}
              </ul>
            </div>
          )}

        </div>
      </section>

      <section className="restaurantSection">
        <div className='popularHotelDiv menuDivs'>
          <h5 className='restaurantHeader'>Popular Restaurants</h5>
          <ul id="popular-restaurants" className="restaurant-list">
            {getPopularRestaurants().map(restaurant => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </ul>
        </div>
      </section>

    </div>
  );
};

export default DishCategories;
