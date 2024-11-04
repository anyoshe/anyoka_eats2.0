import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import './EarningsDashboard.css';

const EarningsDashboard = ({ driverId }) => {
    const [orders, setOrders] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [isEarningsModalOpen, setEarningsModalOpen] = useState(false);

    const today = new Date().toISOString().split('T')[0]; // Format date to YYYY-MM-DD

    useEffect(() => {
        initializeEarnings(driverId);
    }, [driverId]);

    const initializeEarnings = async (driverId) => {
        if (!driverId) {
            console.error("Driver ID is undefined. Cannot fetch earnings.");
            return;
        }

        try {
            const response = await fetch(`${config.backendUrl}/api/daily-earnings?date=${today}&driverId=${driverId}`);
            const data = await response.json();

            if (response.ok && data.totalEarnings !== undefined) {
                setTotalEarnings(data.totalEarnings);
                setOrders(data.orders || []);
            } else {
                setTotalEarnings(0);
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching daily earnings:", error);
        }
    };

    const toggleEarningsModal = async () => {
        if (!isEarningsModalOpen) {
            await initializeEarnings(driverId);
        }
        setEarningsModalOpen(!isEarningsModalOpen);
    };

    const updateTotalEarnings = async (netPay, driverId, orderId, driverDetails) => {
        try {
            const result = await fetch(`${config.backendUrl}/api/update-earnings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: today,
                    driverId,
                    driverDetails,
                    orderId,
                    netPay,
                    paidStatus: 'Not Paid'
                })
            });

            if (result.ok) {
                setTotalEarnings(prevTotal => prevTotal + netPay);
                setOrders(prevOrders => [...prevOrders, { orderId, netPay, paidStatus: 'Not Paid', date: today }]);
                console.log('Earnings updated successfully');
            } else {
                console.warn("Failed to update earnings:", result.statusText);
            }
        } catch (error) {
            console.error("Error updating earnings:", error);
        }
    };

    return (
        <div className="earnings-dashboard">
            <button className="earnings-summary" onClick={toggleEarningsModal}>
                Total Earnings Today: <span>Ksh {totalEarnings.toFixed(2)}</span>
            </button>

            {isEarningsModalOpen && (
                <div className="earnings-modal">
                    <div className="modal-content">
                        <h4>Earnings Details for {today}</h4>
                        {orders.length > 0 ? (
                            <table className="earnings-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Net Pay</th>
                                        <th>Paid Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.orderId}>
                                            <td>{order.orderId}</td>
                                            <td>Ksh {order.netPay.toFixed(2)}</td>
                                            <td>{order.paidStatus}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No earnings data available for today.</p>
                        )}
                        <button className="modal-close-button" onClick={toggleEarningsModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EarningsDashboard;
