import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import config from '../../config';
import { AuthContext } from '../../contexts/AuthContext';
import './OrderSummaryPage.css'; 

const OrderSummaryPage = () => {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);


  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        console.warn('User token missing');
        setLoading(false);
        return;
      }
  
      try {
        const res = await fetch(`${config.backendUrl}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Response:', res);
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          throw new Error(text);
        }
  
        if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrder();
  }, [orderId, token]);
  
  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="order-summary">
      <h2>Order Summary</h2>
      <p><strong>Order ID:</strong> {order.orderId}</p>
      <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
      <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
      <p><strong>Delivery Location:</strong> {order.delivery?.location} ({order.delivery?.town})</p>
      <p><strong>Delivery Fee:</strong> KES {order.delivery?.fee}</p>
      <p><strong>Delivery Means:</strong> {order.delivery?.option}</p>

      <h3>Items:</h3>
      <ul>
        {order.items.map((item, i) => (
          <li key={i}>
            {item.product.name} - {item.quantity} x KES {item.price}
          </li>
        ))}
      </ul>

      <h3>Total: KES {order.total}</h3>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default OrderSummaryPage;
