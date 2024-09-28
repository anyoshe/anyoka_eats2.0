import React, { useState } from 'react';
import './DriverDashboard.css'; // Ensure this path is correct based on your project structure
import '@fortawesome/fontawesome-free/css/all.min.css';


const Dashboard = () => {
    const [isOnline, setIsOnline] = useState(false);
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const orders = [
        { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
        { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
        { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
        { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
        { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
        { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
        { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
        { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
        // Add more orders as needed
    ];

    const toggleOnlineStatus = () => {
        setIsOnline(prev => !prev);
    };

    const handleProfileClick = () => {
        setShowProfileCard(prev => !prev);
    };

    const handleAcceptOrder = (order) => {
        setSelectedOrder(order);
    };

    const handleDeclineOrder = () => {
        setSelectedOrder(null);
    };

return (
<div className="dial-slider_wrapper">
    <div className="dial-slider_container">
    <div className="driver_header">
        <div className="driver_slider">
            <label className="label_on on_off">Online</label>
            <div className={`toggle-switch ${isOnline ? 'active' : ''}`} onClick={toggleOnlineStatus}>
                <span className="btn_slider" style={{ left: isOnline ? 'calc(100% - 28px)' : '2px' }}></span>
            </div>
            <label className="label_off on_off">Offline</label>
        </div>

        <div className="driver_icon">
            <i className="fas fa-user-circle driver_profile" onClick={handleProfileClick}></i>

            {showProfileCard && (

            // <div className="profile-card-overlay">
            <div className={`profile-card-overlay ${showProfileCard ? 'show' : ''}`}>

                <div className="profile-cards">

                <div className="image">
                    <img src="Sunlight Tropical Sensation.jpg" alt="Driver" height="60%" width="60%" />
                    <span className="name">Anyoka The Driver</span>
                    <span className="location"><i className="fas fa-location-dot profile_icon" aria-hidden="true"></i> Shella, Malindi</span>
                    <div className="Vehicle">
                    <span className="vehicle_details">
                        <span className="icon_label"><i className="fas fa-user profile_icon" aria-hidden="true"></i> ID :</span>
                        <span className="number">75638687</span>
                    </span>
                        <span className="vehicle_details">
                        <span className="icon_label"><i className="fas fa-drivers-license profile_icon" aria-hidden="true"></i> License :</span>
                        <span className="number">KDC243J</span>
                        </span>
                    </div>
                    <div className="Vehicle">
                        <span className="vehicle_details">
                        <span className="icon_label"><i className="fas fa-building profile_icon" aria-hidden="true"></i> Type :</span>
                        <span className="number">Motorcycle</span>
                        </span>
                        <span className="vehicle_details">
                        <span className="icon_label"><i className="fas fa-car profile_icon" aria-hidden="true"></i> Plate :</span>
                        <span className="number">KDC243J</span>
                        </span>
                    </div>
                    <div className="btn-container">
                        <button className="edit_btn">Edit Profile</button>
                    </div>
                    </div>
                </div>
                </div>
            )}
            </div>
        </div>

        <div className="driver_body">
        {selectedOrder ? (
            <div className="map_div">
                <div className="order_delivery_details">
                    <div className="hotel_name_div"><p className="order_p">Name</p><span className="order_detail_input">{selectedOrder.name}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Pick up</p><span className="order_detail_input">{selectedOrder.pickup}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Order</p><span className="order_detail_input">{selectedOrder.order}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Drop off</p><span className="order_detail_input">{selectedOrder.dropoff}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Distance</p><span className="order_detail_input">{selectedOrder.distance}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Payment</p><span className="order_detail_input">{selectedOrder.payment}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Our Commission</p><span className="order_detail_input">{selectedOrder.commission}</span></div>

                    <div className="button_div">
                    <button className="decline_order_btn" onClick={handleDeclineOrder}>Delivered</button>
                    <button className="decline_order_btn" onClick={handleDeclineOrder}>Cancel</button>
                    </div>
                </div>
            </div>
            ) : (
            orders.map(order => (
                <div className="order_container_div" key={order.id}>

                    <div className="hotel_name_div"><p className="order_p">Name</p><span className="order_detail_input">{order.name}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Pick up</p><span className="order_detail_input">{order.pickup}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Order</p><span className="order_detail_input">{order.order}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Drop off</p><span className="order_detail_input">{order.dropoff}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Distance</p><span className="order_detail_input">{order.distance}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Payment</p><span className="order_detail_input">{order.payment}</span></div>

                    <div className="hotel_name_div"><p className="order_p">Our Commission</p><span className="order_detail_input">{order.commission}</span></div>
                    
                    <button className="accept_order_btn" onClick={() => handleAcceptOrder(order)}>Accept</button>
                </div>
            ))
            )}
        </div>
        </div>
    </div>
    );
};

export default Dashboard;
