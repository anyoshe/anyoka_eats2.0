import React, { useState } from 'react';
import config from '../../config';
import styles from './ProductCard.module.css';
// import styles from './Menu/ProductDetailModal.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviews, setShowReviews] = useState(false); // Toggle for reviews section

  const images = product.primaryImage
    ? [product.primaryImage, ...(product.images || [])]
    : product.images || ['/path/to/placeholder-image.jpg'];

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
    <div className={styles.productCard}>
      <div className={styles.productContentWrapper}>
        {/* Image Section */}
        <div className={styles.productImageWrapper}>
          {images.length > 0 ? (
            <div className={styles.imageCarousel}>
              <button className={styles.prevButton} onClick={handlePrevImage}>
                &#8249;
              </button>
              <img
                src={getImageSrc(images[currentImageIndex])}
                alt={`Product Image ${currentImageIndex + 1}`}
                className={styles.productImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/path/to/placeholder-image.jpg';
                }}
              />
              <button className={styles.nextButton} onClick={handleNextImage}>
                &#8250;
              </button>
              <div className={styles.carouselDots}>
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
              className={styles.productImage}
            />
          )}
          {product.discountedPrice && (
            <span className={styles.discountedPriceCircle}>
              Now <br /> Ksh {product.discountedPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Details Section */}
        <div className={styles.productDetails}>
          <h6 className={styles.productName}>Name : {product.name}</h6>

          {product.discountedPrice ? (
            <span className={styles.originalPriceOffer}>
              Price : Was{' '}
              <span className={styles.diagonalStrikethroughLinePrice}>Ksh {product.price.toFixed(2)}</span>
            </span>
          ) : (
            <p className={styles.productPrice}>Price: Ksh {product.price.toFixed(2)}</p>
          )}
          <p className={styles.productBrand}>Brand : {product.brand}</p>
          <p className={styles.productCategory}>Category : {product.category}</p>
          <p className={styles.productInventory}>Seller : {product.shop.shopName}</p>
          <p className={styles.productInventory}>Town : {product.shop.town}</p>
          <p className={styles.productInventory}>Available : {product.inventory}</p>

          <div className={styles.rating}>
            Ratings : 
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
          
          <p className={styles.average}>
            Average Rating: {product.ratings?.average?.toFixed(2) || 0}
            <br />
            ({product.ratings?.reviews?.length || 0} reviews)
          </p>
          <button
            onClick={() => setShowReviews(!showReviews)}
            className={styles.toggleReviewsButton}
          >
            {showReviews ? 'Hide Reviews' : 'Show Reviews'}
          </button>
        </div>
      </div>

      {showReviews && (
        <div className={styles.reviewsSection}>
          <h4>Customer Reviews</h4>
          {product.ratings?.reviews?.length > 0 ? (
            <ul className={styles.reviewsList}>
              {product.ratings.reviews.map((review, index) => (
                <li key={index} className={styles.reviewItem}>
                  <strong>{review.user?.username || 'Unknown User'}</strong>
                  {review.rating && (
                    <p>
                      Rating:{' '}
                      {[...Array(review.rating)].map((_, i) => (
                        <FontAwesomeIcon key={i} icon={solidStar} className={styles.starIcon} />
                      ))}
                    </p>
                  )}
                  {review.comment && <p>Comment: {review.comment}</p>}
                  <small>Date: {review.date ? new Date(review.date).toLocaleDateString() : '-'}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      )}
    {/* <hr /> */}
  </div>
  );
};

export default ProductCard;

