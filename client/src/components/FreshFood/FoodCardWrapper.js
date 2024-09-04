import React from 'react';
import './FoodCardWrapper.css';
import config from '../../config';

const FoodCardWrapper = ({ food }) => {
    const imageUrl = `${config.backendUrl}${food.imageUrl}`;
    return (
        <li className="food-card">
            {imageUrl && (
        <div className="food-image-wrapper1">
          <img src={imageUrl} alt={food.foodName} className="food-image" />
          {food.discount > 0 && (
            <span className="discounted-price-circle1">
              Now Kes.{(food.discountedPrice).toFixed(2)}
            </span>
          )}
        </div>
      )}
            <h3>{food.foodName}</h3>
            <p>{food.foodDescription}</p>
            <p>Was Kes: {food.foodPrice * 1.2}</p>
            <p>Discount: {food.discount}%</p>
        </li>
    );
};


export default FoodCardWrapper;
