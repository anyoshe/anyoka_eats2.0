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
    
        orderResponses.forEach((res, i) => {
          const order = res.status === 'fulfilled' ? res.value.data : null;
          if (!order) return;
        
          console.log(`Order ${i}:`, order);
        
          if (!Array.isArray(order.subOrders)) {
            console.warn(`Order ${order._id} has no subOrders array`);
          } else {
            order.subOrders.forEach((so, j) => {
              console.log(`SubOrder ${j} of Order ${i}:`, so);
            });
          }
        });
        
        
        const availableOrders = orderResponses
        .map((res) => res.data)
        .filter((order) => {
          const allSubOrdersReady =
            Array.isArray(order.subOrders) &&
            order.subOrders.length > 0 &&
            order.subOrders.every((so) => so.status === 'ReadyForPickup');
      
          return (
            !order.assignedDriver &&
            !(order.delivery?.fee === 0 && order.delivery?.option === 'own') &&
            allSubOrdersReady
          );
        });
      
        setOrders(availableOrders);
      } catch (error) {
        console.error('Error fetching driver notifications or orders:', error);
        setOrders([]);
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

  if (loading) return <p>Loading driver orders...</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div className="driver-orders-container">
      <h2>Driver Orders</h2>
      <div className="driver-orders-list">
        {orders?.map((order) => (
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
              {order.subOrders?.map((subOrder) => (
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