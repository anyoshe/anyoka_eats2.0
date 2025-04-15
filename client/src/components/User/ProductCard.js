import React, { useState } from 'react';
import { useCart } from './CartContext';
import config from '../../config';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  // const imageUrl = product.images?.[0] ? `${config.backendUrl}${product.images[0].replace('/var/data', '')}` : '/placeholder.png';
  const imageUrl = product.primaryImage
  ? `${config.backendUrl}${product.primaryImage}`
  : product.images?.[0]
  ? `${config.backendUrl}${product.images[0]}`
  : '/path/to/placeholder-image.jpg';
  const [averageRating, setAverageRating] = useState(product.ratings?.average || 0);
  const [ratingCount, setRatingCount] = useState(product.ratings?.reviews?.length || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        productDetails: product
      }
    });
  };

  const submitRating = async (itemId, itemType, rating) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/rating`, {
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
    submitRating(product._id, 'Product', value);
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
    <li className="product-card">
      <div className="product-image-wrapper">
        <img src={imageUrl} alt={product.name} className='product-image' />
        {product.discountedPrice && (
          <span className="discounted-price-circle">
            Now <br/> Ksh {product.discountedPrice.toFixed(2)}
          </span>
        )}
      </div>

      <h6 className='product-name'>{product.name}</h6>

      {product.discountedPrice ? (
        <span className="original-price-offer">
          Was <span className='diagonal-strikethrough linePrice'>Ksh {product.price.toFixed(2)}</span>
        </span>
      ) : (
        <p className='product-price'>Ksh {product.price.toFixed(2)}</p>
      )}

      <p className='product-brand'>{product.brand}</p>
      <p className='product-category'>{product.category}</p>
      <p className='product-inventory'>Available: {product.inventory}</p>

      <button onClick={handleAddToCart} className='add-to-cart'>Add to Cart</button>

      <div className="rating" onMouseLeave={handleStarMouseLeave}>
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

      <p className='average'>
        Avg Rating: {averageRating?.toFixed(2)}<br />
        ({ratingCount} reviews)
      </p>
    </li>
  );
};

export default ProductCard;
