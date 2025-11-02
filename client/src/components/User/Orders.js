import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext';
import styles from './Orders.module.css';
import OrderStatusUpdater from './OrderStatusUpdater';

const Orders = () => {
  const { partner } = useContext(PartnerContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSyncing = useRef(false); // prevent overlapping syncs

  // Fetch all orders
  const fetchOrders = async () => {
    if (!partner?._id) return;
    try {
      const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Optional: poll every 15s for updates
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [partner]);

  // Sync only affected suborder with parent
  const syncSubOrderWithParent = async (subOrderId, parentOrderId) => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      const response = await axios.get(`${config.backendUrl}/api/orders/${parentOrderId}/status`);
      const parentStatus = response.data.status;

      setOrders(prevOrders =>
        prevOrders.map(o => {
          if (o._id === subOrderId) {
            const statusFlow = [
              'Pending',
              'OrderReceived',
              'Preparing',
              'ReadyForPickup',
              'PickedUp',
              'OutForDelivery',
              'Delivered',
              'Confirmed Delivered',
            ];

            const currentIndex = statusFlow.indexOf(o.status);
            const parentIndex = statusFlow.indexOf(parentStatus);

            if (parentIndex > currentIndex) {
              return { ...o, status: parentStatus };
            }
          }
          return o;
        })
      );
    } catch (err) {
      console.error('Suborder sync failed:', err);
    } finally {
      isSyncing.current = false;
    }
  };

  // CSV Export
  const exportCSV = () => {
    const filteredOrders = orders.filter(
      order =>
        order.parentOrder?.status !== 'Confirmed Delivered' &&
        !(
          order.parentOrder?.delivery?.option === 'own' &&
          order.status === 'Confirmed Delivered' &&
          order.paymentStatus === 'Paid'
        )
    );
    if (!filteredOrders.length) return;

    const csvData = filteredOrders.map(o => ({
      orderId: o.parentOrder?.orderId,
      status: o.status,
      total: o.total,
      createdAt: new Date(o.createdAt).toLocaleString(),
      customer: `${o.parentOrder?.delivery?.location || ''}`,
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(r => Object.values(r).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={styles['orders-container']}>
        <div className={styles.skeletonWrapperOrders}>
          <div className={styles.skeletonGridOrders}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCardOrders}>
                <div className={styles.skeletonLineOrders} />
                <div className={styles.skeletonLineShortOrders} />
                <div className={styles.skeletonLineOrders} />
                <div className={styles.skeletonLineShortOrders} />
                <div className={styles.skeletonLineOrders} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div className={styles['orders-container']}>
      <div className={styles['orders-header']}>
        <h2 className={styles.yourOrderTitle}>Your Orders</h2>
        <button onClick={exportCSV} className={styles.CSVbuttton}>
          Export CSV
        </button>
      </div>

      <div className={styles['orders-list']}>
        {orders
          .filter(
            order =>
              order.parentOrder?.status !== 'Confirmed Delivered' &&
              !(
                order.parentOrder?.delivery?.option === 'own' &&
                order.status === 'Confirmed Delivered' &&
                order.paymentStatus === 'Paid'
              )
          )
          .map(order => (
            <div key={order._id} className={styles['order-card']}>
              <h3>Order ID: {order.parentOrder?.orderId || 'N/A'}</h3>
              <p>
                Status: <strong>{order.status}</strong>
              </p>
              <p>
                Total: <strong>KES {order.total}</strong>
              </p>
              <p>
                Payment Status: <strong>{order.paymentStatus}</strong>
              </p>
              <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>

              <h4>Delivery Info</h4>
              <p>Customer Name: {order.parentOrder?.user?.names || 'N/A'}</p>
              <p>Location: {order.parentOrder?.delivery?.location || 'N/A'}</p>
              <p>Shipping Fee: KES {order.parentOrder?.delivery?.fee || 0}</p>

              <h4>Items</h4>
              <ul>
                {order.items.map(item => (
                  <li key={item._id}>
                    <strong>{item.product?.name || 'Product'}</strong> — Qty: {item.quantity} — Price: KES{' '}
                    {item.price}
                  </li>
                ))}
              </ul>

              {['OutForDelivery', 'Delivered'].includes(order.status) && order.deliveredBy && (
                <div>
                  <p>
                    <strong>Driver:</strong> {order.deliveredBy}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.deliveredByPhone}
                  </p>
                </div>
              )}

              <OrderStatusUpdater
                subOrderId={order._id}
                currentStatus={order.status}
                parentOrderId={order.parentOrder?._id}
                onStatusChange={newStatus => {
                  // Optimistically update local order
                  setOrders(prev =>
                    prev.map(o => (o._id === order._id ? { ...o, status: newStatus } : o))
                  );
                  // Sync suborder with parent asynchronously
                  syncSubOrderWithParent(order._id, order.parentOrder?._id);
                }}
                deliveredBy={order.deliveredBy}
                deliveryOption={order.parentOrder?.delivery?.option}
                subOrderTotal={order.total}
                parentBalanceDue={order.balanceDue ?? 0}
                parentTotal={order.total ?? 0}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Orders;
