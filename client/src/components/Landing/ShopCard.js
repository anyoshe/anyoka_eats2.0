import React, { useState } from 'react';
import config from '../../config';
import styles from './ShopCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

const ShopCard = ({ shop }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviews, setShowReviews] = useState(false);

  const images = shop.images?.length
    ? shop.images
    : shop.profileImage
      ? [shop.profileImage]
      : ['/path/to/placeholder.jpg'];

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
    if (imagePath.startsWith('http')) return imagePath;
    const stripServerPath = (fullPath) =>
      fullPath.replace('/mnt/shared/Projects/anyoka_eats2.0/online_hotel', '');
    return `${config.backendUrl}${stripServerPath(imagePath)}`;
  };

  const averageRating = shop.ratings?.average || 0;
  const reviewCount = shop.ratings?.reviews?.length || 0;

  return (
    <div className={styles.shopCard}>
      <div className={styles.shopContentWrapper}>
        {/* Image Carousel */}
        <div className={styles.imageWrapper}>
          <div className={styles.imageCarousel}>
            <button className={styles.prevButton} onClick={handlePrevImage}>
              &#8249;
            </button>
            <img
              src={getImageSrc(images[currentImageIndex])}
              alt={`Shop Image ${currentImageIndex + 1}`}
              className={styles.shopImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/path/to/placeholder.jpg';
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
        </div>

        {/* Details */}
        <div className={styles.shopDetails}>
          <h2 className={styles.shopName}>{shop.businessName}</h2>
          <p><strong>Town:</strong> {shop.town}</p>
          <p><strong>Address:</strong> {shop.address}</p>
          <p><strong>Email:</strong> {shop.email}</p>
          <p><strong>Phone:</strong> {shop.phoneNumber}</p>

          {/* Ratings */}
          <div className={styles.rating}>
            Rating:{' '}
            {[...Array(5)].map((_, index) => (
              <FontAwesomeIcon
                key={index}
                icon={index < Math.round(averageRating) ? solidStar : regularStar}
                className={styles.starIcon}
              />
            ))}
          </div>

          <p className={styles.average}>
            Average Rating: {averageRating.toFixed(1)} ({reviewCount} reviews)
          </p>

          <button
            onClick={() => setShowReviews(!showReviews)}
            className={styles.toggleReviewsButton}
          >
            {showReviews ? 'Hide Reviews' : 'Show Reviews'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      {showReviews && (
        <div className={styles.reviewsSection}>
          <h4>Customer Reviews</h4>
          {shop.ratings?.reviews?.length > 0 ? (
            <ul className={styles.reviewsList}>
              {shop.ratings.reviews.map((review, index) => (
                <li key={index} className={styles.reviewItem}>
                  <strong>{review.user?.username || 'Anonymous'}</strong>
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
    </div>
  );
};

export default ShopCard;
