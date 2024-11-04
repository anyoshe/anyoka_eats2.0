import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FoodCard from './FoodCard';
import './LandingFreshFood.css';
import config from '../../config';
import FoodCart from './FoodCart';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import FooterComponent from '../Landing/LandingFooter';
import NavBar from '../Header/navbar';

const LandingFreshFood = () => {
  const [foods, setFoods] = useState([]);
  const [groupedFoods, setGroupedFoods] = useState({});
  const [discountedFoods, setDiscountedFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All'); // New state for active category

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/foods`);
        const fetchedFoods = response.data;

        const grouped = fetchedFoods.reduce((acc, food) => {
          if (!acc[food.foodCategory]) {
            acc[food.foodCategory] = [];
          }
          acc[food.foodCategory].push(food);
          return acc;
        }, {});

        setFoods(fetchedFoods);
        setGroupedFoods(grouped);
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };

    const fetchDiscountedFoods = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/discounts?discount_gt=1`);
        setDiscountedFoods(response.data);
      } catch (error) {
        console.error('Error fetching discounted foods:', error);
      }
    };

    fetchFoods();
    fetchDiscountedFoods();
  }, []);

  // Use useEffect to scroll after loading the discounted foods
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#special-offers' && discountedFoods.length > 0) {
      const element = document.getElementById('special-offers');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [discountedFoods]);

  // Handler to update active category
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  // Filtered foods based on active category
  const filteredFoods = activeCategory === 'All'
    ? foods
    : foods.filter(food => food.foodCategory === activeCategory);

  return (
    <div className="landing-fresh-food">
      <div className='fresh_nav_position'>
        <header className='landing-fresh-foods-header'>
          <a href="/" className="homeLink">
            <FontAwesomeIcon icon={faHome} className="homeIcon" />
          </a>

          <div className="fresh_bar">
            <input type="text" placeholder="Search..." className="fresh_bar_input" />
            <i class="fas fa-magnifying-glass fresh_glass"></i>
          </div>

          <FoodCart />
        </header>
      </div>

      <section className="main-category">
        <div className="fresh-list">

          <h2 className='fresh_page_heading'>Product Categories</h2>

          <ul className="fresh_category">
            <li className={`fresh_link ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => handleCategoryClick('All')}>All</li>
            <li className={`fresh_link ${activeCategory === 'Fruits and Vegetables' ? 'active' : ''}`} onClick={() => handleCategoryClick('Fruits and Vegetables')}>Fruits & Vegetables</li>
            <li className={`fresh_link ${activeCategory === 'Grains and Cereals' ? 'active' : ''}`} onClick={() => handleCategoryClick('Grains and Cereals')}>Grains & Cereals</li>
            <li className={`fresh_link ${activeCategory === 'Spices' ? 'active' : ''}`} onClick={() => handleCategoryClick('Spices')}>Spices</li>
            <li className={`fresh_link ${activeCategory === 'Tubers and Roots' ? 'active' : ''}`} onClick={() => handleCategoryClick('Tubers and Roots')}>Tubers & Roots</li>
            <li className={`fresh_link ${activeCategory === 'Meat and Poultry' ? 'active' : ''}`} onClick={() => handleCategoryClick('Meat and Poultry')}>Meat & Poultry</li>
            <li className={`fresh_link ${activeCategory === 'Dairy and Eggs' ? 'active' : ''}`} onClick={() => handleCategoryClick('Dairy and Eggs')}>Dairy & Eggs</li>
            <li className={`fresh_link ${activeCategory === 'Sea Foods and Fish' ? 'active' : ''}`} onClick={() => handleCategoryClick('Sea Foods and Fish')}>Sea Foods & Fish</li>
          </ul>
        </div>

        <h2 className='discoverTitle'>Discover Our Selection</h2>
        
        <div className="category-grid">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))
          ) : (
            <p>Sorry!No foods available in this category. Foods will be available in a week's time</p>
          )}
        </div>
      </section>

      <section id="special-offers" className="fresh-page-offers-section">
        <h2 className="fresh-page-offers-title">Special Offers & Discounts</h2>
        <div className="offer-page-grid">
          {discountedFoods.length > 0 ? (
            discountedFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))
          ) : (
            <p>No special offers available at the moment.</p>
          )}
        </div>
      </section>

      <section className="wholesale">
        <h2 className='fresh-wholesale-title'>Wholesale & Bulk Orders</h2>
        <p className='fresh-wholesale-para'>Looking for bulk purchases? Contact us for exclusive wholesale prices and offers.</p>
        <a href="/QuoteForm" className="wholesale-cta-button">Get a Quote</a>
      </section>

      <FooterComponent />
    </div>
  );
};

export default LandingFreshFood;
