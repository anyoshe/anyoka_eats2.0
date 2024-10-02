import React, { useState, useEffect } from 'react';
import DishCard from './DishCard';
import config from '../../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './CategoryDropdown.css';

const CategoryDropdown = ({ addToCart, searchQuery }) => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [dishesByRestaurant, setDishesByRestaurant] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/api/categories`);
        const data = await response.json();
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories([]);
          console.error('API did not return an array of categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const fetchDishesByCategory = async (category) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/category-dishes?category=${encodeURIComponent(category)}`);
      const data = await response.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setDishesByRestaurant(data);
        setModalVisible(true);
      } else {
        console.error('Expected an object but got:', data);
        setDishesByRestaurant({});
      }
    } catch (error) {
      console.error('Error fetching dishes by category:', error);
      setDishesByRestaurant({});
    }
  };

  const handleSelectChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    fetchDishesByCategory(category);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCategory('');
  };

  return (
    <div>
      <select value={selectedCategory} onChange={handleSelectChange} className='by_reataurant_select'>
        <option value="" disabled>Order by Dish Type</option>
        {filteredCategories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      {modalVisible && (
        <div className="modal fade show" id="dishModal" tabIndex="-1" aria-labelledby="dishModalLabel" aria-hidden="true" style={{ display: 'block' }}>

          <div className="modal-dialog modal-lg">

            <div className="modal-content byModalContent">

              <div className="modal-header">
                <h5 className="modal-title" id="dishModalLabel">By Cuisine</h5>

                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseModal}></button>

              </div>

              <div className="modal-body">
                {Object.keys(dishesByRestaurant).length > 0 ? (
                  Object.keys(dishesByRestaurant).map((restaurant) => (

                    <div key={restaurant} className="restaurant-section">

                      <h2 className="restaurant-heading">{restaurant}</h2>

                      <div className="dishes-container">
                        {dishesByRestaurant[restaurant].map((dish) => (
                          <DishCard key={dish.dishCode} dish={dish} addToCart={addToCart} className="drop_dishes" />
                        ))}
                      </div>
                    </div>

                  ))
                ) : (
                  <p>No dishes available for this category.</p>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
