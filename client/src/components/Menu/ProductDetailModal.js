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
      console.log(data);

      if (response.ok) {
        setReviews(data.reviews);
      } else {
        console.error('Failed to fetch reviews:', data.message);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
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
        console.error('Failed to submit rating:', data.message);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
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
    contentLabel="Product Details"
    className={styles['product-detail-modal']}
    overlayClassName={styles['product-detail-modal-overlay']}
    >
    {/* <div className="modal-content"> */}
    <div className={styles.modalContentWrapper}>
      <button className={styles.closeButton} onClick={onRequestClose}>
        &times;
      </button>
      <div className={styles.modalInnerScrollable}>
        {/* Render ProductCard with reviews */}
        <ProductCard product={{ ...product, ratings: { ...product.ratings, reviews } }} />

        {/* Review interaction controls */}
        {/* <div className="review-controls"> */}
        <div className={styles.reviewControls}>
          <div className={styles.modalRating}>

            <h3 className={styles.modalRatingH3}>Rate this Product</h3>
            
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesomeIcon
                key={star}
                icon={star <= (hoverRating || selectedRating) ? solidStar : regularStar}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleStarClick(star)}
                className={styles.starIcon}
              />
            ))}
            {/* <span className="rating-value">({selectedRating.toFixed(1)})</span> */}
          </div>

          <div className={styles.bottomContent}>
            <div className={styles.modalComments}>
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
          </div>
        </div>
        <button onClick={() => onAddToCart(product)} className={styles.addToCartButton}>
          Add to Cart
        </button>
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