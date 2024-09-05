import React, { useState, useEffect } from 'react';
import config from '../../config';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        // Set the initial rating to the average rating from props
        setRating(restaurant.averageRating);
      }, [restaurant.averageRating]);

    const handleStarClick = async (star) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_id: restaurant._id,
                    item_type: 'Restaurant',
                    rating: star,
                })
            });

            if (response.ok) {
                const result = await response.json();
                setRating(result.newRating);
            } else {
                console.error('Failed to submit rating:', await response.json());
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    const handleStarMouseEnter = (star) => {
        setHoverRating(star);
    };

    const handleStarMouseLeave = () => {
        setHoverRating(0);
    };

    const getStarClass = (star) => {
        if (star <= rating) return 'star filled';
        if (star <= hoverRating) return 'star hovered';
        return 'star';
    };


    return (
        <li className="restaurant-card">
            <h6 className='restaurantHeading dishCommon'>{restaurant.restaurant}</h6>
            <p className='restaurantCategory dishCommon'>Best In : {restaurant.dishCategory}</p>
            <div className="ratingDiv dishCommon" >
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={getStarClass(star)}
                        data-value={star}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarMouseEnter(star)}
                        onMouseLeave={handleStarMouseLeave}
                    >
                        &#9733;
                    </span>
                ))}
            </div>
            <p  className='restaurantAverage dishCommon'>Average Rating: {restaurant.averageRating.toFixed(2)} ({restaurant.ratingCount} ratings)</p>
        </li>
    );
};

export default RestaurantCard;