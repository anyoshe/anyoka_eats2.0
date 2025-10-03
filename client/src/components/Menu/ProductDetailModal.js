import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import config from '../../config';
import ProductCard from '../User/ProductCard';
import styles from './ProductDetailModal.module.css';
import AuthPromptModal from '../User/AuthPromptModal';
import { useLocation } from 'react-router-dom';


Modal.setAppElement('#root'); // For accessibility

const ProductDetailModal = ({ isOpen, onRequestClose, product, onAddToCart }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(product.ratings?.average || 0);
  const [averageRating, setAverageRating] = useState(product.ratings?.average || 0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState(product.ratings?.reviews || []);
  const [step, setStep] = useState(0); // 0 = Product, 1 = Reviews
  const { isLoggedIn, setRedirectPath, setCurrentProduct, user } = useContext(AuthContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  // Fetch comments and reviews when the modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen]);


  // Fetch the product's ratings and reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/products/${product._id}/reviews`); // Presumed endpoint for fetching reviews
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
      } else {
      }
    } catch (error) {
    }
  };

  const handleStarClick = async (rating) => {
  if (!isLoggedIn) {
    setCurrentProduct(product);
    setRedirectPath(`${location.pathname}${location.search}`);
    setIsAuthModalOpen(true);
    return;
  }

    setSelectedRating(rating);
    try {
      const response = await fetch(`${config.backendUrl}/api/products/${product._id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: user._id, rating }), // Ensure user ID and rating are sent
      });
      const data = await response.json();
      if (response.ok) {
        // Backend returns { averageRating }
        setAverageRating(data.averageRating ?? averageRating);
        fetchReviews();
      } else {
      }
    } catch (error) {
    }
  };

  const handleAddComment = async () => {
    if (!isLoggedIn) {
    setCurrentProduct(product);
    setRedirectPath(`${location.pathname}${location.search}`);
    setIsAuthModalOpen(true);
    return;
  }

    // Submit the comment to the backend

    try {
      // If a star rating is selected, submit both rating and comment to the /rate endpoint
      if (selectedRating) {
        const rateRes = await fetch(`${config.backendUrl}/api/products/${product._id}/rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: user._id, rating: selectedRating, comment }),
        });
        const rateData = await rateRes.json();
        if (rateRes.ok) {
          setAverageRating(rateData.averageRating ?? averageRating);
          fetchReviews();
          setComment('');
        }
      } else {
        // Otherwise, submit comment-only to /comments
        const response = await fetch(`${config.backendUrl}/api/products/${product._id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: user._id, comment }),
        });
        const data = await response.json();
        if (response.ok) {
          fetchReviews();
          setComment('');
        }
      }
    } catch (error) {
    }
  };

  return (
    <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Product Details"
    className={styles['product-detail-modal']}
    overlayClassName={styles['product-detail-modal-overlay']}
    shouldCloseOnOverlayClick={true}
    ariaHideApp={true}
    >
    {/* <div className="modal-content"> */}
    <div className={styles.modalContentWrapper}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Product Details</h2>
        <button className={styles.closeButton} aria-label="Close product details" onClick={onRequestClose}>
          &times;
        </button>
      </div>
      <div className={`${styles.modalBody} ${styles.carouselBody}`}>
        <div className={styles.stepIndicator}>
          <span className={`${styles.stepDot} ${step === 0 ? styles.active : ''}`} onClick={() => setStep(0)}></span>
          <span className={`${styles.stepDot} ${step === 1 ? styles.active : ''}`} onClick={() => setStep(1)}></span>
        </div>

        <div className={`${styles.stepContent} ${step === 0 ? styles.active : ''}`}>
          {/* Product Page */}
          <div className={styles.productSection}>
            <div className={styles.productCard}>
              <ProductCard product={{ ...product, ratings: { ...product.ratings,  average: averageRating, reviews } }} />
            </div>

            <div className={styles.rateSection}>
              <h4 className={styles.rateTitle}>Rate this product</h4>
            <div className={styles.rateStars} role="radiogroup" aria-label="Rate this product">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                  icon={star <= (hoverRating || selectedRating) ? solidStar : regularStar}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleStarClick(star)}
                    className={`${styles.star} ${star <= (hoverRating || selectedRating) ? styles.filled : ''}`}
                  />
                ))}
              </div>
            <div className={styles.averageInline}>Average: {Number(averageRating).toFixed(2)}</div>
            </div>

            <button onClick={() => onAddToCart(product)} className={styles.addToCartButton} aria-label={`Add ${product.name} to cart`}>
              Add to Cart
            </button>
          </div>
        </div>

        <div className={`${styles.stepContent} ${step === 1 ? styles.active : ''}`}>
          {/* Reviews Page */}
          <div className={styles.reviewsSection}>
            <h3 className={styles.reviewsTitle}>Customer Reviews</h3>
            <div className={styles.reviewsList}>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewerName}>{review.user?.username || review.user?.names || 'Anonymous'}</span>
                      <div className={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesomeIcon
                            key={star}
                            icon={star <= (review.rating || 0) ? solidStar : regularStar}
                            className={`${styles.star} ${star <= (review.rating || 0) ? styles.filled : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className={styles.reviewComment}>{review.comment}</p>
                    )}
                  <span className={styles.reviewDate}>
                    {new Date(review.date || review.createdAt || review.updatedAt).toLocaleDateString()}
                  </span>
                  </div>
                ))
              ) : (
                <p className={styles.noReviews}>No reviews yet. Be the first to review!</p>
              )}
            </div>
            <div className={styles.commentSection}>
              <label htmlFor="commentBox" className={styles.commentLabel}>Leave a comment</label>
              <textarea
                id="commentBox"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className={styles.commentBox}
              />
              <button onClick={handleAddComment} className={styles.submitComment}>
                Submit Comment
              </button>
            </div>
          </div>
        </div>

        <div className={styles.stepNavigation}>
          <button className={styles.stepButton} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</button>
          <span className={styles.stepCounter}>{step + 1} / 2</span>
          <button className={`${styles.stepButton} ${styles.primary}`} onClick={() => setStep((s) => Math.min(1, s + 1))} disabled={step === 1}>Next</button>
        </div>
      </div>
      </div>
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onRequestClose={() => setIsAuthModalOpen(false)}
      />

    </Modal>
  );
};

export default ProductDetailModal;