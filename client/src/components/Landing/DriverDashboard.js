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

    const checkForOngoingOrder = async () => {
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
            console.log("No ongoing order found for driver, checking for dispatched food orders");

            // Check for dispatched food orders first
            const dispatchedFoodOrders = await fetchDispatchedFoodOrders(driverId);
            if (dispatchedFoodOrders.length === 0) {
                console.log("No dispatched food orders found, fetching new orders");
                // No dispatched food orders, so fetch new orders
                fetchOrders();
            }
        }
    };


    const fetchOrders = async () => {
        try {
            // Fetch all orders
            const allOrdersResponse = await fetch(`${config.backendUrl}/api/orders`);
            const allOrdersData = await allOrdersResponse.json();
            console.log(allOrdersData);

            // Initialize readyForPickupData
            let readyForPickupData = [];

            // Fetch orders that are ready for pickup
            try {
                const readyForPickupResponse = await fetch(`${config.backendUrl}/api/driverDashboard/orders/readyForPickup`);
                if (!readyForPickupResponse.ok) {
                    throw new Error(`HTTP error! status: ${readyForPickupResponse.status}`);
                }

                readyForPickupData = await readyForPickupResponse.json(); // No more 'text()' here
                console.log(readyForPickupData);
            } catch (error) {
                console.warn('Could not fetch ready for pickup orders:', error);
                // You can decide how to handle the error, e.g., set readyForPickupData to an empty array
            }

            // Check if the responses are arrays
            if (!Array.isArray(allOrdersData)) {
                console.error('Unexpected response format for all orders:', allOrdersData);
                return;
            }

            // Filter and format the processed orders from all orders
            const processedOrders = allOrdersData.filter(order => order.status === 'Processed and packed');
            const formattedProcessedOrders = processedOrders.map(order => ({
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
                dishes: order.dishes,
            }));

            // Format the ready for pickup orders only if readyForPickupData is an array
            const formattedReadyForPickupOrders = Array.isArray(readyForPickupData) ? readyForPickupData.map(order => ({
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
                status: order.overallStatus,
                vendorOrders: order.vendorOrders.map(vendorOrder => ({
                    vendor: vendorOrder.vendor,
                    totalPrice: vendorOrder.totalPrice,
                    foods: vendorOrder.foods.map(food => ({
                        foodName: food.foodName,
                        quantity: food.quantity,
                        price: `Ksh ${food.price}`,
                    })),
                })),
            })) : []; // Default to an empty array if readyForPickupData is not an array

            // Combine both formatted orders
            const combinedOrders = [...formattedProcessedOrders, ...formattedReadyForPickupOrders];

            // Update the state with the combined orders
            setOrders(combinedOrders);
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
        const orderId = order?.order;
        console.log("Order being accepted:", orderId);

        if (!orderId) {
            console.error("Order ID is undefined!");
            return;
        }

        try {
            if (!driverId) {
                throw new Error('Driver ID is not set');
            }

            let response;
            let isFoodOrder = false;

            // Check if it's a food (vendor) order or a regular restaurant order
            if (order.vendorOrders && order.vendorOrders.length > 0) {
                isFoodOrder = true; // Flag for fresh food order

                // Update parent food order status to 'Dispatched'
                response = await fetch(`${config.backendUrl}/api/driverUpdateFoodOrderStatus/${orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: 'Dispatched',
                        driverId
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update parent food order status');
                }

                // Update each vendor order's status to 'Dispatched'
                for (let vendorOrder of order.vendorOrders) {
                    const vendorId = vendorOrder?._id;  // Safely retrieve the vendor ID

                    if (!vendorId) {
                        console.warn("Vendor order without ID detected. Full details:", vendorOrder);
                        console.warn("Vendor ID is undefined! Skipping this vendor order.");
                        continue; // Skip this iteration if vendorId is not found
                    } else {
                        console.log("Processing vendor with ID:", vendorId, "Vendor details:", vendorOrder);
                    }

                    try {
                        const vendorResponse = await fetch(`${config.backendUrl}/api/updateVendorOrderStatus/${vendorId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                status: 'Dispatched'
                            })
                        });

                        if (!vendorResponse.ok) {
                            throw new Error(`Failed to update vendor order status for vendor: ${vendorOrder.vendor}`);
                        }

                        const updatedVendorOrder = await vendorResponse.json();
                        console.log(`Vendor order updated to 'Dispatched':`, updatedVendorOrder);

                    } catch (error) {
                        console.error(`Error updating vendor order with ID ${vendorId}:`, error);
                    }
                }


            } else {
                // Update restaurant order status
                response = await fetch(`${config.backendUrl}/api/driverUpdateOrderStatus/${orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: 'Dispatched',
                        driverId
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to accept the order');
                }
            }

            const updatedOrder = await response.json();
            console.log('Order accepted and dispatched:', updatedOrder);

            // Start the timer
            setTimer(7 * 60); // 7 minutes
            startTimer(updatedOrder.orderId, driverId, isFoodOrder);

            // Clear other orders from the view
            setOrders([]);

            // Store the driver-specific order in localStorage
            localStorage.setItem(`driver_${driverId}_order`, JSON.stringify({ orderId: updatedOrder.order, driverId }));

            // Start checking the order status every 90 seconds
            await fetchOrderByStatus(updatedOrder.orderId, driverId, isFoodOrder);
            startOrderStatusCheck(updatedOrder.orderId, driverId);

        } catch (error) {
            console.error('Error accepting order:', error);
        }
    };

    const fetchOrderByStatus = async (orderId, driverId, isFoodOrder = false) => {
        try {
            console.log("Fetching order by status for Order ID:", orderId, "and Driver ID:", driverId);
            console.log("Is this a food order?", isFoodOrder); // Debug log for isFoodOrder

            // Determine the correct endpoint based on whether it's a fresh food order or a regular restaurant order
            const endpoint = isFoodOrder
                ? `${config.backendUrl}/api/fetchFoodOrderByStatus/${orderId}/${driverId}`
                : `${config.backendUrl}/api/fetchOrderByStatus/${orderId}/${driverId}`;

            console.log("Using endpoint:", endpoint); // Debug log for the selected endpoint

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error('Failed to fetch the order by status');
            }

            const fetchedOrder = await response.json();
            console.log("Fetched order:", fetchedOrder);

            // Extract timer data from the response (make sure the backend provides this)
            const timerStartTime = fetchedOrder.timerStartTime || Date.now(); // Fallback to current time if not provided

            // Store fetched order and timer data in localStorage
            localStorage.setItem(`driver_${driverId}_currentOrder`, JSON.stringify(fetchedOrder));
            localStorage.setItem(`driver_${driverId}_timerStartTime`, timerStartTime); // Save the start time of the timer

            setSelectedOrder(fetchedOrder); // Store the fetched order for display

            return fetchedOrder; // Ensure to return the fetched order
        } catch (error) {
            console.error('Error fetching order by status:', error);
        }
    };


    const startTimer = (orderId, driverId, isFoodOrder = false) => {
        if (orderTimerId) clearInterval(orderTimerId); // Clear previous timer if exists

        console.log(`Starting timer for Order ID: ${orderId}, Driver ID: ${driverId}`);

        const id = setInterval(async () => {
            console.log('Checking order status and updating timer...');

            // Fetch the latest order status
            const fetchedOrder = await fetchOrderByStatus(orderId, driverId, isFoodOrder);
            console.log('Fetched order:', fetchedOrder);

            // Determine which status field to check based on whether it's a food order
            const orderStatus = isFoodOrder ? fetchedOrder.overallStatus : fetchedOrder.status;
            console.log('Fetched order status:', orderStatus);

            // If the status changes to 'On Transit', stop the timer and update the state
            if (orderStatus === 'On Transit') {
                clearInterval(id); // Stop the timer
                setSelectedOrder(prevOrder => ({
                    ...prevOrder,
                    status: 'On Transit', // Update the status to 'On Transit'
                    overallStatus: 'On Transit' // Ensure both status and overallStatus are updated
                }));
                return; // Stop further execution of the timer
            }

            // Only continue counting down if the status is still 'Dispatched'
            if (fetchedOrder && orderStatus === 'Dispatched') {
                setTimer(prev => {
                    console.log("Timer countdown:", prev);
                    if (prev <= 0) {
                        clearInterval(id);
                        console.log("Timer ended, calling revertOrderStatus");
                        revertOrderStatus(orderId, driverId);
                        clearDriverStorage(driverId);
                        return 0;
                    }
                    return prev - 1;
                });
            } else {
                console.log(`Order status is ${orderStatus}, stopping timer.`);
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

    const startOrderStatusCheck = (orderId, driverId, isFoodOrder) => {
        console.log(`Starting status check for Order ID: ${orderId}, Driver ID: ${driverId}, isFoodOrder: ${isFoodOrder}`);

        const intervalId = setInterval(async () => {
            try {
                let response;

                if (isFoodOrder) {
                    // Fetch the status of the food order
                    response = await fetch(`${config.backendUrl}/api/fetchFoodOrderByStatus/${orderId}/${driverId}`);
                } else {
                    // Fetch the status of the regular order
                    response = await fetch(`${config.backendUrl}/api/fetchOrderByStatus/${orderId}/${driverId}`);
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch the order status');
                }

                const fetchedOrder = await response.json();
                console.log("Fetched order status during 90s check:", fetchedOrder.status);

                const handleOrderStatusUpdate = (order) => {
                    console.log("Order is now 'On Transit'. Stopping checks and timer.");
                    clearInterval(intervalId); // Stop status check
                    clearInterval(orderTimerId); // Stop timer

                    // Call mark as delivered based on order type
                    if (isFoodOrder) {
                        markVendorOrderAsDelivered(order); // Call function for food orders
                    } else {
                        markOrderAsDelivered(order); // Call function for regular orders
                    }
                };

                // If order status is 'On Transit', show 'Mark as Delivered'
                if (fetchedOrder.status === 'On Transit') {
                    handleOrderStatusUpdate(fetchedOrder);
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

        const payload = {
            status: 'Delivered',
            driverId: driverId
        };

        try {
            let response;

            if (selectedOrder.vendorOrders && selectedOrder.vendorOrders.length > 0) {
                // Handle vendor orders
                console.log("Processing vendor orders for delivery.");

                // Update the main parent order status first
                response = await fetch(`${config.backendUrl}/api/driverUpdateFoodOrderStatus/${orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Failed to update parent food order status');
                }

                // Update each vendor order's status
                for (let vendorOrder of selectedOrder.vendorOrders) {
                    const vendorId = vendorOrder?._id;

                    if (!vendorId) {
                        console.warn("Vendor ID is undefined! Skipping vendor order.");
                        continue;
                    }

                    try {
                        const vendorResponse = await fetch(`${config.backendUrl}/api/updateVendorOrderStatus/${vendorId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ status: 'Delivered' })
                        });

                        if (!vendorResponse.ok) {
                            throw new Error(`Failed to update vendor order status for vendor: ${vendorOrder.vendor}`);
                        }

                        console.log(`Vendor order marked as delivered:`, await vendorResponse.json());
                    } catch (error) {
                        console.error(`Error marking vendor order as delivered:`, error);
                    }
                }
            } else {
                // Handle normal orders
                response = await fetch(`${config.backendUrl}/api/driverUpdateOrderStatus/${orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Failed to update order status');
                }
            }

            const updatedOrder = await response.json();
            setSelectedOrder(updatedOrder);
            alert('Order marked as delivered successfully.');
            return true; // Indicate success
        } catch (error) {
            console.error('Error marking order as delivered:', error);
            alert('Failed to mark order as delivered.');
            return false; // Indicate failure
        }
    };

    const markVendorOrderAsDelivered = async (vendorId) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/markVendorOrderAsDelivered/${vendorId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Delivered' }) // Assuming you want to mark it as 'Delivered'
            });

            if (!response.ok) {
                throw new Error('Failed to mark vendor order as delivered');
            }

            const updatedOrder = await response.json();
            console.log('Vendor order marked as delivered:', updatedOrder);
            // Handle UI update here if needed
        } catch (error) {
            console.error('Error marking vendor order as delivered:', error);
        }
    };

    const handleMarkAsDelivered = async () => {
        const orderId = selectedOrder?.orderId;

        if (!orderId) {
            console.log("No order ID found.");
            alert('No order selected to mark as delivered.');
            return;
        }

        const success = await markOrderAsDelivered(orderId, selectedOrder.driverId);

        if (success) {
            console.log('Order marked as delivered successfully.');
            setSelectedOrder(null); // Clear the currently selected order
            await fetchOrders(); // Fetch new orders from the server
        } else {
            console.log('Failed to mark order as delivered.');
        }
    };


    const revertOrderStatus = async (orderId, driverId) => {
        try {
            let response;

            if (selectedOrder.vendorOrders && selectedOrder.vendorOrders.length > 0) {
                // Revert parent food order status first
                response = await fetch(`${config.backendUrl}/api/revertFoodOrderStatus/${orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ driverId })
                });

                if (!response.ok) {
                    throw new Error('Failed to revert parent food order status');
                }

                // Revert each vendor order status
                for (let vendorOrder of selectedOrder.vendorOrders) {
                    const vendorId = vendorOrder?._id;

                    if (!vendorId) {
                        console.warn("Vendor ID is undefined! Skipping vendor order.");
                        continue;
                    }

                    try {
                        const vendorResponse = await fetch(`${config.backendUrl}/api/revertVendorOrderStatus/${vendorId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ driverId })
                        });

                        if (!vendorResponse.ok) {
                            throw new Error(`Failed to revert vendor order status for vendor: ${vendorOrder.vendor}`);
                        }

                        console.log(`Vendor order status reverted for vendor: ${vendorOrder.vendor}`);
                    } catch (error) {
                        console.error(`Error reverting vendor order status:`, error);
                    }
                }
            } else {
                // Handle normal orders
                response = await fetch(`${config.backendUrl}/api/revertOrderStatus/${orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ driverId })
                });

                if (!response.ok) {
                    throw new Error('Failed to revert order status');
                }
            }

            console.log('Order status reverted for driver:', driverId);
            localStorage.removeItem(`driver_${driverId}_currentOrder`);
            localStorage.removeItem(`driver_${driverId}_timerStartTime`);
            localStorage.removeItem(`driver_${driverId}_remainingTime`);

            // Immediately update the UI
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


    const fetchDispatchedFoodOrders = async (driverId) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/fetchDispatchedFoodOrders/${driverId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch dispatched food orders');
            }

            const dispatchedFoodOrders = await response.json();
            console.log("Dispatched food orders:", dispatchedFoodOrders);

            // Here you can set the dispatched food orders in your state or localStorage
            setSelectedOrder(dispatchedFoodOrders); // Assuming this sets the orders for display

            return dispatchedFoodOrders;
        } catch (error) {
            console.error('Error fetching dispatched food orders:', error);
            return []; // Return an empty array in case of error
        }
    };


    // Handle decline order logic
    const handleDeclineOrder = async () => {
        try {
            let response;
    
            // Stop the timer if it's running
            if (orderTimerId) clearInterval(orderTimerId);
    
            // Check if the selected order has vendor orders (i.e., it's a food order)
            if (selectedOrder.vendorOrders && selectedOrder.vendorOrders.length > 0) {
                console.log("Declining a food order with vendor orders.");
    
                // 1. Update the overall status of the parent food order to "Ready for pick up"
                response = await fetch(`${config.backendUrl}/api/updateFoodOrderStatus/${selectedOrder.orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'Ready for pick up' }), // Revert to 'Ready for pick up'
                });
    
                if (!response.ok) {
                    throw new Error('Failed to update the overall food order status to "Ready for pick up".');
                }
    
                console.log("Overall food order status updated to 'Ready for pick up'.");
    
                // 2. Revert each vendor order's status to "Processed and packed"
                for (let vendorOrder of selectedOrder.vendorOrders) {
                    const vendorId = vendorOrder?._id; // Use vendor order's unique ID
                    console.log(`Attempting to revert status for vendor order ID: ${vendorId}`);
                
                    if (!vendorId) {
                        console.warn("Vendor ID is undefined! Skipping vendor order.");
                        continue; // Skip if vendorId is missing
                    }
                
                    try {
                        const vendorResponse = await fetch(`${config.backendUrl}/api/revertVendorOrderStatus/${vendorId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ status: 'Processed and packed' }),
                        });
                
                        if (!vendorResponse.ok) {
                            const errorDetails = await vendorResponse.json();
                            throw new Error(`Failed to revert vendor order status for vendor: ${vendorOrder.vendor}. Error: ${errorDetails.message}`);
                        }
                
                        console.log(`Vendor order status reverted for vendor: ${vendorOrder.vendor}`);
                    } catch (error) {
                        console.error(`Error reverting vendor order status:`, error);
                    }
                }
            } else {
                // Handle normal orders (no vendor orders)
                response = await fetch(`${config.backendUrl}/api/updateOrderStatus/${selectedOrder.orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'Processed and packed' }), // Revert to 'Processed and packed'
                });
    
                if (!response.ok) {
                    throw new Error('Failed to decline the order');
                }
    
                console.log("Normal order status reverted to 'Processed and packed'.");
            }
    
            // Clear the selected order and refresh the orders list
            setSelectedOrder(null);
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

                                {/* Button to mark as delivered for both food and normal orders */}
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
