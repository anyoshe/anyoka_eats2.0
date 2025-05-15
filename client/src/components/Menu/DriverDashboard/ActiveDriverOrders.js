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

//     const handleStatusChange = async (subOrderId, newStatus, orderId) => {
//         try {
//             await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrderId}/status`, { status: newStatus });

//             setOrders((prevOrders) => {
//                 return prevOrders.map((order) => {
//                     if (order._id !== orderId) return order;

//                     const updatedSubOrders = order.subOrders.map((subOrder) =>
//                         subOrder._id === subOrderId ? { ...subOrder, status: newStatus } : subOrder
//                     );

//                     return {
//                         ...order,
//                         subOrders: updatedSubOrders,
//                     };
//                 });
//             });
//         } catch (error) {
//             console.error('Error updating suborder status:', error);
//         }
//     };

//     const handleMarkAsDelivered = async (order) => {
//         try {
//             for (const subOrder of order.subOrders) {
//                 await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrder._id}/status`, {
//                     status: 'Delivered',
//                 });
//             }

//             setOrders((prevOrders) => prevOrders.filter((o) => o._id !== order._id));
//         } catch (error) {
//             console.error('Error marking suborders as delivered:', error);
//         }
//     };

//     if (loading) return <p>Loading active orders...</p>;
//     if (orders.length === 0) return <p>No active orders found.</p>;

//     return (
//         <div className="active-driver-orders-container">
//             <h2>Active Orders</h2>
//             <div className="active-driver-orders-list">
//                 {orders.map((order) => {
//                     const allOutForDelivery = order.subOrders.every(
//                         (subOrder) => subOrder.status === 'OutForDelivery'
//                     );

//                     return (
//                         <div key={order._id} className="order-card">
//                             <h3>Order ID: {order.orderId || 'N/A'}</h3>
//                             <p>Delivery Location: {order.delivery?.location || 'N/A'}</p>
//                             <p>Delivery Charges (80%): KES {((order.delivery?.fee || 0) * 0.8).toFixed(2)}</p>
//                             <p>
//                                 <strong>Customer:</strong> {order.user?.username || 'N/A'} —{' '}
//                                 <strong>Phone:</strong> {order.user?.phoneNumber || 'N/A'}
//                             </p>

//                             <h4>SubOrders</h4>
//                             <ul>
//                                 {order.subOrders.map((subOrder) => (
//                                     <li key={subOrder._id}>
//                                         <p>
//                                             <strong>Shop:</strong> {subOrder.shop?.businessName || 'N/A'} —{' '}
//                                             <strong>Location:</strong> {subOrder.shop?.location || 'N/A'}
//                                         </p>
//                                         <p>
//                                             <strong>Status:</strong> {subOrder.status}
//                                         </p>
//                                         {subOrder.status === 'ReadyForPickup' && (
//                                             <button
//                                                 onClick={() =>
//                                                     handleStatusChange(subOrder._id, 'OutForDelivery', order._id)
//                                                 }
//                                             >
//                                                 Mark as Picked Up
//                                             </button>
//                                         )}
//                                         {subOrder.status === 'OutForDelivery' && (
//                                             <button
//                                                 disabled
//                                                 style={{
//                                                     backgroundColor: '#ccc',
//                                                     color: '#666',
//                                                     border: 'none',
//                                                     padding: '0.5rem 1rem',
//                                                     borderRadius: '5px',
//                                                     cursor: 'not-allowed',
//                                                 }}
//                                             >
//                                                 OutForDelivery
//                                             </button>
//                                         )}
//                                     </li>
//                                 ))}
//                             </ul>

//                             {allOutForDelivery ? (
//                                 <button
//                                     onClick={() => handleMarkAsDelivered(order)}
//                                     style={{
//                                         backgroundColor: '#28a745',
//                                         color: '#fff',
//                                         border: 'none',
//                                         padding: '0.5rem 1rem',
//                                         borderRadius: '5px',
//                                         cursor: 'pointer',
//                                     }}
//                                 >
//                                     Mark as Delivered
//                                 </button>
//                             ) : (
//                                 <button
//                                     disabled
//                                     style={{
//                                         backgroundColor: '#ccc',
//                                         color: '#666',
//                                         border: 'none',
//                                         padding: '0.5rem 1rem',
//                                         borderRadius: '5px',
//                                         cursor: 'not-allowed',
//                                     }}
//                                 >
//                                     Decline Order
//                                 </button>
//                             )}
//                         </div>
//                     );
//                 })}
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
            await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrderId}/status`, { status: newStatus });

            setOrders((prevOrders) => {
                return prevOrders.map((order) => {
                    if (order._id !== orderId) return order;

                    const updatedSubOrders = order.subOrders.map((subOrder) =>
                        subOrder._id === subOrderId ? { ...subOrder, status: newStatus } : subOrder
                    );

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
            // Update the order status to "Delivered" in the backend
            await axiosInstance.put(`${config.backendUrl}/api/orders/${order._id}/mark-delivered`, {
                driverName: driver.username,
                driverPhone: driver.phoneNumber,
            });

            // Remove the order from the active orders list
            setOrders((prevOrders) => prevOrders.filter((o) => o._id !== order._id));
        } catch (error) {
            console.error('Error marking order as delivered:', error);
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
                            <p>
                                <strong>Customer:</strong> {order.user?.username || 'N/A'} —{' '}
                                <strong>Phone:</strong> {order.user?.phoneNumber || 'N/A'}
                            </p>

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
                                                    handleStatusChange(subOrder._id, 'OutForDelivery', order._id)
                                                }
                                            >
                                                Mark as Picked Up
                                            </button>
                                        )}
                                        {subOrder.status === 'OutForDelivery' && (
                                            <button
                                                disabled
                                                style={{
                                                    backgroundColor: '#ccc',
                                                    color: '#666',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '5px',
                                                    cursor: 'not-allowed',
                                                }}
                                            >
                                                OutForDelivery
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {allOutForDelivery ? (
                                <button
                                    onClick={() => handleMarkAsDelivered(order)}
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Mark as Delivered
                                </button>
                            ) : (
                                <button
                                    disabled
                                    style={{
                                        backgroundColor: '#ccc',
                                        color: '#666',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '5px',
                                        cursor: 'not-allowed',
                                    }}
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