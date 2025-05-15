// import React, { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
// import { AuthContext } from '../../contexts/AuthContext';
// import config from '../../config';

// const CustomerOrders = () => {
//   const { user, token } = useContext(AuthContext); // ✅ Get token from context
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user || !token) return;

//     const fetchOrders = async () => {
//       try {
//         const res = await axios.get(`${config.backendUrl}/api/orders/my-orders`, {
//           headers: {
//             Authorization: `Bearer ${token}`, // ✅ Use token in request
//           },
//         });
//         console.log('Fetched Orders:', res.data);
//         setOrders(res.data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Failed to fetch orders:', err);
//         setLoading(false);
//       }
//     };

//     fetchOrders();

//     const interval = setInterval(fetchOrders, 10000);
//     return () => clearInterval(interval);
//   }, [user, token]);

//   const getOrderButtonStatus = (subOrders) => {
//     const statuses = subOrders.map((sub) => sub.status);
//     const uniqueStatuses = [...new Set(statuses)];

//     if (uniqueStatuses.length === 1) {
//       return uniqueStatuses[0]; // All suborders have the same status
//     }

//     // If some suborders are lagging behind, return the lagging status
//     const statusPriority = ['Pending', 'OrderReceived', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OutForDelivery', 'Delivered'];
//     return statusPriority.find((status) => statuses.includes(status));
//   };

//   if (loading) return <div>Loading your orders...</div>;

//   return (
//     <div>
//       <h2>Your Orders</h2>
//       {orders.length === 0 && <p>No orders found.</p>}

//       {orders.map((order) => (
//         <div key={order._id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
//           <h3>Order ID: {order.orderId}</h3>
//           <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
//           <p>Total: KES {order.total}</p>
//           <p>Payment Method: {order.paymentMethod}</p>
//           <p>Payment Status: {order.paymentStatus}</p>
//           <p>Delivery: {order.delivery.town}, {order.delivery.location} ({order.delivery.option})</p>

//           <h4>Sub-Orders (Grouped by Shop):</h4>
//           <ul>
//             {order.subOrders.map((sub) => (
//               <li key={sub._id} style={{ marginBottom: '1rem' }}>
//                 <h5>Shop: {sub.shop?.businessName || 'Unknown Shop'}</h5> {/* Access businessName */}
//                 <ul>
//                   {sub.items.map((item) => (
//                     <li key={item._id}>
//                       Product: {item.product?.name} — Qty: {item.quantity} — Price: KES {item.price}
//                     </li>
//                   ))}
//                 </ul>
//                 <button
//                   disabled // Disable the button
//                   style={{
//                     padding: '0.5rem 1rem',
//                     backgroundColor: '#007bff',
//                     color: '#fff',
//                     border: 'none',
//                     borderRadius: '5px',
//                     cursor: 'not-allowed', // Change cursor to indicate disabled state
//                   }}
//                 >
//                   {sub.status}
//                 </button>
//                 <p><strong>Total:</strong> KES {sub.total}</p>
//               </li>
//             ))}
//           </ul>

//           <button
//             disabled // Disable the button
//             style={{
//               padding: '0.5rem 1rem',
//               backgroundColor: '#28a745',
//               color: '#fff',
//               border: 'none',
//               borderRadius: '5px',
//               cursor: 'not-allowed', // Change cursor to indicate disabled state
//             }}
//           >
//             {getOrderButtonStatus(order.subOrders)}
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CustomerOrders;


import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import config from '../../config';

const CustomerOrders = () => {
  const { user, token } = useContext(AuthContext); // ✅ Get token from context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${config.backendUrl}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Use token in request
          },
        });
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      }
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [user, token]);

  const handleConfirmReceived = async (orderId) => {
    try {
      await axios.put(
        `${config.backendUrl}/api/orders/${orderId}/confirm-delivery`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: 'Confirmed Delivered' } : order
        )
      );
    } catch (err) {
      console.error('Error confirming delivery:', err);
    }
  };

  const getOrderButtonStatus = (subOrders) => {
    const statuses = subOrders.map((sub) => sub.status);
    const uniqueStatuses = [...new Set(statuses)];

    if (uniqueStatuses.length === 1) {
      return uniqueStatuses[0]; // All suborders have the same status
    }

    // If some suborders are lagging behind, return the lagging status
    const statusPriority = ['Pending', 'OrderReceived', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OutForDelivery', 'Delivered'];
    return statusPriority.find((status) => statuses.includes(status));
  };

  if (loading) return <div>Loading your orders...</div>;

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => (
        <div key={order._id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
          <h3>Order ID: {order.orderId}</h3>
          <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
          <p>Total: KES {order.total}</p>
          <p>Payment Method: {order.paymentMethod}</p>
          <p>Payment Status: {order.paymentStatus}</p>
          <p>Delivery: {order.delivery.town}, {order.delivery.location} ({order.delivery.option})</p>

          <h4>Sub-Orders (Grouped by Shop):</h4>
          <ul>
            {order.subOrders.map((sub) => (
              <li key={sub._id} style={{ marginBottom: '1rem' }}>
                <h5>Shop: {sub.shop?.businessName || 'Unknown Shop'}</h5>
                <ul>
                  {sub.items.map((item) => (
                    <li key={item._id}>
                      Product: {item.product?.name} — Qty: {item.quantity} — Price: KES {item.price}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ccc',
                    color: '#666',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'not-allowed',
                  }}
                >
                  {sub.status}
                </button>
                <p><strong>Total:</strong> KES {sub.total}</p>
              </li>
            ))}
          </ul>

          {order.status === 'Delivered' ? (
            <button
              onClick={() => handleConfirmReceived(order._id)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Confirm Received
            </button>
          ) : (
            <button
              disabled
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ccc',
                color: '#666',
                border: 'none',
                borderRadius: '5px',
                cursor: 'not-allowed',
              }}
            >
              {getOrderButtonStatus(order.subOrders)}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomerOrders;