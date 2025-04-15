// ProductDetailModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import './ProductDetailModal.css'; // Ensure you create and style this CSS file

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
      className="product-detail-modal"
      overlayClassName="product-detail-modal-overlay"
    >
      <div className="modal-content">
        <button className="close-button" onClick={onRequestClose}>
          &times;
        </button>
        <img
          src={product.primaryImage || '/placeholder.png'}
          alt={product.name}
          className="modal-image"
        />
        <h2>{product.name}</h2>
        <p className="modal-price">KSH: {product.price}</p>
        <p className="modal-description">{product.description}</p>
        <div className="modal-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={star <= (hoverRating || selectedRating) ? solidStar : regularStar}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleStarClick(star)}
              className="star-icon"
            />
          ))}
          <span className="rating-value">({selectedRating.toFixed(1)})</span>
        </div>
        <div className="modal-comments">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment..."
            className="comment-box"
          />
          <button onClick={handleAddComment} className="submit-comment">
            Submit Comment
          </button>
        </div>
        <button onClick={() => onAddToCart(product)} className="add-to-cart-button">
          Add to Cart
        </button>
      </div>
    </Modal>
   
    
  );
};

export default ProductDetailModal;
