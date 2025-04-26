import React, { useEffect, useState } from 'react';
import styles from './LandingBodyContainer.module.css';
import config from '../../config';
import { Link } from 'react-router-dom';

const LandingBodyContainer = () => {
    const [stores, setStores] = useState([]);

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

    return (
        <section className={styles.landingBodyContainer}>
            <div className={styles.landingWrapper}>

                <h2 className={styles.topRestaurantH1}>Most Trusted Stores</h2>

                <div className={styles.storeDivsWrapper}>
                    {Array.isArray(stores) &&
                        stores.map((store, index) => (
                            <Link to={`/store/${store._id}`} className={styles.storeDiv} key={index}>
                                <div className={styles.imageDiv}>
                                    <img
                                        src={store.profileImage?.startsWith('http') ? store.profileImage : `${config.backendUrl}${store.profileImage}`}
                                        alt={store.businessName}
                                        className={styles.storeImage}
                                    />
                                </div>

                                <p className={styles.storeName}>{store.businessName}</p>

                                <div className={styles.ratingDiv}>
                                    {[...Array(5)].map((_, i) => (
                                        <i className={`fas fa-star ${styles.starIcon}`} key={i}></i>
                                    ))}
                                </div>
                            </Link>

                        ))
                    }

                </div>
            </div>
            <hr></hr>
        </section>
    );
};

export default LandingBodyContainer;
