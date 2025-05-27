import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import config from '../../config';

const CustomerPastOrders = () => {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!user || !token) return;

    const fetchPastOrders = async () => {
      try {
        const res = await axios.get(`${config.backendUrl}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const pastOrders = res.data.filter(order => order.status === 'Confirmed Delivered');
        setOrders(pastOrders);
      } catch (err) {
        console.error('Failed to fetch past orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPastOrders();
    const interval = setInterval(fetchPastOrders, 20000);
    return () => clearInterval(interval);
  }, [user, token]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (loading) return <div>Loading past orders...</div>;
  if (orders.length === 0) return <p>No past orders found.</p>;

  return (
    <div>
  <h2>Past Orders</h2>
  {orders.map((order) => {
    const isExpanded = expandedOrderId === order._id;
    const deliveryFee = order.delivery?.fee || 0;
    const totalWithDelivery = order.total + deliveryFee;

    return (
      <div key={order._id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p><strong>Date:</strong> {new Date(order.deliveredAt || order.updatedAt || order.createdAt).toLocaleDateString()}</p>
            <p><strong>Order #:</strong> {order.orderId}</p>
            <p><strong>Amount:</strong> KES {totalWithDelivery} <small>(Order: {order.total} + Delivery: {deliveryFee})</small></p>
          </div>
          <button onClick={() => toggleExpand(order._id)} style={buttonStyle('#007bff')}>
            {isExpanded ? 'Hide' : 'View'}
          </button>
        </div>


            {isExpanded && (
              <div style={{ marginTop: '1rem' }}>
                <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                <p><strong>Delivery:</strong> {order.delivery.town}, {order.delivery.location} ({order.delivery.option})</p>

                <h4>Items:</h4>
                <ul>
                  {order.items.map((item) => (
                    <li key={item._id}>
                      <strong>Product:</strong> {item.product?.name || 'Unknown'}<br />
                      <strong>Shop:</strong> {item.shop?.shopName || 'Unknown'}<br />
                      <strong>Qty:</strong> {item.quantity} — <strong>Price:</strong> KES {item.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const buttonStyle = (bg, disabled = false) => ({
  padding: '0.5rem 1rem',
  backgroundColor: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  marginRight: '0.5rem',
  opacity: disabled ? 0.6 : 1,
});

export default CustomerPastOrders;
