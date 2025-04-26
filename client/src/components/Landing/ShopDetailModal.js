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
      console.error('Error fetching reviews:', error);
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

    setSelectedRating(rating);
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
      } else {
        console.error('Failed to submit rating:', data.message);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
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
      } else {
        console.error('Failed to submit comment:', data.message);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
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
      <div className={styles.modalContentWrapper}>
        <button className={styles.closeButton} onClick={onRequestClose}>
          &times;
        </button>
        <ShopCard shop={store} />
        <div className={styles.shopDetails}>
          <h3>{store.businessName}</h3>
          <p>{store.description}</p>
        </div>

        {/* Rating Section */}
        <div className={styles.modalRating}>
          <h3>Rate this Store</h3>
          {[1, 2, 3, 4, 5].map((star) => (
            <i
              key={star}
              className={`fas fa-star ${star <= (hoverRating || selectedRating) ? 'filled' : ''}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleStarClick(star)}
            ></i>
          ))}
        </div>

        {/* Comment Section */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment..."
          className={styles.commentBox}
        />
        <button onClick={handleAddComment} className={styles.submitComment}>
          Submit Comment
        </button>
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
