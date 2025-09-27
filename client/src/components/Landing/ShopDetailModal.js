import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import { AuthContext } from '../../contexts/AuthContext';
import config from '../../config';
import styles from './ShopDetailModal.module.css';
import { useLocation } from 'react-router-dom';
import AuthPromptModal from '../User/AuthPromptModal';
import ShopCard from './ShopCard';

Modal.setAppElement('#root'); // For accessibility

const ShopDetailModal = ({ isOpen, onRequestClose, store }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(store.ratings?.average || 0);
  const [comment, setComment] = useState('');
  const { isLoggedIn, user, setCurrentStore, setRedirectPath } = useContext(AuthContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      // Fetch store reviews or ratings if needed
    }
  }, [isOpen]);

 

useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${config.backendUrl}/api/partners/${store._id}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
    }
  };

  if (store?._id) {
    fetchReviews();
  }
}, [store]);

  // Handle rating submission
  const handleStarClick = async (rating) => {
    if (!isLoggedIn) {
      // If not logged in, show the AuthPromptModal
      setCurrentStore(store);
      setRedirectPath(location.pathname);  // Store the current path to redirect after login/signup
      setIsAuthModalOpen(true); // Open the authentication prompt
      return;
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      alert('Please select a valid rating between 1 and 5 stars.');
      return;
    }

    setSelectedRating(rating);
    setIsSubmittingRating(true);
    try {
      const response = await fetch(`${config.backendUrl}/api/partners/${store._id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: user._id, rating }), // Ensure user ID and rating are sent
      });
      const data = await response.json();
      if (response.ok) {
        // Handle rating success (maybe show confirmation, etc.)
        // Refresh reviews to show the new rating
        const refreshResponse = await fetch(`${config.backendUrl}/api/partners/${store._id}/reviews`);
        const refreshData = await refreshResponse.json();
        setReviews(refreshData.reviews || []);
      } else {
        // Show user-friendly error message
        alert(`Failed to submit rating: ${data.message}`);
      }
    } catch (error) {
      alert('An error occurred while submitting your rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Handle comment submission
  const handleAddComment = async () => {
    if (!isLoggedIn) {
      // If not logged in, show the AuthPromptModal
      setCurrentStore(store);
      setRedirectPath(location.pathname);  // Store the current path to redirect after login/signup
      setIsAuthModalOpen(true); // Open the authentication prompt
      return;
    }

    // Validate comment
    if (!comment.trim()) {
      alert('Please enter a comment before submitting.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`${config.backendUrl}/api/partners/${store._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: user._id, comment }),
      });

      const data = await response.json();
      if (response.ok) {
        // Handle comment success (e.g., update comments)
        setComment(''); // Clear comment box
        
        // Refresh reviews to show the new comment
        const refreshResponse = await fetch(`${config.backendUrl}/api/partners/${store._id}/reviews`);
        const refreshData = await refreshResponse.json();
        setReviews(refreshData.reviews || []);
      } else {
        // Show user-friendly error message
        alert(`Failed to submit comment: ${data.message}`);
      }
    } catch (error) {
      alert('An error occurred while submitting your comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Store Details"
      className={styles['shop-detail-modal']}
      overlayClassName={styles['shop-detail-modal-overlay']}
    >
      <div className={styles.modalContentWrapper} role="dialog" aria-labelledby="shop-modal-title">
        <div className={styles.modalHeader}>
          <h2 id="shop-modal-title" className={styles.modalTitle}>Store Details</h2>
          <button className={styles.closeButton} onClick={onRequestClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.profileSection}>
            <div className={styles.profileCard}>
              <div className={styles.profileImage}>
                <img
                  src={store.profileImage?.startsWith('http') ? store.profileImage : `${config.backendUrl}${store.profileImage}`}
                  alt={store.businessName}
                />
              </div>
              <div className={styles.profileInfo}>
                <h3 className={styles.shopName}>{store.businessName}</h3>
                {store.town && (
                  <p className={styles.shopTown}>{store.town}</p>
                )}
                {store.address && (
                  <p className={styles.shopAddress}>{store.address}</p>
                )}
                {store.email && (
                  <p className={styles.shopEmail}>{store.email}</p>
                )}
                {store.phone && (
                  <p className={styles.shopPhone}>{store.phone}</p>
                )}
                <div className={styles.ratingInfo}>
                  <span className={styles.ratingLabel}>Rating:</span>
                  <div className={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fas fa-star ${styles.star} ${star <= (store.ratings?.average || 0) ? styles.filled : ''}`}
                      />
                    ))}
                  </div>
                  <span className={styles.ratingText}>
                    {store.ratings?.average?.toFixed(1) || '0.0'} ({store.ratings?.reviews?.length || 0} reviews)
                  </span>
                </div>
              </div>
        </div>

            <div className={styles.rateSection}>
              <h4 className={styles.rateTitle}>Rate this store</h4>
              <div className={styles.rateStars} role="radiogroup" aria-label="Rate this store">
          {[1, 2, 3, 4, 5].map((star) => (
            <i
              key={star}
                    role="radio"
                    aria-checked={star <= (hoverRating || selectedRating)}
                    tabIndex={isSubmittingRating ? -1 : 0}
                    className={`fas fa-star ${styles.star} ${star <= (hoverRating || selectedRating) ? styles.filled : ''} ${isSubmittingRating ? styles.disabled : ''}`}
              onMouseEnter={() => !isSubmittingRating && setHoverRating(star)}
              onMouseLeave={() => !isSubmittingRating && setHoverRating(0)}
              onClick={() => !isSubmittingRating && handleStarClick(star)}
                    onKeyDown={(e) => {
                      if (!isSubmittingRating && (e.key === 'Enter' || e.key === ' ')) handleStarClick(star);
                    }}
                  />
          ))}
              </div>
            </div>

        </div>

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
                          <i
                            key={star}
                            className={`fas fa-star ${styles.star} ${star <= (review.rating || 0) ? styles.filled : ''}`}
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
        <button 
          onClick={handleAddComment} 
          className={styles.submitComment}
          disabled={isSubmittingComment}
        >
          {isSubmittingComment ? 'Submitting...' : 'Submit Comment'}
        </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onRequestClose={() => setIsAuthModalOpen(false)} // Close the auth prompt
      />
    </Modal>
  );
};

export default ShopDetailModal;
