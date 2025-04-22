import React from 'react';
import styles from  './ReviewsModal.module.css';

const ReviewsModal = ({ product, onClose }) => {
    return (
        <div className={styles.reviewsModalOverlay}>
        <div className={styles.reviewsModal}>
            <div className={styles.HeaderCoseBtn}>
                <h2 className={styles.reviewsh2}>Reviews for {product.name}</h2>
                <button className={styles.closeModalButton} onClick={onClose}>
                <i class="fas fa-times"></i>
                </button>
            </div>
            <div className={styles.reviewsList}>
                    {product.ratings?.reviews?.length > 0 ? (
                        product.ratings.reviews.map((review, index) => (
                            <div key={index} className={styles.reviewItem}>
                               <p className={styles.reviewP}>
                               <strong className={styles.reviewStrongs}>User:</strong> {review.user.username}
                                </p>
                                <p className={styles.reviewP}>
                                <strong className={styles.reviewStrongs}>Rating:</strong> {review.rating} / 5
                                </p>
                                <p className={`${styles.reviewP} ${styles.reviewPComment}`}>
                                <strong className={styles.reviewStrongs}>Comment:</strong> {review.comment || 'No comment provided'}
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