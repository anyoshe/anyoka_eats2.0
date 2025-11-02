import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { DriverContext } from '../../../contexts/DriverContext';
import styles from './DriverOrders.module.css';
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
        const response = await axiosInstance.get(
          `${config.backendUrl}/api/driver-notifications/${driver._id}`
        );
        const notifications = response.data.filter(
          (notif) => notif.status === 'ReadyForPickup'
        );
        setNotifications(notifications);

        const uniqueNotifications = notifications.filter(
          (notif, index, self) =>
            index === self.findIndex((n) => n.orderId === notif.orderId)
        );

        const orderPromises = uniqueNotifications.map((notif) =>

          axiosInstance.get(`${config.backendUrl}/api/driver-orders/${notif.orderId}`)
        );
        const orderResponses = await Promise.allSettled(orderPromises);

        const availableOrders = orderResponses
          .filter((res) => res.status === 'fulfilled')
          .map((res) => res.value.data)
          .filter((order) => {
            const allReady =
              Array.isArray(order.subOrders) &&
              order.subOrders.length > 0 &&
              order.subOrders.every((so) => so.status === 'ReadyForPickup');

            return (
              !order.assignedDriver &&
              !(order.delivery?.fee === 0 && order.delivery?.option === 'own') &&
              allReady
            );
          });

        setOrders(availableOrders);
      } catch (error) {
        console.error('Fetch error:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [driver]);

  const handleAcceptOrder = async (orderId) => {
    try {
      await axiosInstance.put(`${config.backendUrl}/api/orders/${orderId}/assign-driver`, {
        driverId: driver._id,
        action: 'accept',
      });
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      alert('Order accepted!');
    } catch (error) {
      alert('Failed to accept order');
    }
  };

  const handleStatusChange = async (subOrderId, newStatus, order) => {
    try {
      await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrderId}/status`, {
        status: newStatus,
        driverId: driver._id,
      });

      setOrders((prev) =>
        prev.map((o) => ({
          ...o,
          subOrders: o.subOrders.map((so) =>
            so._id === subOrderId ? { ...so, status: newStatus } : so
          ),
        }))
      );

      const allPicked = order.subOrders.every((so) => so.status === 'OutForDelivery');
      if (allPicked) {
        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o._id !== order._id));
        }, 1500);
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonList}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) return <p className={styles.noOrders}>No orders available.</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Available Orders</h1>
      <div className={styles.orderGrid}>
        {orders.map((order) => (


          <div className={styles.orderCard}>
            <div className={styles.header}>
              <h3>Order #{order.orderId || order._id.slice(-6)}</h3>
              <span className={styles.time}>
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* EARNINGS */}
            <div className={styles.earnBadge}>
              Earn: <strong>KES {((order.delivery?.fee || 0) * 0.8).toFixed(2)}</strong>
            </div>

            {/* CUSTOMER */}
            <div className={styles.section}>
              <h4>Customer</h4>
              <p>
                <strong>{order.user?.username || 'Guest'}</strong>
                <br />
                <a href={`tel:${order.user?.phoneNumber}`} className={styles.phoneLink}>
                  {order.user?.phoneNumber || 'N/A'}
                </a>
              </p>
              <p className={styles.address}>
                {order.delivery?.location || 'No address'}
              </p>
              {order.delivery?.instructions && (
                <p className={styles.instructions}>
                  <em>“{order.delivery.instructions}”</em>
                </p>
              )}
            </div>

            {/* PAYMENT */}
            <div className={styles.section}>
              <h4>Payment</h4>
              <p>
                <strong>
                  {order.paymentStatus === 'Paid' ? 'Prepaid' : 'Cash on Delivery'}
                </strong>
                {order.paymentStatus !== 'Paid' && order.balanceDue > 0 && (
                  <span className={styles.cashToCollect}>
                    {' '}• Collect: KES {order.balanceDue}
                  </span>
                )}
              </p>
              <p>Total Value: KES {order.total?.toFixed(2) || '0.00'}</p>
            </div>

            {/* SHOPS */}
            <div className={styles.section}>
              <h4>Pickup ({order.subOrders.length} shop{order.subOrders.length > 1 ? 's' : ''})</h4>
              <ul className={styles.shopList}>
                {order.subOrders.map((subOrder, idx) => (
                  <li key={subOrder._id} className={styles.shopItem}>
                    <div>
                      <strong>{subOrder.shop?.businessName || 'Shop'}</strong>
                      {idx === 0 && <span className={styles.firstPickup}> ← First Stop</span>}
                    </div>
                    <div className={styles.shopAddress}>
                      {subOrder.shop?.location || 'No location'}
                    </div>
                    {subOrder.readyBy && (
                      <div className={styles.readyTime}>
                        Ready by {new Date(subOrder.readyBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    {subOrder.status === 'ReadyForPickup' && (
                      <button
                        className={styles.pickupBtn}
                        disabled={order.assignedDriver !== driver._id}
                        onClick={() => handleStatusChange(subOrder._id, 'OutForDelivery', order)}
                      >
                        Pick Up
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* DISTANCE / TIME (Optional – if you have Google Maps API) */}
            {order.estimatedDelivery && (
              <div className={styles.eta}>
                {order.estimatedDelivery.distance} km • {order.estimatedDelivery.duration} min
              </div>
            )}

            {/* ACCEPT BUTTON */}
            {!order.assignedDriver && (
              <button className={styles.acceptBtn} onClick={() => handleAcceptOrder(order._id)}>
                Accept Order
              </button>
            )}
          </div>


        ))}
      </div>
    </div>
  );
};

export default DriverOrders;