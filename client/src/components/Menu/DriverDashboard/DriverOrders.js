import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { DriverContext } from '../../../contexts/DriverContext';
import './DriverOrders.css';

const DriverOrders = () => {
  const { driver } = useContext(DriverContext);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!driver?._id) return;

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(`/api/driver-notifications/${driver._id}`);
        const notifications = response.data.filter((notif) => notif.status === 'ReadyForPickup');
        setNotifications(notifications);

        // Fetch orders for each notification
        const orderPromises = notifications.map((notif) =>
          axiosInstance.get(`/api/driver-orders/${notif.orderId}`)
        );
        const orderResponses = await Promise.all(orderPromises);
        setOrders(orderResponses.map((res) => res.data));
      } catch (error) {
        console.error('Error fetching driver notifications or orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [driver]);

  const handleStatusChange = async (subOrderId, newStatus) => {
    try {
      await axiosInstance.put(`/api/suborders/${subOrderId}/status`, { status: newStatus });
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

  if (loading) return <p>Loading driver orders...</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div className="driver-orders-container">
      <h2>Driver Orders</h2>
      <div className="driver-orders-list">
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
                  <button
                    onClick={() => handleStatusChange(subOrder._id, 'PickedUp')}
                    disabled={subOrder.status !== 'ReadyForPickup'}
                  >
                    Mark as Picked Up
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverOrders;