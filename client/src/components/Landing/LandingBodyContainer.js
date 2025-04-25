import React, { useEffect, useState } from 'react';
import './Landing.css';
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
        <section className="landingBodyContainer">
            <div className="landingWrapper">
                <h2 className="topRestaurantH1">Most Trusted Stores</h2>
                <div className="storeDivsWrapper">
                    {Array.isArray(stores) &&

                        stores.map((store, index) => (
                            <Link to={`/store/${store._id}`} className="storeDiv" key={index}>
                                <div className="imageDiv">
                                    <img
                                        src={store.profileImage?.startsWith('http') ? store.profileImage : `${config.backendUrl}${store.profileImage}`}
                                        alt={store.businessName}
                                        className="storeImage"
                                    />
                                </div>
                                <p className="storeName">{store.businessName}</p>
                                <div className="ratingDiv">
                                    {[...Array(5)].map((_, i) => (
                                        <i className="fas fa-star starIcon" key={i}></i>
                                    ))}
                                </div>
                            </Link>

                        ))
                    }

                </div>
            </div>
        </section>
    );
};

export default LandingBodyContainer;
