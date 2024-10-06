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
    const [contactNumber, setContactNumber] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [driverImage, setDriverImage] = useState(null); // New state for driver image
    const [editing, setEditing] = useState(false); // State to toggle editing mode
    const [timer, setTimer] = useState(0); // Timer state for the countdown
    const [orderTimerId, setOrderTimerId] = useState(null); // Timer ID for clearing later
    const [driverId, setDriverId] = useState(null); // Initialize state for driverId
    // const [dispatchedOrders, setDispatchedOrders] = useState([]);
    const [orderId, setOrderId] = useState(null); // State to hold orderId
    const [orderStatus, setOrderStatus] = useState('');


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
            // fetchDispatchedOrders(driverId); // Fetch dispatched orders using the stored driver ID
            fetchOrders(); // Call fetchOrders if necessary
           // restoreTimerState();
            fetchOrderByStatus();
        }
    }, [driverId]); // This runs whenever driverId changes
    

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
            setContactNumber(data.contactNumber || '');
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

    
    window.onload = () => {
        checkForOngoingOrder(); // First check if the driver has an ongoing order
        monitorOrderStatus(); // Monitor the order status to remove it upon delivery or driver decline
    };
    
    // Function to check for ongoing order and restore state
    const checkForOngoingOrder = () => {
        const savedOrder = localStorage.getItem(`driver_${driverId}_currentOrder`);
        const savedTime = localStorage.getItem(`driver_${driverId}_timerStartTime`);
    
        if (savedOrder && savedTime) {
            const elapsedTime = Math.floor((Date.now() - parseInt(savedTime)) / 1000);
            const remainingTime = 300 - elapsedTime; // 5 minutes (300 seconds) - elapsed time
    
            if (remainingTime > 0) {
                setSelectedOrder(JSON.parse(savedOrder)); // Restore the saved order for the specific driver
                startTimer(JSON.parse(savedOrder).orderId, driverId); // Resume the timer for this driver
                setTimer(remainingTime); // Restore the remaining time
            } else {
                // Timer has already expired, revert order status for this driver
                revertOrderStatus(JSON.parse(savedOrder).orderId, driverId);
    
                // Clear localStorage as the timer expired
                localStorage.removeItem(`driver_${driverId}_currentOrder`);
                localStorage.removeItem(`driver_${driverId}_timerStartTime`);
                localStorage.removeItem(`driver_${driverId}_remainingTime`);
    
                // No ongoing order, so fetch new orders
                fetchOrders();
            }
        } else {
            console.log("No ongoing order found for driver, fetching new orders");
            // No ongoing order, so fetch new orders
            fetchOrders();
        }
    };
    
    // Function to fetch new orders if there's no ongoing order
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
    
    // Function to monitor order status changes (e.g., after delivery or driver decline)
    const monitorOrderStatus = async () => {
        const savedOrder = localStorage.getItem(`driver_${driverId}_currentOrder`);
        if (savedOrder) {
            const { orderId } = JSON.parse(savedOrder);
    
            try {
                // Fetch the current order status from the backend
                const response = await fetch(`${config.backendUrl}/api/getOrderStatus/${orderId}`);
                const orderData = await response.json();
    
                if (orderData.status === 'Delivered' || orderData.status === 'Declined') {
                    // Remove order from view and clear localStorage
                    setSelectedOrder(null);
                    localStorage.removeItem(`driver_${driverId}_currentOrder`);
                    localStorage.removeItem(`driver_${driverId}_timerStartTime`);
                    localStorage.removeItem(`driver_${driverId}_remainingTime`);
                }
            } catch (error) {
                console.error('Error fetching order status:', error);
            }
        }
    };
    

const handleAcceptOrder = async (order) => {
    try {
        if (!driverId) {
            throw new Error('Driver ID is not set');
        }

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

        const updatedOrder = await response.json();
        console.log('Order accepted and dispatched:', updatedOrder);

        // Start the timer only after the order has been set
        setTimer(7 * 60); // Example: 7 minutes
        startTimer(updatedOrder.orderId, driverId); // Start the timer for this order

        // Clear other orders from the view for the specific driver
        setOrders([]);

        // Store the driver-specific order in localStorage
        localStorage.setItem(`driver_${driverId}_order`, JSON.stringify({ orderId: updatedOrder.order, driverId }));

        // Start checking the order status every 90 seconds
        startOrderStatusCheck(updatedOrder.orderId, driverId);

    } catch (error) {
        console.error('Error accepting order:', error);
    }
};


const fetchOrderByStatus = async (orderId, driverId) => {
    try {
        console.log("Fetching order by status for Order ID:", orderId, "and Driver ID:", driverId);
        const response = await fetch(`${config.backendUrl}/api/fetchOrderByStatus/${orderId}/${driverId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch the order by status');
        }

        const fetchedOrder = await response.json();
        console.log("Fetched order:", fetchedOrder);

        localStorage.setItem(`driver_${driverId}_currentOrder`, JSON.stringify(fetchedOrder));
        localStorage.setItem(`driver_${driverId}_timerStartTime`, Date.now()); // Save the start time of the timer

        setSelectedOrder(fetchedOrder); // Store the fetched order for display
        // console.log("Selected Order Set:", fetchedOrder);
        
        return fetchedOrder; // Ensure to return the fetched order
    } catch (error) {
        console.error('Error fetching order by status:', error);
    }
};


const startTimer = (orderId, driverId) => {
    if (orderTimerId) clearInterval(orderTimerId); // Clear previous timer if exists

    console.log(`Starting timer for Order ID: ${orderId}, Driver ID: ${driverId}`);

    const id = setInterval(async () => {
        console.log('Checking order status and updating timer...');

        // Fetch the latest order status
        const fetchedOrder = await fetchOrderByStatus(orderId, driverId);
        console.log('Fetched order status:', fetchedOrder.status);

        // Only continue counting down if the status is still 'Dispatched'
        if (fetchedOrder && fetchedOrder.status === 'Dispatched') {
            setTimer(prev => {
                console.log("Timer countdown:", prev);
                if (prev <= 0) {
                    clearInterval(id);
                    console.log("Timer ended, calling revertOrderStatus");
                    revertOrderStatus(orderId, driverId);
                    // Clear localStorage for the specific driver once the timer ends
                    clearDriverStorage(driverId);
                    return 0;
                }
                return prev - 1; // Decrease the timer
            });
        } else {
            // If the order status is not 'Dispatched', stop the timer
            console.log(`Order status is ${fetchedOrder.status}, stopping timer.`);
            clearInterval(id);
        }
    }, 1000); // Check every second for the timer countdown

    setOrderTimerId(id); // Save the timer ID
};

const clearDriverStorage = (driverId) => {
    localStorage.removeItem(`driver_${driverId}_currentOrder`);
    localStorage.removeItem(`driver_${driverId}_timerStartTime`);
    localStorage.removeItem(`driver_${driverId}_remainingTime`);
};

const startOrderStatusCheck = (orderId, driverId) => {
    console.log(`Starting status check for Order ID: ${orderId}, Driver ID: ${driverId}`);
    const intervalId = setInterval(async () => {
        try {
            const response = await fetch(`${config.backendUrl}/api/fetchOrderByStatus/${orderId}/${driverId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch the order status');
            }

            const fetchedOrder = await response.json();
            console.log("Fetched order status during 90s check:", fetchedOrder.status);

            // If the order status is 'On Transit', stop the timer and update the order display
            if (fetchedOrder.status === 'On Transit') {
                console.log("Order is now on transit. Stopping checks and timer.");
                clearInterval(intervalId); // Stop the status check
                clearInterval(orderTimerId); // Stop the timer
                // Call a function to update the UI to mark as delivered
                markOrderAsDelivered(fetchedOrder);
                return;
            }
        } catch (error) {
            console.error('Error fetching order status during 90s check:', error);
        }
    }, 90 * 1000); // Check every 90 seconds
};


const markOrderAsDelivered = async (orderId, driverId) => {
    console.log("markOrderAsDelivered function called");

    // Check if the order is available and in transit
    if (!selectedOrder || selectedOrder?.status !== 'On Transit') {
        console.log("Order is not in transit or not selected.");
        alert('Order is not in transit, cannot mark as delivered.');
        return false; // Indicate failure
    }

    // Prepare payload for update
    const payload = {
        status: 'Delivered',
        driverId: driverId // Assuming this variable is defined
    };

    try {
        // Make the PATCH request to update the order status
        const response = await fetch(`${config.backendUrl}/api/driverUpdateOrderStatus/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to update order status');
        }

        const updatedOrder = await response.json();
        setSelectedOrder(updatedOrder); // Update the state with the new order details
        alert('Order marked as delivered successfully.');
        return true; // Indicate success
    } catch (error) {
        console.error('Error marking order as delivered:', error);
        alert('Failed to mark order as delivered.');
        return false; // Indicate failure
    }
};

const handleMarkAsDelivered = async () => {
    const orderId = selectedOrder?.orderId; // Use optional chaining to safely get orderId

    if (!orderId) {
        console.log("No order ID found.");
        alert('No order selected to mark as delivered.');
        return;
    }

    const success = await markOrderAsDelivered(orderId, selectedOrder.driverId); // Call the function to mark the order as delivered

    if (success) {
        console.log('Order marked as delivered successfully.');
        
        // Clear the UI by resetting the selected order
        setSelectedOrder(null); // Clear the currently selected order

        await fetchOrders(); // Fetch new orders from the server

        // You may want to check if orders state is updated
        console.log('Updated orders state:', orders);
        
        // Optionally, you can also clear any UI state related to displayed orders if applicable
        // setOrders([]); // Uncomment this if you need to clear existing displayed orders

    } else {
        console.log('Failed to mark order as delivered.');
    }
};

    const revertOrderStatus = async (orderId, driverId) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/revertOrderStatus/${orderId}`, { 
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ driverId }) // Send driverId to ensure the correct driver
            });
    
            if (!response.ok) {
                throw new Error('Failed to revert order status');
            }
    
            console.log('Order status reverted for driver:', driverId);
    
            // Clear localStorage for this driver
            localStorage.removeItem(`driver_${driverId}_currentOrder`);
            localStorage.removeItem(`driver_${driverId}_timerStartTime`);
            localStorage.removeItem(`driver_${driverId}_remainingTime`);

              // **Immediately update the UI**
        await fetchOrders(); // Call fetchOrders to refresh the order list on the UI
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
        formData.append('contactNumber', contactNumber);
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
        // localStorage.removeItem('driverId');
        
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
                                        <span className="contactNumber">
                                            <i className="fas fa-phone-alt profile_icon" aria-hidden="true"></i>
                                            {editing ? (
                                                <input
                                                    type="number"
                                                    value={contactNumber}
                                                    onChange={(e) => setContactNumber(e.target.value)}
                                                    placeholder="Enter your Phone Number"
                                                />
                                            ) : (
                                                <span>{driverDetails.contactNumber}</span>
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
    {/* Check if an order is selected */}
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

                {/* Button to mark as delivered */}
                {selectedOrder.status === 'On Transit' ? (
                    <button 
                        className="accept_order_btn" 
                        onClick={() => handleMarkAsDelivered(selectedOrder.orderId)}
                    >
                        Mark as Delivered
                    </button>
                ) : (
                    <button className="decline_order_btn" onClick={handleDeclineOrder}>
                        Decline
                    </button>
                )}
            </div>
        </div>
    ) : (
        // Display orders if no order is selected
        orders.map((order) => (
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
                    <span className="order_detail_input">{order.orderId}</span>
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
                
                {/* Button to accept the order */}
                <button className="accept_order_btn" onClick={() => handleAcceptOrder(order)}>
                    Accept Order
                </button>
            </div>
        ))
    )}
</div>


            </div>
        </div>
    );
};

export default Dashboard;
