// import React, { useEffect, useState, useContext } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import config from '../../config';
// import { AuthContext } from '../../contexts/AuthContext';
// import './OrderSummaryPage.css'; 

// const OrderSummaryPage = () => {
//   const { orderId } = useParams();
//   const { user } = useContext(AuthContext);
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const { token } = useContext(AuthContext);


//   useEffect(() => {
//     const fetchOrder = async () => {
//       if (!token) {
//         console.warn('User token missing');
//         setLoading(false);
//         return;
//       }
  
//       try {
//         const res = await fetch(`${config.backendUrl}/api/orders/${orderId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         console.log('Response:', res);
//         const text = await res.text();
//         let data;
//         try {
//           data = JSON.parse(text);
//         } catch (err) {
//           throw new Error(text);
//         }
  
//         if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
//         setOrder(data);
//       } catch (err) {
//         console.error('Error fetching order:', err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchOrder();
//   }, [orderId, token]);
  
//   if (loading) return <p>Loading order...</p>;
//   if (!order) return <p>Order not found.</p>;

//   return (
//     <div className="order-summary">

//       <h2>Order Summary</h2>

//       <div className="order-details-grid">
//         <p>
//           <strong>Order ID: <br></br> 
//           </strong> {order.orderId}
//         </p>

//         <p>
//           <strong>Payment Status: <br></br> 
//           </strong> {order.paymentStatus}
//         </p>

//         <p>
//           <strong>Payment Method: <br></br>
//           </strong> {order.paymentMethod}
//         </p>

//         <p>
//           <strong>Delivery Location: <br></br>
//           </strong> {order.delivery?.location} ({order.delivery?.town})
//         </p>

//         <p>
//           <strong>Delivery Fee:<br></br> 
//           </strong> KES {order.delivery?.fee}
//         </p>

//         <p>
//           <strong>Delivery Means: <br></br>
//           </strong> {order.delivery?.option}
//         </p>
//       </div>

//       <h3>Items:</h3>

//       <ul>
//         {order.items.map((item, i) => (
//           <li key={i}>
//             {item.product.name} 
//             <br></br> 
//             {item.quantity} x KES {item.price}
//           </li>
//         ))}
//       </ul>

//       <p className="total">Total: KES {order.total}</p>

//       <Link to="/">Back to Home</Link>
//     </div>
//   );
// };

// export default OrderSummaryPage;


import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import config from '../../config';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './OrderSummaryPage.module.css'; 

const OrderSummaryPage = () => {
  const { orderId } = useParams();
  const { user, token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className={styles.orderSummary}>
      <h3 className={styles.heading}>Order Summary</h3>

      <div className={styles.orderDetailsGrid}>
        <p className={styles.detailItem}>
          <strong>Order ID:</strong> 
          <br></br>
          {order.orderId}
        </p>
        <p className={styles.detailItem}>
          <strong>Payment Status:</strong> 
          <br></br>
          {order.paymentStatus}
        </p>
        <p className={styles.detailItem}>
          <strong>Payment Method:</strong>
          <br></br>
          {order.paymentMethod}
        </p>
        <p className={styles.detailItem}>
          <strong>Delivery Location:</strong>
          <br></br>
          {order.delivery?.location} ({order.delivery?.town})
        </p>
        <p className={styles.detailItem}>
          <strong>Delivery Fee:</strong>
          <br></br>
          KES {order.delivery?.fee}
        </p>
        <p className={styles.detailItem}>
          <strong>Delivery Means:</strong>
          <br></br>
           {order.delivery?.option}
        </p>
      </div>

      <h4 className={styles.subHeading}>Items:</h4>

      <ul className={styles.itemList}>
        {order.items.map((item, i) => (
          <li key={i} className={styles.item}>
            {item.product.name} 

            <br></br> 

            {item.quantity} x KES {item.price}
          </li>
        ))}
      </ul>

      <p className={styles.total}>Total: KES {order.total}</p>

      <Link to="/" className={styles.backLink}>Back to Home</Link>
    </div>
  );
};

export default OrderSummaryPage;

