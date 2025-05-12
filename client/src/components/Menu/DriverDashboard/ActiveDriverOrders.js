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

    const handleStatusChange = async (subOrderId, newStatus) => {
        try {
            await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrderId}/status`, { status: newStatus });
            setOrders((prevOrders) =>
                prevOrders.map((order) => ({
                    ...order,
                    subOrders: order.subOrders.map((subOrder) =>
                        subOrder._id === subOrderId ? { ...subOrder, status: newStatus } : subOrder
                    ),
                }))
            );
        } catch (error) {
            console.error('Error updating suborder status:', error);
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

    const isDeclineDisabled = (order) =>
        order.subOrders.some((subOrder) => subOrder.status === 'PickedUp');

    if (loading) return <p>Loading active orders...</p>;
    if (orders.length === 0) return <p>No active orders found.</p>;

    return (
        <div className="active-driver-orders-container">
            <h2>Active Orders</h2>
            <div className="active-driver-orders-list">
                {orders.map((order) => (
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
                                    {(() => {
                                        const statusFlow = ['ReadyForPickup', 'PickedUp', 'OutForDelivery', 'Delivered'];
                                        const currentIndex = statusFlow.indexOf(subOrder.status);
                                        const nextStatus = statusFlow[currentIndex + 1];

                                        if (nextStatus) {
                                            return (
                                                <button
                                                    onClick={() => handleStatusChange(subOrder._id, nextStatus)}
                                                >
                                                    Mark as {nextStatus.replace(/([A-Z])/g, ' $1').trim()}
                                                </button>
                                            );
                                        }

                                        return null; // No button if status is already 'Delivered'
                                    })()}

                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleDeclineOrder(order._id)}
                            disabled={isDeclineDisabled(order)}
                        >
                            Decline Order
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveDriverOrders;