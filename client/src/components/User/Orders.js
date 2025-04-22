// src/components/AccountPage/Orders.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext';
import './Orders.css'; // Optional styling
import OrderStatusUpdater from './OrderStatusUpdater';

const Orders = () => {
    const { partner } = useContext(PartnerContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const exportCSV = () => {
        const csvData = orders.map(order => {
            return {
                orderId: order.parentOrder?.orderId,
                status: order.status,
                total: order.total,
                createdAt: new Date(order.createdAt).toLocaleString(),
                customer: `${order.parentOrder?.delivery?.location || ''}`,
            };
        });

        const headers = Object.keys(csvData[0]).join(',');
        const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
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
        <div className="orders-container">
            <div className="orders-header">
                <h2>Your Orders</h2>
                <button onClick={exportCSV}>Export CSV</button>
            </div>
            <div className="orders-list">
                {orders.map((order) => (
                    <div key={order._id} className="order-card">
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

                        <OrderStatusUpdater
                            subOrderId={order._id}
                            currentStatus={order.status}
                            onStatusChange={(newStatus) => {
                                // Update the local state to reflect the new status
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
};

export default Orders;
