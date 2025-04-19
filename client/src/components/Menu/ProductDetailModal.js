import React, { useState } from 'react';
import Modal from 'react-modal';
import ProductCard from '../User/ProductCard'; // Import the ProductCard component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import styles from './ProductDetailModal.module.css';

Modal.setAppElement('#root'); // For accessibility

const ProductDetailModal = ({ isOpen, onRequestClose, product, onAddToCart }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(product.ratings?.average || 0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]); // Store previous comments

  // Fetch comments and reviews when the modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/products/${product._id}/comments`);
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments);
      } else {
        console.error('Failed to fetch comments:', data.message);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleStarClick = async (rating) => {
    setSelectedRating(rating);
    try {
      const response = await fetch(`${config.backendUrl}/api/products/${product._id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Rating submitted successfully:', data);
      } else {
        console.error('Failed to submit rating:', data.message);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/products/${product._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });
      const data = await response.json();
      if (response.ok) {
        setComments((prevComments) => [...prevComments, data.comment]);
        setComment('');
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
      <button className={styles.closeButton} onClick={onRequestClose}>
        &times;
      </button>

      <div className={styles.modalContent}>
        <div className={styles.topContent}>
          <div className={styles.leftColumn}>
            <img
              src={product.primaryImage || '/placeholder.png'}
              alt={product.name}
              className={styles.modalImage}
            />
          </div>

          <div className={styles.rightColumn}>
            <h2 className={styles.modalProductTitle}>{product.name}</h2>
            <p className={styles.modalPrice}>KSH: {product.price}</p>
            <p className={styles.modalDescription}>{product.description}</p>

            <div className={styles.modalRating}>
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
              <span className={styles.ratingValue}>({selectedRating.toFixed(1)})</span>
            </div>
          </div>
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
          <button onClick={() => onAddToCart(product)} className={styles.addToCartButton}>
            Add to Cart
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;