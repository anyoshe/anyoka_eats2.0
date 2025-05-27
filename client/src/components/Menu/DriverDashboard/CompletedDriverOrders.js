import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { DriverContext } from '../../../contexts/DriverContext';
import config from '../../../config';
import styles from './CompletedDriverOrders.module.css';

const CompletedDriverOrders = () => {
    const { driver } = useContext(DriverContext);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        if (!driver?._id) return;

        const fetchCompletedOrders = async () => {
            try {
                const response = await axiosInstance.get(
                    `${config.backendUrl}/api/driver-completed-orders/${driver._id}`
                );
                const filtered = response.data.filter(order => order.status === 'Confirmed Delivered');
                setCompletedOrders(filtered);
            } catch (error) {
                console.error('Error fetching completed driver orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedOrders();
    }, [driver]);

    const filterByDate = (orders, date) => {
        if (!date) return orders;
        return orders.filter(order => {
            const deliveredDate = order.deliveredAt
                ? new Date(order.deliveredAt).toISOString().split('T')[0]
                : '';
            return deliveredDate === date;
        });
    };

    const filteredOrders = filterByDate(completedOrders, selectedDate);

    const totalDeliveryCharge = filteredOrders.reduce((sum, order) => {
        const fee = typeof order.delivery?.fee === 'number' ? order.delivery.fee : 0;
        return sum + fee;
    }, 0);

    const totalDriverEarnings = totalDeliveryCharge * 0.8;

    if (loading) return <p>Loading completed orders...</p>;
    if (completedOrders.length === 0) return <p>No completed orders found.</p>;

    return (
        <div className={styles["completed-driver-orders-container"]}>
            <h2>Completed Orders</h2>

            <div className={styles["filter-section"]}>
                <label htmlFor="dateFilter">Filter by Date:</label>
                <input
                    type="date"
                    id="dateFilter"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            <table className={styles["completed-orders-table"]}>
                <thead>
                    <tr>
                        <th>Date Completed</th>
                        <th>Order ID</th>
                        <th>Total Delivery Charge (KES)</th>
                        <th>Driver Earnings (80%)</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => {
                        const deliveryFee = typeof order.delivery?.fee === 'number' ? order.delivery.fee : 0;
                        const earnings = deliveryFee * 0.8;
                        const dateCompleted = order.deliveredAt
                            ? new Date(order.deliveredAt).toLocaleDateString()
                            : 'N/A';

                        return (
                            <tr key={order._id}>
                                <td>{dateCompleted}</td>
                                <td>{order.orderId || 'N/A'}</td>
                                <td>{deliveryFee.toFixed(2)}</td>
                                <td>{earnings.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="2"><strong>Totals</strong></td>
                        <td><strong>{totalDeliveryCharge.toFixed(2)}</strong></td>
                        <td><strong>{totalDriverEarnings.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default CompletedDriverOrders;
