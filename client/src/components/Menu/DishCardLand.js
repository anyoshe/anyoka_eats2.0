import React, { useState } from 'react';
// import { useCart } from './CartContext';
import config from '../../config';
import './DishCard.css';
import { useNavigate } from 'react-router-dom';

const DishCardLand = ({ dish, source }) => {
  const imageUrl = `${config.backendUrl}${dish.imageUrl}`;
  const [averageRating, setAverageRating] = useState(dish.averageRating);
  const [ratingCount, setRatingCount] = useState(dish.ratingCount);
  const [hoverRating, setHoverRating] = useState(0);

  // const { dispatch } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    // dispatch({
    //   type: 'ADD_TO_CART',
    //   payload: {
    //     dishDetails: dish
    //   }
    // });

    // Navigate based on the source prop
    if (source === 'featured') {
      navigate('/featured', { state: { view: 'topRated' } });
    } else if (source === 'offers') {
      navigate('/offers', { state: { view: 'discounted' } });
    } else {
      navigate('/menu'); // Fallback to the main menu
    }
  };
  
  const submitRating = async (itemId, itemType, rating) => {
    try {
      console.log('Submitting rating:', { item_id: itemId, item_type: itemType, rating });
      const response = await fetch(`${config.backendUrl}/api/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id: itemId, item_type: itemType, rating }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the average rating and rating count
        setAverageRating(data.newAverageRating);
        setRatingCount(data.newRatingCount);
      } else {
        // Handle errors
        console.error('Failed to submit rating:', data.message);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleStarClick = (value) => {
    submitRating(dish._id, 'Dish', value);
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
          <img src={imageUrl} alt={dish.dishName} className='dish-image' />
          {dish.discount > 0 && (
            <span className="discounted-price-circle">
              Now <br/> Ksh {(dish.discountedPrice)}
            </span>
          )}
        </div>
      )}
  
      <h6 className='dishName'>{dish.dishName}</h6>
  
      {dish.discount > 0 ? (
        <span className="original-price-offer">
          Was <span className='diagonal-strikethrough linePrice'>Ksh {(dish.dishPrice * 1).toFixed(2)}</span>
        </span>
      ) : (
        <p className='dishPrice dishContent'>
          Ksh {(dish.dishPrice * 1).toFixed(2)}
        </p>
      )}
  
      <p className='dishRestaurant dishcontent'>{dish.restaurant || 'Unknown Restaurant'}</p>
  
      <button onClick={handleAddToCart} className='dishAddToCart dishcontent'>Order</button>
  
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
  
      <p className='average dishcontent'>
        Average Rating : {averageRating?.toFixed(2)}
        <br /> ({ratingCount} user)
      </p>
    </li>
  );
};

export default DishCardLand;
