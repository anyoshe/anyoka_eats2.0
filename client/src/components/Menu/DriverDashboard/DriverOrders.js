import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { DriverContext } from '../../../contexts/DriverContext';
import './DriverOrders.css';
import config from '../../../config';

const DriverOrders = () => {
  const { driver } = useContext(DriverContext);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!driver?._id) return;

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(`${config.backendUrl}/api/driver-notifications/${driver._id}`);
        const notifications = response.data.filter((notif) => notif.status === 'ReadyForPickup');
        setNotifications(notifications);

        // Fetch orders for each notification
        const orderPromises = notifications.map((notif) =>
          axiosInstance.get(`${config.backendUrl}/api/driver-orders/${notif.orderId}`)
        );
        const orderResponses = await Promise.all(orderPromises);

        // Filter out orders that are already assigned to another driver
        const availableOrders = orderResponses
          .map((res) => res.data)
          // .filter((order) => !order.assignedDriver || order.assignedDriver === driver._id);
          .filter((order) => !order.assignedDriver)


        setOrders(availableOrders);
      } catch (error) {
        console.error('Error fetching driver notifications or orders:', error);
        setOrders([]); // Ensure orders is set to an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [driver]);

  const handleAcceptOrder = async (orderId) => {
    try {
      await axiosInstance.put(`${config.backendUrl}/api/orders/${orderId}/assign-driver`, {
        driverId: driver._id,
        action: 'accept',
      });

      // Remove accepted order from the list
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };


  if (loading) return <p>Loading driver orders...</p>;
  if (orders.length === 0) return <p>No orders found.</p>;
  const handleStatusChange = async (subOrderId, newStatus) => {
    try {
      await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrderId}/status`, {
        status: newStatus,
      });

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

  return (
    <div className="driver-orders-container">
      <h2>Driver Orders</h2>
      <div className="driver-orders-list">
        {orders?.map((order) => (
          <div key={order._id} className="order-card">
            <h3>Order ID: {order.orderId || 'N/A'}</h3>
            <p>Delivery Location: {order.delivery?.location || 'N/A'}</p>
            <p>Delivery Charges (80%): KES {((order.delivery?.fee || 0) * 0.8).toFixed(2)}</p>

            <h4>SubOrders</h4>
            <ul>
              {order.subOrders?.map((subOrder) => (
                <li key={subOrder._id}>
                  <p>
                    <strong>Shop:</strong> {subOrder.shop?.businessName || 'N/A'} —{' '}
                    <strong>Location:</strong> {subOrder.shop?.location || 'N/A'}
                  </p>
                  <p>
                    <strong>Status:</strong> {subOrder.status}
                  </p><p><strong>Status:</strong> {subOrder.status}</p>
                  {(() => {
                    const statusFlow = ['ReadyForPickup', 'PickedUp', 'OutForDelivery', 'Delivered'];
                    const currentIndex = statusFlow.indexOf(subOrder.status);
                    const nextStatus = statusFlow[currentIndex + 1];

                    if (nextStatus) {
                      return (
                        <button
                          disabled={order.assignedDriver !== driver._id}
                          onClick={() => handleStatusChange(subOrder._id, nextStatus)}
                        >
                          Mark as {nextStatus.replace(/([A-Z])/g, ' $1').trim()}
                        </button>
                      );
                    }
                    return null;
                  })()}

                </li>
              ))}
            </ul>

            {!order.assignedDriver && (
              <button onClick={() => handleAcceptOrder(order._id)}>Accept Order</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverOrders;