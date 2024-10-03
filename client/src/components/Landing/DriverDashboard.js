import React, { useState, useEffect } from 'react';
import './DriverDashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import config from '../../config';
import { useNavigate } from 'react-router-dom';


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
    const [timer, setTimer] = useState(0); // Timer state for the countdown
    const [orderTimerId, setOrderTimerId] = useState(null); // Timer ID for clearing later
    const [driverId, setDriverId] = useState(null); // Initialize state for driverId
    const [dispatchedOrders, setDispatchedOrders] = useState([]);


    const navigate = useNavigate();

    useEffect(() => {
        const storedDriverId = localStorage.getItem('driverId'); // Retrieve the driver ID from local storage
        if (storedDriverId) {
            console.log('Driver ID set in local storage:', storedDriverId); // Log the driverId instead
            setDriverId(storedDriverId); // Set driverId state
        } else {
            console.error('Driver ID not found in local storage');
        }
    }, []); // This runs once on mount to get the driverId
    
    useEffect(() => {
        if (driverId) {
            fetchDriverDetails(driverId); // Fetch driver details using the stored driver ID
            fetchDispatchedOrders(driverId); // Fetch dispatched orders using the stored driver ID
            fetchOrders(); // Call fetchOrders if necessary
        }
    }, [driverId]); // This runs whenever driverId changes
    

    // Fetch orders with status 'Dispatched' for the logged-in driver
    // const fetchDispatchedOrders = async (driverId) => {
    //     console.log("Driver ID passed to fetchDispatchedOrders:", driverId);
    //     try {
    //         const response = await fetch(`${config.backendUrl}/api/fetchDriverDispatchedOrders/${driverId}`);
    //         console.log("Response received:", response);
    
    //         if (!response.ok) throw new Error('Failed to fetch dispatched orders');
    
    //         const dispatchedOrders = await response.json();
    //         console.log("Dispatched Orders Fetched:", dispatchedOrders);
    
    //         if (dispatchedOrders.length > 0) {
    //             console.log("Updating orders with dispatched orders");
    //             setOrders(dispatchedOrders); // Update orders if dispatched orders exist
    //         } else {
    //             console.log("No dispatched orders found, fetching processed orders");
    //             fetchOrders(); // If no dispatched orders, fetch processed and packed orders
    //         }
    //     } catch (error) {
    //         console.error('Error fetching dispatched orders:', error);
    //     }
    // };
    
    const fetchDispatchedOrders = async (driverId) => {
        console.log("Driver ID passed to fetchDispatchedOrders:", driverId);
        try {
            const response = await fetch(`${config.backendUrl}/api/fetchDriverDispatchedOrders/${driverId}`);
            console.log("Response received:", response);
            if (!response.ok) throw new Error('Failed to fetch dispatched orders');
            const dispatchedOrdersData = await response.json();
            console.log("Dispatched Orders Fetched:", dispatchedOrdersData);
            if (dispatchedOrdersData.length > 0) {
                console.log("Updating orders with dispatched orders");
                setDispatchedOrders(dispatchedOrdersData); // Update dispatched orders if any exist
            } else {
                fetchOrders(); // If no dispatched orders, fetch regular orders
            
            }
        } catch (error) {
            console.error('Error fetching dispatched orders:', error);
        }
    };
    

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${config.backendUrl}/api/orders`);
            const data = await response.json();

            // Filter the orders to only include those with the status 'Processed and packed'
            const processedOrders = data.filter(order => order.status === 'Processed and packed');

            const formattedOrders = processedOrders.map(order => ({
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

    const fetchDriverDetails = async (driverId) => {
        console.log('Fetching details for Driver ID:', driverId); // Log the driverId
        try {
            const response = await fetch(`${config.backendUrl}/api/driverDetails/${driverId}`);
            console.log('Response status:', response.status);

            const text = await response.text();
            console.log('Response text:', text);

            if (!response.ok) {
                throw new Error('Failed to fetch driver details');
            }

            const data = JSON.parse(text);
            console.log('Fetched Driver Details:', data);

            // Check for driver ID in the response
            if (!data._id) {
                console.error('Driver ID is missing in the fetched data');
                return;
            }
            // Construct the full driver image URL
            const driverImage = `${config.backendUrl}${data.driverImage}`;

            // Update state with fetched data
            setDriverDetails(data);
            console.log('Driver Details set:', data);
            setLocation(data.location || '');
            setVehicleType(data.vehicleType || '');
            setDriverImage(driverImage || null);
        } catch (error) {
            console.error('Failed to fetch driver details:', error);
        }
    };


    const toggleOnlineStatus = () => {
        setIsOnline(prev => !prev);
    };

    const handleProfileClick = () => {
        setShowProfileCard(prev => !prev);
    };

    // const handleAcceptOrder = async (order) => {
    //     try {
    //         // Ensure the driver ID is available
    //         if (!driverId) {
    //             throw new Error('Driver ID is not set');
    //         }
    
    //         // Log the order being accepted
    //         console.log('Order being accepted:', order.order); 
    //         console.log('Driver ID:', driverId); 
    
    //         // Update the order status to 'Dispatched' and assign the driver ID
    //         const response = await fetch(`${config.backendUrl}/api/driverUpdateOrderStatus/${order.order}`, {
    //             method: 'PATCH',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ status: 'Dispatched', driverId }) // Update status and set driverId
    //         });
    
    //         if (!response.ok) {
    //             throw new Error('Failed to accept the order');
    //         }
    
    //         // Get the updated order details
    //         const updatedOrder = await response.json();
    //         console.log('Order accepted and dispatched:', updatedOrder);
    
    //         // Set a 15-minute timer for the delivery process
    //         setTimer(1 * 60); 
    //         startTimer();
    
    //         // Clear the current orders from the view
    //         setOrders([]); 
    
    //         // Fetch and display only the dispatched order, passing the correct orderId
    //         await fetchOrderByStatus(updatedOrder.orderId); // Corrected this line to use orderId
    
    //     } catch (error) {
    //         console.error('Error accepting order:', error);
    //     }
    // };
    

    // const fetchOrderByStatus = async (orderId) => {
    //     try {
    //         console.log("Fetching order by status for Order ID:", orderId); // Log order ID for clarity
    //         const response = await fetch(`${config.backendUrl}/api/fetchOrderByStatus/${orderId}/${driverId}`);
    
    //         // Handle errors if the response is not successful
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch the order by status');
    //         }
    
    //         // Get the fetched order details and set it as the selected order
    //         const fetchedOrder = await response.json();
    //         setSelectedOrder(fetchedOrder);
    //     } catch (error) {
    //         console.error('Error fetching order by status:', error);
    //     }
    // };
    
    // // Timer logic
    // const startTimer = () => {
    //     if (orderTimerId) clearInterval(orderTimerId); // Clear previous timer if exists

    //     const id = setInterval(() => {
    //         setTimer(prev => {
    //             if (prev <= 0) {
    //                 clearInterval(id);
    //                 revertOrderStatus(); // Automatically revert order status after 15 mins
    //                 return 0;
    //             }
    //             return prev - 1;
    //         });
    //     }, 1000); // Update timer every second
    //     setOrderTimerId(id); // Save the timer ID
    // };
    // // Revert the order status after the 15-minute timer
    // const revertOrderStatus = async () => {
    //     if (!selectedOrder) return;
    //     try {
    //         const response = await fetch(`${config.backendUrl}/api/updateOrderStatus/${selectedOrder.orderId}`, {
    //             method: 'PATCH',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ status: 'Processed and packed' }), // Revert to 'Processed and packed'
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to revert the order status');
    //         }

    //         setSelectedOrder(null); // Clear selected order
    //         fetchOrders(); // Refresh the orders list after the status is reverted
    //     } catch (error) {
    //         console.error('Error reverting order status:', error);
    //     }
    // };
 
    // const formatTime = (seconds) => {
    //     const minutes = Math.floor(seconds / 60);
    //     const secs = seconds % 60;
    //     return `${minutes}:${secs < 10 ? `0${secs}` : secs}`; // Format time as MM:SS
    // };

    const handleAcceptOrder = async (order) => {
        try {
            // Ensure the driver ID is available
            if (!driverId) {
                throw new Error('Driver ID is not set');
            }
    
            // Log the order being accepted
            console.log('Order being accepted:', order.order); 
            console.log('Driver ID:', driverId); 
    
            // Update the order status to 'Dispatched' and assign the driver ID
            const response = await fetch(`${config.backendUrl}/api/driverUpdateOrderStatus/${order.order}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Dispatched', driverId }) // Update status and set driverId
            });
    
            if (!response.ok) {
                throw new Error('Failed to accept the order');
            }
    
            // Get the updated order details
            const updatedOrder = await response.json();
            console.log('Order accepted and dispatched:', updatedOrder);
    
            // Fetch and display only the dispatched order, passing the correct orderId
            await fetchOrderByStatus(updatedOrder.orderId); // Corrected this line to use orderId
    
            // Start the timer only after the order has been set
            setTimer(1 * 60); // 1 minute = 60 seconds (for testing purposes)
            startTimer();
            
            // Clear the current orders from the view
            setOrders([]); 
    
        } catch (error) {
            console.error('Error accepting order:', error);
        }
    };
    
    // Fetch the order by status and set it as selectedOrder
    const fetchOrderByStatus = async (orderId) => {
        try {
            console.log("Fetching order by status for Order ID:", orderId); // Log order ID for clarity
            const response = await fetch(`${config.backendUrl}/api/fetchOrderByStatus/${orderId}/${driverId}`);
    
            if (!response.ok) {
                throw new Error('Failed to fetch the order by status');
            }
    
            const fetchedOrder = await response.json();
            console.log("Fetched order:", fetchedOrder);
    
            setSelectedOrder(fetchedOrder); // Ensure selectedOrder is set
            console.log("Selected Order Set:", fetchedOrder); // Log the selected order
    
        } catch (error) {
            console.error('Error fetching order by status:', error);
        }
    };
    
    // Timer logic
    const startTimer = () => {
        if (orderTimerId) clearInterval(orderTimerId); // Clear previous timer if exists
    
        const id = setInterval(() => {
            setTimer(prev => {
                console.log("Timer countdown:", prev); // Log the timer value
                if (prev <= 0) {
                    clearInterval(id);
                    console.log("Timer ended, calling revertOrderStatus"); // Log when the timer ends
                    revertOrderStatus(); // Automatically revert order status after timer ends
                    return 0;
                }
                return prev - 1;
            });
        }, 1000); // Update timer every second
        setOrderTimerId(id); // Save the timer ID
    };
    
    // Revert the order status after the timer runs out
    const revertOrderStatus = async () => {
        if (!selectedOrder) {
            console.log("No selectedOrder, aborting revert"); // Log if there's no selected order
            return;
        }
    
        console.log("Reverting order status for Order ID:", selectedOrder.orderId); // Log the order ID to be reverted
        try {
            const response = await fetch(`${config.backendUrl}/api/updateOrderStatus/${selectedOrder.orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Processed and packed' }), // Revert to 'Processed and packed'
            });
    
            if (!response.ok) {
                throw new Error('Failed to revert the order status');
            }
    
            console.log("Order status reverted to 'Processed and packed'");
    
            setSelectedOrder(null); // Clear selected order
            fetchOrders(); // Refresh the orders list after the status is reverted
        } catch (error) {
            console.error('Error reverting order status:', error);
        }
    };
    
    // Utility function to format time for the timer display
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? `0${secs}` : secs}`; // Format time as MM:SS
    };
    
    const handleOnTransit = async () => {
        if (orderTimerId) {
            clearInterval(orderTimerId); // Stop the timer
        }
    
        // Proceed with updating the order status to "On Transit"
        try {
            const response = await fetch(`${config.backendUrl}/api/updateOrderStatus/${selectedOrder.orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'On Transit' }), // Update status to 'On Transit'
            });
    
            if (!response.ok) {
                throw new Error('Failed to update the order status');
            }
    
            setSelectedOrder(null); // Clear selected order
            fetchOrders(); // Refresh the orders list
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };
    

    // Handle decline order logic
    const handleDeclineOrder = async () => {
        try {
            const response = await fetch(`${config.backendUrl}/api/updateOrderStatus/${selectedOrder.orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Processed and packed' }), // Revert to 'Processed and packed'
            });

            if (!response.ok) {
                throw new Error('Failed to decline the order');
            }

            setSelectedOrder(null); // Clear selected order
            fetchOrders(); // Refresh the orders list
        } catch (error) {
            console.error('Error declining order:', error);
        }
    };


    const handleUpdateDriver = async () => {
        const formData = new FormData();
        formData.append('location', location);
        formData.append('vehicleType', vehicleType);

        if (driverImage) {
            formData.append('image', driverImage); // Include the image if available
        }

        // Check if driverDetails is set and contains the _id
        if (driverDetails && driverDetails._id) {
            formData.append('driverId', driverDetails._id); // Ensure _id exists before appending
            console.log('Driver ID:', driverDetails._id); // Log the driver ID to ensure it's set
        } else {
            console.error('Driver ID is undefined. Cannot update driver details.');
            return; // Stop execution if driverId is not available
        }

        try {
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



    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('driverId');
        navigate('/');
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
                                        {driverImage && <img src={driverImage} alt="Driver" />}
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
                                        <button className="logout_btn" onClick={handleLogout}>
                                            Logout
                                        </button>
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
                                <p>Order ID: {selectedOrder.orderId}</p>
                                <p>Restaurant: {selectedOrder.selectedRestaurant}</p>
                                <p>Pickup Location: {selectedOrder.selectedRestaurant}</p>
                                <p>Dropoff Location: {selectedOrder.customerLocation}</p>
                                <p>Gross Delivery Charges: {selectedOrder.deliveryCharges}</p>
                                <p>Commission: {selectedOrder.commission}</p>
                                <p>Net Pay: {selectedOrder.netPay}</p>
                                <p>Expected Delivery Time: {selectedOrder.expectedDeliveryTime}</p>
                                <p>Customer Contact: {selectedOrder.phoneNumber}</p>
                                <p>Status: {selectedOrder.status}</p>
                                <p>Timer: {formatTime(timer)}</p>
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
