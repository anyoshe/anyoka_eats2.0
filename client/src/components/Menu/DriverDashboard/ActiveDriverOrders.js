// src/components/driver/ActiveDriverOrders.jsx
import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { DriverContext } from '../../../contexts/DriverContext';
// import styles from './DriverOrders.module.css'; 
import config from '../../../config';
import { io } from 'socket.io-client';
import styles from './ActiveDriverOrders.module.css';


const ActiveDriverOrders = () => {
  const { driver } = useContext(DriverContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(null); // { orderId }
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [polling, setPolling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch active orders function
  const fetchActiveOrders = async () => {
    try {
      const res = await axiosInstance.get(
        `${config.backendUrl}/api/driver-active-orders/${driver._id}`
      );
      // Safety: ensure res.data is array
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data.filter((o) => o.status !== 'Confirmed Delivered'));
    } catch (err) {
      console.error('Fetch active orders error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActiveOrders();
  };

  useEffect(() => {
    if (!driver?._id) return;

    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 10000);
    return () => clearInterval(interval);
  }, [driver]);

  // Enhanced socket integration for real-time payment updates
  useEffect(() => {
    if (!driver?._id) return;

    const socket = io(config.backendUrl);

    socket.on('payment-success', async (data) => {
      if (data.orderId) {
        alert(`💰 ${data.message}`);

        // Immediate optimistic update
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === data.orderId
              ? {
                ...order,
                paymentStatus: 'Paid',
                balanceDue: 0,
                paid: order.total // Assume full payment
              }
              : order
          )
        );

        // Verify with API call after a short delay
        setTimeout(() => {
          fetchActiveOrders();
        }, 1000);
      }
    });

    // Handle payment failures as well
    socket.on('payment-failed', (data) => {
      if (data.orderId) {
        alert(`❌ Payment failed: ${data.message}`);
        setPolling(false);
      }
    });

    return () => socket.disconnect();
  }, [driver?._id]);

  // Mark a single suborder status (e.g., ReadyForPickup -> OutForDelivery)
  const handleStatusChange = async (subOrderId, newStatus, orderId) => {
    try {
      await axiosInstance.put(`${config.backendUrl}/api/suborders/${subOrderId}/status`, {
        status: newStatus,
        driverId: driver._id,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id !== orderId) return order;

          const updatedSubOrders = order.subOrders.map((subOrder) =>
            subOrder._id === subOrderId ? { ...subOrder, status: newStatus } : subOrder
          );

          return { ...order, subOrders: updatedSubOrders };
        })
      );
    } catch (err) {
      console.error('Failed to update suborder status:', err);
      alert('Failed to update suborder status');
    }
  };

  // Decline an order (driver changes mind)
  const handleDeclineOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to decline this order?')) return;

    try {
      await axiosInstance.put(`${config.backendUrl}/api/orders/${orderId}/assign-driver`, {
        driverId: driver._id,
        action: 'decline',
      });

      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      alert('Order declined');
    } catch (err) {
      console.error('Decline failed:', err);
      alert('Failed to decline order');
    }
  };

  // When driver attempts to mark full order as delivered
  const handleMarkAsDelivered = async (order) => {
    if (order.balanceDue > 0) {
      // prompt to collect balance
      setShowPaymentPrompt({ orderId: order._id });
      return;
    }
    await finalizeDelivery(order);
  };

  const finalizeDelivery = async (order) => {
    try {
      await axiosInstance.put(`${config.backendUrl}/api/orders/${order._id}/mark-delivered`, {
        driverName: driver.username,
        driverPhone: driver.phoneNumber,
      });
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      alert('🎉 Order confirmed delivered & paid!');
    } catch (err) {
      console.error('Finalize error:', err);
      alert('Finalize failed: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  // Send STK Push to collect remaining balance
  const handlePlatformBalancePayment = async () => {
    if (!mpesaNumber.match(/^254[0-9]{9}$/)) {
      alert('Enter valid M-Pesa number (2547...)');
      return;
    }
    setPolling(true);
    const order = orders.find((o) => o._id === showPaymentPrompt.orderId);

    try {
      await axiosInstance.post(`${config.backendUrl}/api/mpesa/pay`, {
        phoneNumber: mpesaNumber,
        amount: order.balanceDue,
        orderId: order._id,
        paymentType: 'balance',
      });

      alert('STK Push sent! Waiting for customer to enter PIN...');

      // Close the payment prompt after sending STK push
      setShowPaymentPrompt(null);
      setMpesaNumber('');

    } catch (err) {
      console.error('STK push failed:', err);
      alert('M-Pesa failed: ' + (err.response?.data?.error || err.message));
      setPolling(false);
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

  if (!orders.length) return <p className={styles.noOrders}>No active orders found.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        {/* <h1 className={styles.title}>Active Orders</h1> */}
        <button
          className={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div className={styles.orderGrid}>
        {orders.map((order) => {
          const allOutForDelivery = order.subOrders.every((so) => so.status === 'OutForDelivery');
          const anyPickedUp = order.subOrders.some((so) => ['OutForDelivery', 'Delivered'].includes(so.status));

          return (
            <div key={order._id} className={styles.orderCard}>
              {/* Header */}
              <div className={styles.header}>
                <h3>Order #{order.orderId || order._id.slice(-6)}</h3>
                <span className={styles.time}>
                  {new Date(order.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Earnings badge */}
              <div className={styles.earnBadge}>
                Earn: <strong>KES {((order.delivery?.fee || 0) * 0.8).toFixed(2)}</strong>
              </div>

              {/* Customer */}
              <div className={styles.section}>
                <h4>Customer</h4>
                <p>
                  <strong>{order.user?.username || 'Guest'}</strong>
                  <br />
                  <a href={`tel:${order.user?.phoneNumber}`} className={styles.phoneLink}>
                    {order.user?.phoneNumber || 'N/A'}
                  </a>
                </p>
              </div>

              {/* Delivery */}
              <div className={styles.section}>
                <h4>Delivery</h4>
                <p>Town: {order.delivery?.town || 'N/A'}</p>
                <p>Location: {order.delivery?.location || 'N/A'}</p>
                <p>Option: {order.delivery?.option || 'N/A'}</p>
                <p>Fee: KES {(order.delivery?.fee || 0).toFixed(2)}</p>
              </div>

              {/* Payment */}
              <div className={styles.section}>
                <h4>Payment</h4>
                <p>Method: {order.paymentMethod}</p>
                <p>Status:
                  <span className={
                    order.paymentStatus === 'Paid' ? styles.paidStatus :
                      order.paymentStatus === 'Pending' ? styles.pendingStatus :
                        styles.defaultStatus
                  }>
                    {order.paymentStatus}
                  </span>
                </p>
                <p>Paid: <strong>KES {order.paid}</strong> / Total: <strong>KES {order.total}</strong></p>
                {order.balanceDue > 0 && <p className={styles.cashToCollect}>Collect Balance: KES {order.balanceDue}</p>}
              </div>

              {/* Suborders */}
              <div className={styles.section}>
                <h4>Pickups ({order.subOrders.length})</h4>
                <ul className={styles.shopList}>
                  {order.subOrders.map((so, idx) => (
                    <li key={so._id} className={styles.shopItem}>
                      <div>
                        <strong>{so.shop?.businessName || so.shop?.shopName || 'Shop'}</strong>
                        {idx === 0 && !anyPickedUp && <span className={styles.firstPickup}> ← First Stop</span>}
                      </div>
                      <div className={styles.shopAddress}>{so.shop?.location || 'No location'}</div>
                      <p className={styles.status}>
                        Status: <span className={styles[so.status.toLowerCase()] || styles.default}>{so.status}</span>
                      </p>

                      {so.status === 'ReadyForPickup' && (
                        <button
                          className={styles.pickupBtn}
                          onClick={() => handleStatusChange(so._id, 'OutForDelivery', order._id)}
                          disabled={polling}
                        >
                          Pick Up
                        </button>
                      )}

                      {so.status === 'OutForDelivery' && (
                        <button className={styles.disabledBtn} disabled>
                          Out For Delivery
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                {allOutForDelivery ? (
                  order.balanceDue === 0 && order.paymentStatus === 'Paid' ? (
                    <button
                      className={styles.confirmBtn}
                      onClick={() => finalizeDelivery(order)}
                    >
                      ✅ Confirm Delivered
                    </button>
                  ) : (
                    <button
                      className={styles.acceptBtn}
                      onClick={() => handleMarkAsDelivered(order)}
                      disabled={polling}
                    >
                      {polling ? 'Processing...' : 'Mark as Delivered'}
                    </button>
                  )
                ) : !anyPickedUp ? (
                  <button
                    className={styles.declineBtn}
                    onClick={() => handleDeclineOrder(order._id)}
                  >
                    Decline Order
                  </button>
                ) : (
                  <button className={styles.disabledBtn} disabled>
                    Awaiting Pickups
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {showPaymentPrompt && (
        <div className={styles.paymentModal}>
          <div
            className={styles.modalOverlay}
            onClick={() => {
              setShowPaymentPrompt(null);
              setMpesaNumber('');
              setPolling(false);
            }}
          />
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>💳 Collect Balance Payment</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowPaymentPrompt(null);
                  setMpesaNumber('');
                  setPolling(false);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.balanceAmount}>
                Customer owes <strong>KES {orders.find((o) => o._id === showPaymentPrompt.orderId)?.balanceDue}</strong>
              </p>

              <div className={styles.inputGroup}>
                <label htmlFor="mpesaNumber" className={styles.inputLabel}>
                  M-Pesa Phone Number
                </label>
                <input
                  id="mpesaNumber"
                  type="tel"
                  placeholder="2547xxxxxxxx"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  className={styles.mpesaInput}
                  disabled={polling}
                />
                <small className={styles.inputHelp}>
                  Format: 2547XXXXXXXX (12 digits)
                </small>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.modalActions}>
                <button
                  className={styles.stkBtn}
                  onClick={handlePlatformBalancePayment}
                  disabled={polling || !mpesaNumber}
                >
                  {polling ? '⏳ Sending STK Push...' : '🚀 Send STK Push'}
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowPaymentPrompt(null);
                    setMpesaNumber('');
                    setPolling(false);
                  }}
                  disabled={polling}
                >
                  Cancel
                </button>
              </div>

              {polling && (
                <div className={styles.pollingIndicator}>
                  <div className={styles.loadingSpinner}></div>
                  <p className={styles.pollingNote}>
                    Waiting for customer to enter PIN... The page will update automatically when payment is confirmed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveDriverOrders;