import React, { useState } from 'react';
import { useFreshFoodCart } from './FreshFoodCartContext';
import config from '../../config';
import './FoodCard.css';
import { useNavigate } from 'react-router-dom';

const FoodCardLand = ({ food }) => {

  const imageUrl = `${config.backendUrl}${food.imageUrl}`;
  const [averageRating, setAverageRating] = useState(food.averageRating);
  const [ratingCount, setRatingCount] = useState(food.ratingCount);
  const [hoverRating, setHoverRating] = useState(0);

  const { dispatch } = useFreshFoodCart();
  const navigate = useNavigate(); // Create navigate instance for redirection

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        foodDetails: food,
      },
    });
     // Redirect to discounted food page
     navigate('/discounts#special-offers'); // Adjust the route based on your app's routing structure
  };

  const submitRating = async (itemId, itemType, rating) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/foodRating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id: itemId, item_type: itemType, rating }),
      });

      const data = await response.json();

      if (response.ok) {
        setAverageRating(data.newAverageRating);
        setRatingCount(data.newRatingCount);
      } else {
        console.error('Failed to submit rating:', data.message);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleStarClick = (value) => {
    submitRating(food._id, 'Food', value);
  };

  const handleStarMouseEnter = (value) => {
    setHoverRating(value);
  };

  const handleStarMouseLeave = () => {
    setHoverRating(0);
  };

  const getStarClass = (star) => {
    if (star <= hoverRating) return 'star filled';
    if (star <= averageRating) return 'star filled';
    return 'star';
  };

  return (
    <li className="dish-card">
      {imageUrl && (
        <div className="dish-image-wrapper">

          <img src={imageUrl} alt={food.foodName} className="food-image" />

          {food.discount > 0 && (
            <span className="discounted-price-circle">
              Now <br/>Ksh{(food.discountedPrice).toFixed(2)}
            </span>
          )}
          
        </div>
      )}
  
      <h6 className="dishName">{food.foodName}</h6>
  
      {food.discount > 0 ? (
        <div>
          <span className="fresh_original">
            Was <span className='fresh-original-strikethrough'> Kes.{(food.foodPrice * 1).toFixed(2)}</span>
          </span>
        </div>
      ) : (
        <h6 className="dishPrice dishcontent">Kes.{(food.foodPrice * 1).toFixed(2)}</h6>
      )}
  
      <p className="dishRestaurant dishcontent">{food.vendor || 'Unknown Vendor'}</p>
  
      <button onClick={handleAddToCart} className="dishAddToCart dishcontent">Order</button>
  
      <div className="rating dishcontent" onMouseLeave={handleStarMouseLeave}>
        {[...Array(5)].map((_, index) => {
          const star = index + 1;
          return (
            <span
              key={star}
              className={getStarClass(star)}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarMouseEnter(star)}
            >
              &#9733;
            </span>
          );
        })}
      </div>
  
      <p className="average dishcontent">
        Average Rating: {averageRating?.toFixed(2)} <br />({ratingCount} ratings)
      </p>
    </li>
  );
};

export default FoodCardLand;

