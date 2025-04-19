import React, { useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import styles from './ProductDetailModal.module.css';

Modal.setAppElement('#root'); // For accessibility

const ProductDetailModal = ({ isOpen, onRequestClose, product, onAddToCart }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(product.ratings?.average || 0);
  const [comment, setComment] = useState('');

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    // TODO: Submit rating to the server
  };

  const handleAddComment = () => {
    // TODO: Submit comment to the server
    setComment('');
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
