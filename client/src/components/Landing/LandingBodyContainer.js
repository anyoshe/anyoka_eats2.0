import React, { useEffect, useState } from 'react';
import styles from './LandingBodyContainer.module.css';
import config from '../../config';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import ShopDetailModal from './ShopDetailModal';

const LandingBodyContainer = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadedImages, setLoadedImages] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${config.backendUrl}/api/partners`);
                if (!response.ok) throw new Error('Failed to load stores');
                const data = await response.json();
                setStores(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching partners:', err);
                setError("We couldn't load stores right now. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const openModal = (store) => {
        setSelectedStore(store);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStore(null);
    };

    const renderRatingStars = (rating) => {
        const filledStars = Math.round(rating);
        return (
            <>
                {[...Array(5)].map((_, index) => (
                    <i
                        key={index}
                        className={`fas fa-star ${styles.starIcon} ${index < filledStars ? styles.filled : ''}`}
                    />
                ))}
            </>
        );
    };

    return (
        <section className={styles.landingBodyContainer}>
            <div className={styles.landingWrapper}>
                <h2 className={styles.topRestaurantH1}>Most Trusted Stores</h2>

                {loading && (
                    <div className={styles.storeDivsWrapper} aria-live="polite" aria-busy="true">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage} />
                                <div className={styles.skeletonLine} />
                                <div className={styles.skeletonLineShort} />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className={styles.emptyState} role="alert">
                        <p>{error}</p>
                        <button className="btn btn--subtle" onClick={() => window.location.reload()}>Try again</button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {(!Array.isArray(stores) || stores.length === 0) ? (
                            <div className={styles.emptyState}>
                                <p>No stores available yet. Check back soon.</p>
                            </div>
                        ) : (
                            <div className={styles.storeDivsWrapper}>
                                {stores.map((store, index) => {
                                    const averageRating = store.ratings?.average || 0;
                                    const reviewCount = store.ratings?.reviews.length || 0;

                                    const imageSrc = store.profileImage?.startsWith('http')
                                        ? store.profileImage
                                        : `${config.backendUrl}${store.profileImage}`;

                                    const isLoaded = !!loadedImages[store._id || index];

                                    return (
                                        <Link
                                            key={store._id || index}
                                            to={`/store/${store._id}`}
                                            className={styles.storeCard}
                                            aria-label={`Open ${store.businessName} store`}
                                        >
                                            <div className={styles.imageDiv}>
                                                <img
                                                    src={imageSrc}
                                                    alt={store.businessName}
                                                    className={`${styles.storeImage} ${isLoaded ? styles.isLoaded : ''}`}
                                                    loading="lazy"
                                                    onLoad={() => setLoadedImages(prev => ({ ...prev, [store._id || index]: true }))}
                                                />
                                            </div>
                                            <p className={styles.storeName}>{store.businessName}</p>

                                            <div
                                                className={styles.ratingDiv}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openModal(store);
                                                }}
                                            >
                                                {renderRatingStars(averageRating)}
                                            </div>

                                            <p
                                                className={styles.reviewsLink}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openModal(store);
                                                }}
                                            >
                                                {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                                            </p>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedStore && (
                <ShopDetailModal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    store={selectedStore}
                />
            )}
        </section>
    );
};

export default LandingBodyContainer;

