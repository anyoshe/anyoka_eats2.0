// import React, { useState } from 'react';
// import './DriverDashboard.css'; // Ensure this path is correct based on your project structure
// import '@fortawesome/fontawesome-free/css/all.min.css';


// const Dashboard = () => {
//     const [isOnline, setIsOnline] = useState(false);
//     const [showProfileCard, setShowProfileCard] = useState(false);
//     const [selectedOrder, setSelectedOrder] = useState(null);

//     const orders = [
//         { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
//         { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
//         { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
//         { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
//         { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
//         { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
//         { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
//         { id: 1, name: "Hotel Rafiki", pickup: "BP, opposite", order: "Htu46d63f", dropoff: "Bunthwani", distance: "2 Km", payment: "Ksh 200", commission: "Ksh 200" },
//         // Add more orders as needed
//     ];

//     const toggleOnlineStatus = () => {
//         setIsOnline(prev => !prev);
//     };

//     const handleProfileClick = () => {
//         setShowProfileCard(prev => !prev);
//     };

//     const handleAcceptOrder = (order) => {
//         setSelectedOrder(order);
//     };

//     const handleDeclineOrder = () => {
//         setSelectedOrder(null);
//     };

// return (
// <div className="dial-slider_wrapper">
//     <div className="dial-slider_container">
//     <div className="driver_header">
//         <div className="driver_slider">
//             <label className="label_on on_off">Online</label>
//             <div className={`toggle-switch ${isOnline ? 'active' : ''}`} onClick={toggleOnlineStatus}>
//                 <span className="btn_slider" style={{ left: isOnline ? 'calc(100% - 28px)' : '2px' }}></span>
//             </div>
//             <label className="label_off on_off">Offline</label>
//         </div>

//         <div className="driver_icon">
//             <i className="fas fa-user-circle driver_profile" onClick={handleProfileClick}></i>

            // {showProfileCard && (

            // // <div className="profile-card-overlay">
            // <div className={`profile-card-overlay ${showProfileCard ? 'show' : ''}`}>

            //     <div className="profile-cards">

            //     <div className="image">
            //         <img src="Sunlight Tropical Sensation.jpg" alt="Driver" height="60%" width="60%" />
            //         <span className="name">Anyoka The Driver</span>
            //         <span className="location"><i className="fas fa-location-dot profile_icon" aria-hidden="true"></i> Shella, Malindi</span>
            //         <div className="Vehicle">
            //         <span className="vehicle_details">
            //             <span className="icon_label"><i className="fas fa-user profile_icon" aria-hidden="true"></i> ID :</span>
            //             <span className="number">75638687</span>
            //         </span>
            //             <span className="vehicle_details">
            //             <span className="icon_label"><i className="fas fa-drivers-license profile_icon" aria-hidden="true"></i> License :</span>
            //             <span className="number">KDC243J</span>
            //             </span>
            //         </div>
            //         <div className="Vehicle">
            //             <span className="vehicle_details">
            //             <span className="icon_label"><i className="fas fa-building profile_icon" aria-hidden="true"></i> Type :</span>
            //             <span className="number">Motorcycle</span>
            //             </span>
            //             <span className="vehicle_details">
            //             <span className="icon_label"><i className="fas fa-car profile_icon" aria-hidden="true"></i> Plate :</span>
            //             <span className="number">KDC243J</span>
            //             </span>
            //         </div>
            //         <div className="btn-container">
            //             <button className="edit_btn">Edit Profile</button>
            //         </div>
            //         </div>
            //     </div>
            //     </div>
            // )}
//             </div>
//         </div>

//         <div className="driver_body">
//         {selectedOrder ? (
//             <div className="map_div">
//                 <div className="order_delivery_details">
//                     <div className="hotel_name_div"><p className="order_p">Name</p><span className="order_detail_input">{selectedOrder.name}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Pick up</p><span className="order_detail_input">{selectedOrder.pickup}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Order</p><span className="order_detail_input">{selectedOrder.order}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Drop off</p><span className="order_detail_input">{selectedOrder.dropoff}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Distance</p><span className="order_detail_input">{selectedOrder.distance}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Payment</p><span className="order_detail_input">{selectedOrder.payment}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Our Commission</p><span className="order_detail_input">{selectedOrder.commission}</span></div>

//                     <div className="button_div">
//                     <button className="decline_order_btn" onClick={handleDeclineOrder}>Delivered</button>
//                     <button className="decline_order_btn" onClick={handleDeclineOrder}>Cancel</button>
//                     </div>
//                 </div>
//             </div>
//             ) : (
//             orders.map(order => (
//                 <div className="order_container_div" key={order.id}>

//                     <div className="hotel_name_div"><p className="order_p">Name</p><span className="order_detail_input">{order.name}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Pick up</p><span className="order_detail_input">{order.pickup}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Order</p><span className="order_detail_input">{order.order}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Drop off</p><span className="order_detail_input">{order.dropoff}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Distance</p><span className="order_detail_input">{order.distance}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Payment</p><span className="order_detail_input">{order.payment}</span></div>

//                     <div className="hotel_name_div"><p className="order_p">Our Commission</p><span className="order_detail_input">{order.commission}</span></div>
                    
//                     <button className="accept_order_btn" onClick={() => handleAcceptOrder(order)}>Accept</button>
//                 </div>
//             ))
//             )}
//         </div>
//         </div>
//     </div>
//     );
// };

// export default Dashboard;
// import React, { useState, useEffect } from 'react';
// import './DriverDashboard.css';
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import config from '../../config';

// const Dashboard = () => {
//     const [isOnline, setIsOnline] = useState(false);
//     const [showProfileCard, setShowProfileCard] = useState(false);
//     const [selectedOrder, setSelectedOrder] = useState(null);
//     const [orders, setOrders] = useState([]);

//     useEffect(() => {
//         const fetchOrders = async () => {
//             try {
//                 const response = await fetch(`${config.backendUrl}/api/orders`); // Adjust API path as necessary
//                 const data = await response.json();

//                 // Process data to match the required structure
//                 const formattedOrders = data.map(order => ({
//                     id: order._id,
//                     name: order.selectedRestaurant, // Restaurant name
//                     pickup: order.selectedRestaurantLocation || order.selectedRestaurant, // Replace with actual restaurant location
//                     order: order.orderId,
//                     dropoff: order.customerLocation, // Customer location as delivery point
//                     // distance: calculateDistance(order.customerLocation, order.selectedRestaurantLocation), // Implement this function
//                     deliveryCharges: `Ksh ${order.deliveryCharges}`,
//                     commission: `Ksh ${order.deliveryCharges * 0.2}`, // 10% commission
//                     netPay: `Ksh ${order.deliveryCharges - (order.deliveryCharges * 0.2)}`, // Net pay after commission
//                     expectedDeliveryTime: new Date(order.expectedDeliveryTime).toLocaleString(), // Format date
//                     phoneNumber: order.phoneNumber,
//                     status: order.status,
//                     dishes: order.dishes // Keep dishes if you want to display them later
//                 }));
//                 setOrders(formattedOrders);
//             } catch (error) {
//                 console.error('Failed to fetch orders:', error);
//             }
//         };

//         fetchOrders();
//     }, []); // Empty dependency array to run only on mount

//     const toggleOnlineStatus = () => {
//         setIsOnline(prev => !prev);
//     };

//     const handleProfileClick = () => {
//         setShowProfileCard(prev => !prev);
//     };

//     const handleAcceptOrder = (order) => {
//         setSelectedOrder(order);
//     };

//     const handleDeclineOrder = () => {
//         setSelectedOrder(null);
//     };

//     // const calculateDistance = (customerLocation, restaurantLocation) => {
//     //     // Implement your distance calculation logic here, returning the distance in Km
//     //     return "2 Km"; // Placeholder, implement your own logic
//     // };

//     return (
//         <div className="dial-slider_wrapper">
//             <div className="dial-slider_container">
//                 <div className="driver_header">
                    
//                     <div className="driver_slider">
//                         <label className="label_on on_off">Online</label>
//                         <div className={`toggle-switch ${isOnline ? 'active' : ''}`} onClick={toggleOnlineStatus}>
//                             <span className="btn_slider" style={{ left: isOnline ? 'calc(100% - 28px)' : '2px' }}></span>
//                         </div>
//                         <label className="label_off on_off">Offline</label>
//                     </div>

//                     <div className="driver_icon">
//                         <i className="fas fa-user-circle driver_profile" onClick={handleProfileClick}></i>

//                         {showProfileCard && (
//                             <div className={`profile-card-overlay ${showProfileCard ? 'show' : ''}`}>
//                                 <div className="profile-cards">
//                                     {/* Profile card content */}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//              </div>

//                     <div className="driver_body">
//                         {selectedOrder ? (
//                             <div className="map_div">
//                                 <div className="order_delivery_details">
//                                     {/* Display selected order details here */}
//                                     <p>Order ID: {selectedOrder.order}</p>
//                                     <p>Restaurant: {selectedOrder.name}</p>
//                                     <p>Pickup Location: {selectedOrder.pickup}</p>
//                                     <p>Dropoff Location: {selectedOrder.dropoff}</p>
//                                     {/* <p>Distance: {selectedOrder.distance}</p> */}
//                                     <p>Gross Delivery Charges: {selectedOrder.deliveryCharges}</p>
//                                     <p>Commission: {selectedOrder.commission}</p>
//                                     <p>Net Pay: {selectedOrder.netPay}</p>
//                                     <p>Expected Delivery Time: {selectedOrder.expectedDeliveryTime}</p>
//                                     <p>Customer Contact: {selectedOrder.phoneNumber}</p>
//                                     <button className="decline_order_btn" onClick={handleDeclineOrder}>Decline</button>
//                                 </div>
//                             </div>
//                         ) : (
//                             orders.map(order => (
//                                 <div className="order_container_div" key={order.id}>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Restaurant</p>
//                                         <span className="order_detail_input">{order.name}</span>
//                                     </div>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Pickup Location</p>
//                                         <span className="order_detail_input">{order.pickup}</span>
//                                     </div>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Order ID</p>
//                                         <span className="order_detail_input">{order.order}</span>
//                                     </div>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Dropoff Location</p>
//                                         <span className="order_detail_input">{order.dropoff}</span>
//                                     </div>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Distance</p>
//                                         <span className="order_detail_input">{order.distance}</span>
//                                     </div>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Gross Delivery Charges</p>
//                                         <span className="order_detail_input">{order.deliveryCharges}</span>
//                                     </div>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Commission</p>
//                                         <span className="order_detail_input">{order.commission}</span>
//                                     </div>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Net Pay</p>
//                                         <span className="order_detail_input">{order.netPay}</span>
//                                     </div>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Expected Delivery Time</p>
//                                         <span className="order_detail_input">{order.expectedDeliveryTime}</span>
//                                     </div>
//                                     <div className="hotel_name_div">
//                                         <p className="order_p">Customer Contact</p>
//                                         <span className="order_detail_input">{order.phoneNumber}</span>
//                                     </div>
//                                     <button className="accept_order_btn" onClick={() => handleAcceptOrder(order)}>Accept</button>
//                                 </div>
                            
//                             ))
//                         )}
//                     </div>
//                 </div>
//             {/* </div> */}
//         </div>
//     );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import './DriverDashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import config from '../../config';

const Dashboard = () => {
    const [isOnline, setIsOnline] = useState(false);
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [driverDetails, setDriverDetails] = useState({});
    const [location, setLocation] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [driverImage, setDriverImage] = useState(null); // New state for driver image
    const [editing, setEditing] = useState(false); // State to toggle editing mode

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${config.backendUrl}/api/orders`);
                const data = await response.json();
                const formattedOrders = data.map(order => ({
                    id: order._id,
                    name: order.selectedRestaurant,
                    pickup: order.selectedRestaurantLocation || order.selectedRestaurant,
                    order: order.orderId,
                    dropoff: order.customerLocation,
                    deliveryCharges: `Ksh ${order.deliveryCharges}`,
                    commission: `Ksh ${order.deliveryCharges * 0.2}`,
                    netPay: `Ksh ${order.deliveryCharges - (order.deliveryCharges * 0.2)}`,
                    expectedDeliveryTime: new Date(order.expectedDeliveryTime).toLocaleString(),
                    phoneNumber: order.phoneNumber,
                    status: order.status,
                    dishes: order.dishes
                }));
                setOrders(formattedOrders);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };

        const fetchDriverDetails = async () => {
            try {
                const response = await fetch(`${config.backendUrl}/api/driverDetails`); // Adjust endpoint as needed
                const data = await response.json();
                console.log(data);
                setDriverDetails(data);
                setLocation(data.location || ''); // Initialize input field with existing location
                setVehicleType(data.NumberPlate || ''); // Initialize input field with existing vehicle type
                setDriverImage(data.image || null); // Initialize driver image
            } catch (error) {
                console.error('Failed to fetch driver details:', error);
            }
        };

        fetchOrders();
        fetchDriverDetails();
    }, []);

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

    const handleUpdateDriver = async () => {
        const formData = new FormData();
        formData.append('location', location);
        formData.append('vehicleType', vehicleType);
        if (driverImage) {
            formData.append('image', driverImage); // Include the image if available
        }

        try {
            console.log(formData);
            const response = await fetch(`${config.backendUrl}/api/driverDetails`, {
                method: 'PATCH', // Use PATCH for updating
                body: formData,
            });

            if (response.ok) {
                const updatedDriver = await response.json();
                setDriverDetails(updatedDriver); // Update driver details after successful patch
                setShowProfileCard(false); // Close profile card after updating
                setEditing(false); // Reset editing mode
            } else {
                console.error('Failed to update driver details');
            }
        } catch (error) {
            console.error('Error updating driver details:', error);
        }
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
                            <div className={`profile-card-overlay ${showProfileCard ? 'show' : ''}`}>
                                <div className="profile-cards">
                                    <div className="image">
                                        <img src={driverImage || 'default-image.jpg'} alt="Driver" height="60%" width="60%" />
                                        <div className="image-upload">
                                            {editing && (
                                                <>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setDriverImage(e.target.files[0])}
                                                    />
                                                    <p>{driverImage ? driverImage.name : 'No image selected'}</p>
                                                </>
                                            )}
                                        </div>
                                        <span className="name">{driverDetails.OfficialNames}</span>
                                        <span className="location">
                                            <i className="fas fa-location-dot profile_icon" aria-hidden="true"></i>
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    placeholder="Enter your location"
                                                />
                                            ) : (
                                                <span>{driverDetails.location}</span>
                                            )}
                                        </span>
                                        <div className="Vehicle">
                                            <span className="vehicle_details">
                                                <span className="icon_label">
                                                    <i className="fas fa-user profile_icon" aria-hidden="true"></i> ID :
                                                </span>
                                                <span className="number">{driverDetails.IDNumber}</span>
                                            </span>
                                            <span className="vehicle_details">
                                                <span className="icon_label">
                                                    <i className="fas fa-drivers-license profile_icon" aria-hidden="true"></i> License :
                                                </span>
                                                <span className="number">{driverDetails.DriverLicenceNumber}</span>
                                            </span>
                                        </div>
                                        <div className="Vehicle">
                                            <span className="vehicle_details">
                                                <span className="icon_label">
                                                    <i className="fas fa-building profile_icon" aria-hidden="true"></i> Type :
                                                </span>
                                                {editing ? (
                                                    <input
                                                        type="text"
                                                        value={vehicleType}
                                                        onChange={(e) => setVehicleType(e.target.value)}
                                                        placeholder="Enter vehicle type"
                                                    />
                                                ) : (
                                                    <span>{driverDetails.vehicleType}</span>
                                                )}
                                            </span>
                                            <span className="vehicle_details">
                                                <span className="icon_label">
                                                    <i className="fas fa-car profile_icon" aria-hidden="true"></i> Plate :
                                                </span>
                                                <span className="number">{driverDetails.NumberPlate}</span>
                                            </span>
                                        </div>
                                       
                                        <div className="btn-container">
                                            <button className="edit_btn" onClick={editing ? handleUpdateDriver : () => setEditing(true)}>
                                                {editing ? 'Save Changes' : 'Edit Profile'}
                                            </button>
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
                                <p>Order ID: {selectedOrder.order}</p>
                                <p>Restaurant: {selectedOrder.name}</p>
                                <p>Pickup Location: {selectedOrder.pickup}</p>
                                <p>Dropoff Location: {selectedOrder.dropoff}</p>
                                <p>Gross Delivery Charges: {selectedOrder.deliveryCharges}</p>
                                <p>Commission: {selectedOrder.commission}</p>
                                <p>Net Pay: {selectedOrder.netPay}</p>
                                <p>Expected Delivery Time: {selectedOrder.expectedDeliveryTime}</p>
                                <p>Customer Contact: {selectedOrder.phoneNumber}</p>
                                <button className="decline_order_btn" onClick={handleDeclineOrder}>Decline</button>
                            </div>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div className="order_container_div" key={order.id}>
                                <div className="hotel_name_div">
                                    <p className="order_p">Restaurant</p>
                                    <span className="order_detail_input">{order.name}</span>
                                </div>
                                <div className="hotel_name_div">
                                    <p className="order_p">Pickup Location</p>
                                    <span className="order_detail_input">{order.pickup}</span>
                                </div>
                                <div className="hotel_name_div">
                                    <p className="order_p">Order ID</p>
                                    <span className="order_detail_input">{order.order}</span>
                                </div>
                                <div className="hotel_name_div">
                                    <p className="order_p">Dropoff Location</p>
                                    <span className="order_detail_input">{order.dropoff}</span>
                                </div>
                                <div className="hotel_name_div">
                                    <p className="order_p">Delivery Charges</p>
                                    <span className="order_detail_input">{order.deliveryCharges}</span>
                                </div>
                                <div className="hotel_name_div">
                                    <p className="order_p">Commission</p>
                                    <span className="order_detail_input">{order.commission}</span>
                                </div>
                                <div className="hotel_name_div">
                                    <p className="order_p">Net Pay</p>
                                    <span className="order_detail_input">{order.netPay}</span>
                                </div>
                                <div className="hotel_name_div">
                                    <p className="order_p">Expected Delivery Time</p>
                                    <span className="order_detail_input">{order.expectedDeliveryTime}</span>
                                </div>
                                <div className="hotel_name_div">
                                    <p className="order_p">Customer Contact</p>
                                    <span className="order_detail_input">{order.phoneNumber}</span>
                                </div>
                                <button className="accept_order_btn" onClick={() => handleAcceptOrder(order)}>Accept Order</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
