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
  const availableDishes = dishes;
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
  const availableDiscountedDishes = discountedDishes; // or fetch them using a function if needed

  const getTopRatedDishes = () => {
    return [...dishes].sort((a, b) => b.averageRating - a.averageRating).slice(0, 12);
  };
  const topRatedDishes = getTopRatedDishes(); // Fetch the top-rated dishes

  const getPopularDishes = () => {
    return [...dishes].sort((a, b) => b.averageRating - a.averageRating).slice(0, 12);
  };
    const popularDishes = getPopularDishes(); 

  const getPopularRestaurants = () => {
    return [...restaurants].sort((a, b) => b.averageRating - a.averageRating).slice(0, 4);
  };

  return (
    <div id="dish-categories">
      <section className='dishesSection'>
        {/* Buttons for category selection */}
        <div className="category-buttons">
          <button onClick={() => setView('all')} className='switchButtons'>All</button>

          <button onClick={() => setView('popular')} className='switchButtons'>Popular</button>

          <button onClick={() => setView('discounted')} className='switchButtons'>Offers</button>

          <button onClick={() => setView('topRated')} className='switchButtons'>Featured</button>
        </div>

        <div className="dishes-to-display">
        {/* Conditionally render sections based on selected view */}
        {view === 'popular' && (
          <div className='popularDishDiv menuDivs'>
            <h5 className='menuHeader'>Popular Dishes</h5>
            <ul id="popular-dishes" className="dish-list">
              {/* {getPopularDishes().map(dish => (
                <DishCard key={dish.dishCode} dish={dish} addToCart={() => {}} />
              ))} */}
              
                {popularDishes.length > 0 ? (
                  popularDishes.map(dish => (
                    <DishCard key={dish.dishCode} dish={dish} addToCart={() => { }} />
                  ))
                ) : (
                  <p>No popular dishes available at the moment. Please check back later.</p>
                )}
            </ul>
          </div>
        )}

            {view === 'all' && (
              <div className='allDishDiv menuDivs'>
                <h5 className='menuHeader'>All Dishes</h5>
                
                <ul id="all-dishes" className="dish-list">
                {availableDishes.length > 0 ? (
                  availableDishes.map(dish => (
                    <DishCard key={dish.dishCode} dish={dish} addToCart={() => { }} />
                  ))
                ) : (
                  <p>Dishes Loading Please Wait...</p>
                )}
                </ul>
              </div>
            )}

        {view === 'discounted' && (
          <div className='discountedDishDiv menuDivs'>
            <h5 className='menuHeader'>Discounted and Offers</h5>
            <ul id="discounted-dishes" className="dish-list">
              {/* {discountedDishes.map(dish => (
                <DishCard key={dish.dishCode} dish={dish} addToCart={() => {}} />
              ))} */}


                {availableDiscountedDishes.length > 0 ? (
                  availableDiscountedDishes.map(dish => (
                    <DishCard key={dish.dishCode} dish={dish} addToCart={() => { }} />
                  ))
                ) : (
                  <p>No discounted dishes available at the moment. Please check back later.</p>
                )}

            </ul>
          </div>
        )}
          {view === 'topRated' && (
            <div className='discountedDishDiv menuDivs'>
              <h5 className='menuHeader'>Featured Dishes</h5>
              <ul id="topRated-dishes" className="dish-list">
                {getTopRatedDishes().map(dish => (
                  <DishCard key={dish.dishCode} dish={dish} addToCart={() => {}} />
                ))}
                

                {topRatedDishes.length > 0 ? (
                  topRatedDishes.map(dish => (
                    <DishCard key={dish.dishCode} dish={dish} addToCart={() => { }} />
                  ))
                ) : (
                  <p>No top-rated dishes available at the moment. Please check back later.</p>
                )}

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
