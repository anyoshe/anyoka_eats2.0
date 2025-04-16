import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ProductCard from '../User/ProductCard'; // Import the ProductCard component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import config from '../../config';
import './ProductDetailModal.css'; // Ensure you create and style this CSS file

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
      className="product-detail-modal"
      overlayClassName="product-detail-modal-overlay"
    >
      <div className="modal-content">
        <button className="close-button" onClick={onRequestClose}>
          &times;
        </button>

        {/* Render the ProductCard component */}
        <ProductCard product={product} />

        <div className="modal-rating">
          <h3>Rate this Product</h3>
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
          <h3>Comments</h3>
          <ul className="comments-list">
            {comments.map((c, index) => (
              <li key={index} className="comment-item">
                <p>{c.text}</p>
                <small>By: {c.user}</small>
              </li>
            ))}
          </ul>
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