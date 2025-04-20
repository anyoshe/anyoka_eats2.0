import React from 'react';
import './ReviewsModal.css';

const ReviewsModal = ({ product, onClose }) => {
    return (
        <div className="reviews-modal-overlay">
            <div className="reviews-modal">
                <h2>Reviews for {product.name}</h2>
                <button className="close-modal-button" onClick={onClose}>
                    Close
                </button>
                <div className="reviews-list">
                    {product.ratings?.reviews?.length > 0 ? (
                        product.ratings.reviews.map((review, index) => (
                            <div key={index} className="review-item">
                                <p>
                                    <strong>User:</strong> {review.user.username}
                                </p>
                                <p>
                                    <strong>Rating:</strong> {review.rating} / 5
                                </p>
                                <p>
                                    <strong>Comment:</strong> {review.comment || 'No comment provided'}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No reviews available for this product.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsModal;