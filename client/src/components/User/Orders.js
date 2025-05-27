import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext';
import styles from './Orders.module.css'; 
import OrderStatusUpdater from './OrderStatusUpdater';

const Orders = () => {
  const { partner } = useContext(PartnerContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to sync suborders with parent orders
  const syncSubOrdersWithParent = async () => {
    try {
      const updatedOrders = await Promise.all(
        orders.map(async (order) => {
          // Sync only suborders with statuses from 'OutForDelivery' onwards
          if (
            ['OutForDelivery', 'Delivered'].includes(order.status) &&
            order.parentOrder?._id &&
            order.parentOrder.assignedDriver
          ) {
            const response = await axios.get(`${config.backendUrl}/api/orders/${order.parentOrder._id}/status`);
            const parentStatus = response.data.status;
  
            if (parentStatus && parentStatus !== order.status) {
              // Update the suborder's status to match the parent order's status
              await axios.put(`${config.backendUrl}/api/suborders/${order._id}/status`, {
                status: parentStatus,
              });
  
              return { ...order, status: parentStatus };
            }
          }
          return order;
        })
      );
  
      // Filter out suborders whose parent order is at 'Confirmed Delivered'
      const filteredOrders = updatedOrders.filter(
        (order) =>
          !(
            order.parentOrder?.status === 'Confirmed Delivered' &&
            order.parentOrder?.deliveredBy
          )
      );
  
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error syncing suborders with parent orders:', error);
    }
  };

  useEffect(() => {
    if (!partner?._id) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [partner]);

  useEffect(() => {
    if (orders.length > 0) {
      syncSubOrdersWithParent();
    }
  }, [orders]);

  const exportCSV = () => {
    const filteredOrders = orders.filter(
      (order) => order.parentOrder?.status !== 'Confirmed Delivered'
    );

    const csvData = filteredOrders.map((order) => ({
      orderId: order.parentOrder?.orderId,
      status: order.status,
      total: order.total,
      createdAt: new Date(order.createdAt).toLocaleString(),
      customer: `${order.parentOrder?.delivery?.location || ''}`,
    }));

    if (csvData.length === 0) return;

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map((row) => Object.values(row).join(',')).join('\n');
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

  if (loading) return <p>Loading orders...</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div className={styles["orders-container"]}>
      <div className={styles["orders-header"]}>
        <h2>Your Orders</h2>
        <button onClick={exportCSV}>Export CSV</button>
      </div>
      <div className={styles["orders-list"]}>
        {orders
          .filter(
            (order) =>
              !(
                order.parentOrder?.status === 'Confirmed Delivered' &&
                order.parentOrder?.deliveredBy
              )
          )
          .map((order) => (
            <div key={order._id} className={styles["order-card"]}>
              <h3>Order ID: {order.parentOrder?.orderId || 'N/A'}</h3>
              <p>Status: <strong>{order.status}</strong></p>
              <p>Total: <strong>KES {order.total}</strong></p>
              <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
  
              <h4>Delivery Info</h4>
              <p>Customer Name: {order.parentOrder?.user?.names || 'N/A'}</p>
              <p>Location: {order.parentOrder?.delivery?.location || 'N/A'}</p>
              <p>Shipping Fee: KES {order.parentOrder?.delivery?.fee || 0}</p>
  
              <h4>Items</h4>
              <ul>
                {order.items.map((item) => (
                  <li key={item._id}>
                    <strong>{item.product?.name || 'Product'}</strong> — Qty: {item.quantity} — Price: KES {item.price}
                  </li>
                ))}
              </ul>
  
              {['OutForDelivery', 'Delivered'].includes(order.status) && order.deliveredBy && (
                <div>
                  <p><strong>Driver:</strong> {order.deliveredBy}</p>
                  <p><strong>Phone:</strong> {order.deliveredByPhone}</p>
                </div>
              )}
  
              <OrderStatusUpdater
                subOrderId={order._id}
                currentStatus={order.status}
                parentOrderId={order.parentOrder?._id}
                deliveredBy={order.parentOrder?.assignedDriver}
                onStatusChange={(newStatus) => {
                  setOrders((prevOrders) =>
                    prevOrders.map((o) =>
                      o._id === order._id ? { ...o, status: newStatus } : o
                    )
                  );
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
export default Orders;