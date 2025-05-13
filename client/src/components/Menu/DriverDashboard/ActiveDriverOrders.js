// import React, { useEffect, useState, useContext } from 'react';
// import axiosInstance from '../../utils/axiosInstance';
// import { DriverContext } from '../../../contexts/DriverContext';
// import './ActiveDriverOrders.css';
// import config from '../../../config';

// const ActiveDriverOrders = () => {
//     const { driver } = useContext(DriverContext);
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (!driver?._id) return;

//         const fetchActiveOrders = async () => {
//             try {
//                 const response = await axiosInstance.get(`${config.backendUrl}/api/driver-active-orders/${driver._id}`);
//                 setOrders(response.data);
//             } catch (error) {
//                 console.error('Error fetching active driver orders:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchActiveOrders();
//     }, [driver]);

//     const handleStatusChange = async (subOrderId, newStatus) => {
//         try {
//             await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrderId}/status`, { status: newStatus });
//             setOrders((prevOrders) =>
//                 prevOrders.map((order) => ({
//                     ...order,
//                     subOrders: order.subOrders.map((subOrder) =>
//                         subOrder._id === subOrderId ? { ...subOrder, status: newStatus } : subOrder
//                     ),
//                 }))
//             );
//         } catch (error) {
//             console.error('Error updating suborder status:', error);
//         }
//     };

//     const handleDeclineOrder = async (orderId) => {
//         try {
//             await axiosInstance.put(`${config.backendUrl}/api/orders/${orderId}/assign-driver`, {
//                 driverId: driver._id,
//                 action: 'decline',
//             });
//             setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
//         } catch (error) {
//             console.error('Error declining order:', error);
//         }
//     };

//     const isDeclineDisabled = (order) =>
//         order.subOrders.some((subOrder) => subOrder.status === 'PickedUp');

//     if (loading) return <p>Loading active orders...</p>;
//     if (orders.length === 0) return <p>No active orders found.</p>;

//     return (
//         <div className="active-driver-orders-container">
//             <h2>Active Orders</h2>
//             <div className="active-driver-orders-list">
//                 {orders.map((order) => (
//                     <div key={order._id} className="order-card">
//                         <h3>Order ID: {order.orderId || 'N/A'}</h3>
//                         <p>Delivery Location: {order.delivery?.location || 'N/A'}</p>
//                         <p>Delivery Charges (80%): KES {((order.delivery?.fee || 0) * 0.8).toFixed(2)}</p>

//                         <h4>SubOrders</h4>
//                         <ul>
//                             {order.subOrders.map((subOrder) => (
//                                 <li key={subOrder._id}>
//                                     <p>
//                                         <strong>Shop:</strong> {subOrder.shop?.businessName || 'N/A'} —{' '}
//                                         <strong>Location:</strong> {subOrder.shop?.location || 'N/A'}
//                                     </p>
//                                     <p>
//                                         <strong>Status:</strong> {subOrder.status}
//                                     </p>
//                                     {(() => {
//                                         const statusFlow = ['ReadyForPickup', 'PickedUp', 'OutForDelivery', 'Delivered'];
//                                         const currentIndex = statusFlow.indexOf(subOrder.status);
//                                         const nextStatus = statusFlow[currentIndex + 1];

//                                         if (nextStatus) {
//                                             return (
//                                                 <button
//                                                     onClick={() => handleStatusChange(subOrder._id, nextStatus)}
//                                                 >
//                                                     Mark as {nextStatus.replace(/([A-Z])/g, ' $1').trim()}
//                                                 </button>
//                                             );
//                                         }

//                                         return null;
//                                     })()}

//                                 </li>
//                             ))}
//                         </ul>

//                         <button
//                             onClick={() => handleDeclineOrder(order._id)}
//                             disabled={isDeclineDisabled(order)}
//                         >
//                             Decline Order
//                         </button>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default ActiveDriverOrders;

import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { DriverContext } from '../../../contexts/DriverContext';
import './ActiveDriverOrders.css';
import config from '../../../config';

const ActiveDriverOrders = () => {
    const { driver } = useContext(DriverContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!driver?._id) return;

        const fetchActiveOrders = async () => {
            try {
                const response = await axiosInstance.get(`${config.backendUrl}/api/driver-active-orders/${driver._id}`);
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching active driver orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveOrders();
    }, [driver]);

    const handleStatusChange = async (subOrderId, newStatus, orderId) => {
        try {
            // Update the single suborder status
            await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrderId}/status`, { status: newStatus });

            // Update local state
            setOrders((prevOrders) => {
                return prevOrders.map((order) => {
                    if (order._id !== orderId) return order;

                    const updatedSubOrders = order.subOrders.map((subOrder) =>
                        subOrder._id === subOrderId ? { ...subOrder, status: newStatus } : subOrder
                    );

                    // If all suborders are now PickedUp, auto update them to OutForDelivery
                    const allPicked = updatedSubOrders.every((s) => s.status === 'PickedUp');

                    if (allPicked) {
                        updatedSubOrders.forEach(async (s) => {
                            await axiosInstance.put(`${config.backendUrl}/api/suborders/${s._id}/status`, {
                                status: 'OutForDelivery',
                            });
                        });

                        // Update local state to reflect OutForDelivery
                        return {
                            ...order,
                            subOrders: updatedSubOrders.map((s) => ({ ...s, status: 'OutForDelivery' })),
                        };
                    }

                    return {
                        ...order,
                        subOrders: updatedSubOrders,
                    };
                });
            });
        } catch (error) {
            console.error('Error updating suborder status:', error);
        }
    };

    const handleMarkAsDelivered = async (order) => {
        try {
            // Set all suborders to Delivered
            for (const subOrder of order.subOrders) {
                await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrder._id}/status`, {
                    status: 'Delivered',
                });
            }

            // Remove order from UI
            setOrders((prevOrders) => prevOrders.filter((o) => o._id !== order._id));
        } catch (error) {
            console.error('Error marking suborders as delivered:', error);
        }
    };

    const handleDeclineOrder = async (orderId) => {
        try {
            await axiosInstance.put(`${config.backendUrl}/api/orders/${orderId}/assign-driver`, {
                driverId: driver._id,
                action: 'decline',
            });
            setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
        } catch (error) {
            console.error('Error declining order:', error);
        }
    };

    if (loading) return <p>Loading active orders...</p>;
    if (orders.length === 0) return <p>No active orders found.</p>;

    return (
        <div className="active-driver-orders-container">
            <h2>Active Orders</h2>
            <div className="active-driver-orders-list">
                {orders.map((order) => {
                    const allOutForDelivery = order.subOrders.every(
                        (subOrder) => subOrder.status === 'OutForDelivery'
                    );

                    return (
                        <div key={order._id} className="order-card">
                            <h3>Order ID: {order.orderId || 'N/A'}</h3>
                            <p>Delivery Location: {order.delivery?.location || 'N/A'}</p>
                            <p>Delivery Charges (80%): KES {((order.delivery?.fee || 0) * 0.8).toFixed(2)}</p>

                            <h4>SubOrders</h4>
                            <ul>
                                {order.subOrders.map((subOrder) => (
                                    <li key={subOrder._id}>
                                        <p>
                                            <strong>Shop:</strong> {subOrder.shop?.businessName || 'N/A'} —{' '}
                                            <strong>Location:</strong> {subOrder.shop?.location || 'N/A'}
                                        </p>
                                        <p>
                                            <strong>Status:</strong> {subOrder.status}
                                        </p>
                                        {subOrder.status === 'ReadyForPickup' && (
                                            <button
                                                onClick={() =>
                                                    handleStatusChange(subOrder._id, 'PickedUp', order._id)
                                                }
                                            >
                                                Mark as Picked Up
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {allOutForDelivery ? (
                                <button onClick={() => handleMarkAsDelivered(order)}>
                                    Mark as Delivered
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleDeclineOrder(order._id)}
                                    disabled={order.subOrders.some((s) => s.status === 'PickedUp')}
                                >
                                    Decline Order
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActiveDriverOrders;
