import React, { useEffect, useState } from 'react';
import './Landing.css';
import config from '../../config';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import ShopDetailModal from './ShopDetailModal'; // Assuming ShopDetailModal is in the same folder

const LandingBodyContainer = () => {
    const [stores, setStores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await fetch(`${config.backendUrl}/api/partners`);
                const data = await response.json();
                console.log('Fetched stores:', data);
                setStores(data);
            } catch (error) {
                console.error('Error fetching partners:', error);
            }
        };

        fetchStores();
    }, []);

    // Open the modal with selected store data
    const openModal = (store) => {
        setSelectedStore(store);
        setIsModalOpen(true);
    };

    // Close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStore(null);
    };

    // Function to render rating stars based on the average rating
    const renderRatingStars = (rating) => {
        const filledStars = Math.round(rating); // Round to nearest integer
        return (
            <>
                {[...Array(5)].map((_, index) => (
                    <i
                    key={index}
                    className={`fas fa-star starIcon ${index < filledStars ? 'filled' : ''}`}
                  />
                  
                ))}
            </>
        );
    };

    return (
        <section className="landingBodyContainer">
            <div className="landingWrapper">
                <h2 className="topRestaurantH1">Most Trusted Stores</h2>
                <div className="storeDivsWrapper">
                    {Array.isArray(stores) &&
                        stores.map((store, index) => {
                            // Calculate the number of reviews and the average rating
                            const averageRating = store.ratings?.average || 0;
                            const reviewCount = store.ratings?.reviews.length || 0;

                            return (
                                <div
                                    key={index}
                                    className="storeDiv"
                                >
                                    {/* Wrap the whole card in a Link except for rating and reviews */}
                                    <Link to={`/store/${store._id}`} className="storeLink">
                                        <div className="imageDiv">
                                            <img
                                                src={
                                                    store.profileImage?.startsWith('http')
                                                        ? store.profileImage
                                                        : `${config.backendUrl}${store.profileImage}`
                                                }
                                                alt={store.businessName}
                                                className="storeImage"
                                            />
                                        </div>
                                        <p className="storeName">{store.businessName}</p>
                                    </Link>
                                    
                                    {/* Render the average rating stars */}
                                    <div className="ratingDiv" onClick={(e) => e.stopPropagation()}>
                                        {renderRatingStars(averageRating)}
                                    </div>

                                    {/* Render the number of reviews and make it clickable */}
                                    <p
                                        className="reviewsLink"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent opening the modal again
                                            openModal(store); // Open the modal to view reviews
                                        }}
                                    >
                                        {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                                    </p>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Modal to show store details */}
            {selectedStore && (
                <ShopDetailModal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    store={selectedStore} // Pass selected store data to modal
                />
            )}
        </section>
    );
};

export default LandingBodyContainer;
