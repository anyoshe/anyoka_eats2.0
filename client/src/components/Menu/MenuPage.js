import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import MainSearchBar from './MainSearchBar';
import CategoryDropdown from './CategoryDropdown';
import RestaurantDropdown from './RestaurantDropdown';

import './MenuPage.css';
import DishCategories from './DishCategories';



import { useCart } from './CartContext';
import Cart from './Cart';

const MenuPage = ({addToCart}) => {
  const { state, dispatch } = useCart();

  const handleCartClick = (e) => {
    e.preventDefault();
    dispatch({ type: 'TOGGLE_CART_VISIBILITY' });
};

return (
    <div className="NavBarContainer">
      {/* back and cart */}
      <div id="navline">
        <a href="/" className='homeLink'><FontAwesomeIcon icon={faHome}  className='homeIcon'/></a>
        {<MainSearchBar addToCart={addToCart}  />}
        <Cart />
      </div>

      <div className="menu-container">
        <DishCategories />
      </div>
    </div>
  );
};

export default MenuPage;