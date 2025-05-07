// import React, { useEffect, useState } from 'react';
// import styles from './LandingBodyContainer.module.css';
// import config from '../../config';
// import { Link } from 'react-router-dom';
// import Modal from 'react-modal';
// import ShopDetailModal from './ShopDetailModal'; 

// const LandingBodyContainer = () => {
//     const [stores, setStores] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedStore, setSelectedStore] = useState(null);

//     useEffect(() => {
//         const fetchStores = async () => {
//             try {
//                 const response = await fetch(`${config.backendUrl}/api/partners`);
//                 const data = await response.json();
//                 console.log('Fetched stores:', data);
//                 setStores(data);
//             } catch (error) {
//                 console.error('Error fetching partners:', error);
//             }
//         };

//         fetchStores();
//     }, []);

//     const openModal = (store) => {
//         setSelectedStore(store);
//         setIsModalOpen(true);
//     };

//     const closeModal = () => {
//         setIsModalOpen(false);
//         setSelectedStore(null);
//     };

//     const renderRatingStars = (rating) => {
//         const filledStars = Math.round(rating); 
//         return (
//             <>
//                 {[...Array(5)].map((_, index) => (
//                     <i
//                     key={index}
//                     className={`fas fa-star starIcon ${index < filledStars ? 'filled' : ''}`}
//                   />
                  
//                 ))}
//             </>
//         );
//     };

//     return (
//         <section className={styles.landingBodyContainer}>
//             <div className={styles.landingWrapper}>

//                 <h2 className={styles.topRestaurantH1}>Most Trusted Stores</h2>

//                 <div className={styles.storeDivsWrapper}>
//                     {Array.isArray(stores) &&
//                         stores.map((store, index) => {
                        
//                             const averageRating = store.ratings?.average || 0;
//                             const reviewCount = store.ratings?.reviews.length || 0;

//                             return (
//                                 <div
//                                     key={index}
//                                     className="storeDiv"
//                                 >
//                                     <Link to={`/store/${store._id}`} className="storeLink">
//                                         <div className="imageDiv">
//                                             <img
//                                                 src={
//                                                     store.profileImage?.startsWith('http')
//                                                         ? store.profileImage
//                                                         : `${config.backendUrl}${store.profileImage}`
//                                                 }
//                                                 alt={store.businessName}
//                                                 className="storeImage"
//                                             />
//                                         </div>
//                                         <p className="storeName">{store.businessName}</p>
//                                     </Link>
                                    
//                                     <div className="ratingDiv" onClick={(e) => e.stopPropagation()}>
//                                         {renderRatingStars(averageRating)}
//                                     </div>

//                                     <p
//                                         className="reviewsLink"
//                                         onClick={(e) => {
//                                             e.stopPropagation(); 
//                                             openModal(store); /
//                                         }}
//                                     >
//                                         {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
//                                     </p>
//                                 </div>
//                             );
//                         })}
//                 </div>
//             </div>

//             {/* Modal to show store details */}
//             {selectedStore && (
//                 <ShopDetailModal
//                     isOpen={isModalOpen}
//                     onRequestClose={closeModal}
//                     store={selectedStore} 
//                 />
//             )}
//         </section>
//     );
// };

// export default LandingBodyContainer;


import React, { useEffect, useState } from 'react';
import styles from './LandingBodyContainer.module.css';
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

                <div className={styles.storeDivsWrapper}>
                    {Array.isArray(stores) &&
                        stores.map((store, index) => {
                            const averageRating = store.ratings?.average || 0;
                            const reviewCount = store.ratings?.reviews.length || 0;

                            return (
                                <div key={index} className={styles.storeDiv}>
                                    <Link to={`/store/${store._id}`} className={styles.storeLink}>
                                        <div className={styles.imageDiv}>
                                            <img
                                                src={
                                                    store.profileImage?.startsWith('http')
                                                        ? store.profileImage
                                                        : `${config.backendUrl}${store.profileImage}`
                                                }
                                                alt={store.businessName}
                                                className={styles.storeImage}
                                            />
                                        </div>
                                        <p className={styles.storeName}>{store.businessName}</p>
                                    </Link>

                                    <div className={styles.ratingDiv} onClick={(e) => e.stopPropagation()}>
                                        {renderRatingStars(averageRating)}
                                    </div>

                                    <p
                                        className={styles.reviewsLink}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openModal(store);
                                        }}
                                    >
                                        {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                                    </p>
                                </div>
                            );
                        })}
                </div>
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

