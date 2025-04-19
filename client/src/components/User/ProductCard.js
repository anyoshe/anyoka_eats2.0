import React, { useState } from 'react';
import config from '../../config';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.primaryImage
    ? [product.primaryImage, ...(product.images || [])]
    : product.images || [];

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  const getImageSrc = (imagePath) => {
    const stripServerPath = (fullPath) =>
      fullPath.replace('/mnt/shared/Projects/anyoka_eats2.0/online_hotel', '');
    return `${config.backendUrl}${stripServerPath(imagePath)}`;
  };

  return (
    <li className="product-card">
      <div className="product-image-wrapper">
        {/* Display images in a carousel */}
        {images.length > 0 ? (
          <div className="image-carousel">
            <button className="prev-button" onClick={handlePrevImage}>
              &#8249;
            </button>
            <img
              src={getImageSrc(images[currentImageIndex])}
              alt={`Product Image ${currentImageIndex + 1}`}
              className="product-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/path/to/placeholder-image.jpg'; // Fallback image
              }}
            />
            <button className="next-button" onClick={handleNextImage}>
              &#8250;
            </button>
            {/* Dots for navigation */}
            <div className="carousel-dots">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                ></span>
              ))}
            </div>
          </div>
        ) : (
          <img
            src="/path/to/placeholder-image.jpg"
            alt="Placeholder"
            className="product-image"
          />
        )}
        {product.discountedPrice && (
          <span className="discounted-price-circle">
            Now <br /> Ksh {product.discountedPrice.toFixed(2)}
          </span>
        )}
      </div>

      <h6 className="product-name">Product Name: {product.name}</h6>

      {product.discountedPrice ? (
        <span className="original-price-offer">
         Price:  Was{' '}
          <span className="diagonal-strikethrough linePrice">
            Ksh {product.price.toFixed(2)}
          </span>
        </span>
      ) : (
        <p className="product-price">Price: Ksh {product.price.toFixed(2)}</p>
      )}

      <p className="product-brand">Brand: {product.brand}</p>
      <p className="product-category">Category: {product.category}</p>
      <p className="product-inventory">Available: {product.inventory}</p>

      <div className="rating"> Ratings:
        {[...Array(5)].map((_, index) => {
          const star = index + 1;
          return (
            
            <span
              key={star}
              className={star <= product.ratings?.average ? 'star filled' : 'star'}
            >
              &#9733;
            </span>
          );
        })}
      </div>

      <p className="average">
        Avg Rating: {product.ratings?.average?.toFixed(2) || 0}
        <br />
        ({product.ratings?.reviews?.length || 0} reviews)
      </p>
    </li>
  );
};

export default ProductCard;