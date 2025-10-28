import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import config from '../../config';
import { AuthContext } from '../../contexts/AuthContext';
import Invoice from './Invoice.Modal';
import styles from './OrderSummaryPage.module.css';

const OrderSummaryPage = () => {
  const { orderId } = useParams();
  const { token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${config.backendUrl}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, token]);

 const invoiceData = useMemo(() => {
  if (!order) return null;

  // Use EXACT values from DB
  const subtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const vat = subtotal * 0.16;
  const total = order.total; // ← DB total
  const paid = order.paid;   // ← DB paid
  const balance = order.balanceDue; // ← DB balance

  return {
    date: new Date(order.createdAt).toLocaleDateString(),
    invoiceNumber: order.orderId,
    description: `${order.delivery?.option === 'own' ? 'Pickup Order' : 'Delivery Order'} | ${order.paymentMethod}`,
    items: order.items.map((item) => ({
      description: item.product?.name || 'Item',
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    })),
    vat,
    subtotal,
    total,
    paid,
    balance,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentType: order.paymentType,
    delivery: order.delivery,
    customer: order.user,
  };
}, [order]);

  if (loading) return <p>Loading order...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!invoiceData) return <p>Order not found.</p>;

  return (
    <div className={styles.invoicePage}>
      <Invoice {...invoiceData} />
      <div className={styles.navigation}>
        <Link to="/" className={styles.backLink}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
