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
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState(product.ratings?.reviews || []);
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
      // Redirect to sign-up page
      setCurrentProduct(product);
      setRedirectPath(location.pathname);
      // navigate('/signup'); // Redirect to sign-up page
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
        fetchReviews(); // Refetch reviews after rating to keep them updated
      } else {
      }
    } catch (error) {
    }
  };

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      setCurrentProduct(product);
      setRedirectPath(location.pathname);
      // navigate('/signup'); // Redirect to sign-up page
      setIsAuthModalOpen(true);

      return;
    }

    // Submit the comment to the backend

    try {
      const response = await fetch(`${config.backendUrl}/api/products/${product._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: user._id, comment }), // Ensure user ID and comment are sent
      });

      const data = await response.json();
      if (response.ok) {
        fetchReviews(); // Refetch reviews after comment submission to keep them synchronized
        setComment(''); // Clear the text input after submitting a comment
      } else {
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
      <div className={styles.modalBody}>
        {/* Left Column - Product Card and Rating */}
        <div className={styles.productSection}>
          <div className={styles.productCard}>
            {/* Render ProductCard with reviews */}
            <ProductCard product={{ ...product, ratings: { ...product.ratings, reviews } }} />
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
          </div>

          <button onClick={() => onAddToCart(product)} className={styles.addToCartButton} aria-label={`Add ${product.name} to cart`}>
            Add to Cart
          </button>
        </div>

        {/* Right Column - Reviews and Comments */}
        <div className={styles.reviewsSection}>
          <h3 className={styles.reviewsTitle}>Customer Reviews</h3>
          <div className={styles.reviewsList}>
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewerName}>{review.user?.name || 'Anonymous'}</span>
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
                    {new Date(review.createdAt).toLocaleDateString()}
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
      </div>
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onRequestClose={() => setIsAuthModalOpen(false)}
      />

    </Modal>
  );
};

export default ProductDetailModal;