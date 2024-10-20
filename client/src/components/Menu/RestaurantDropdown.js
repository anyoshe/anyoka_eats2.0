import React, { useState, useEffect } from 'react';
import DishCard from './DishCard';
import config from '../../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './RestraurantDropdown.css';

const RestaurantDropdown = ({ addToCart, searchQuery }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/api/restaurants`);
        const data = await response.json();
        console.log('API Response:', data);

        if (Array.isArray(data.restaurants)) {
          setRestaurants(data.restaurants);
        } else {
          setRestaurants([]);
          console.error('API did not return an array of restaurants');
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurants([]);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const filtered = restaurants.filter(restaurant =>
      restaurant.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants]);

  const fetchDishesByRestaurant = async (restaurant) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/restaurant-dishes?restaurant=${encodeURIComponent(restaurant)}&sortBy=all`);
      const data = await response.json();
      console.log('Dishes API Response:', data);
      if (Array.isArray(data.dishes)) {
        setDishes(data.dishes);
        setModalVisible(true);
      } else {
        setDishes([]);
        console.error('API did not return an array of dishes');
      }
    } catch (error) {
      console.error('Error fetching dishes by restaurant:', error);
    }
  };

  const handleSelectChange = (e) => {
    const restaurant = e.target.value;
    setSelectedRestaurant(restaurant);
    fetchDishesByRestaurant(restaurant);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRestaurant(''); // Clear the select field
  };

  return (
    <div className='by_reataurant_wrapper'>
      <select value={selectedRestaurant} onChange={handleSelectChange} className='by_reataurant_select'>
        <option value="" disabled>Order by Restaurant</option>
        {filteredRestaurants.map((restaurant) => (
          <option key={restaurant} value={restaurant}>{restaurant}</option>
        ))}
      </select>

      {modalVisible && (
        <div className="modal fade show" id="dishesModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: 'block' }}>

          <div className="modal-dialog modal-lg" id="exampleModalBody">
            <div className="modal-content byModalContent">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">By Restaurant</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
              </div>

              <div className="modal-body" id="dishesModalContent">
                {dishes.map((dish) => (
                  <DishCard key={dish.dishCode} dish={dish} addToCart={addToCart} />
                ))}
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDropdown;
