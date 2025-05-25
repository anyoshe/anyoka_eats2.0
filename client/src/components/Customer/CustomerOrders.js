// import React, { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
// import { AuthContext } from '../../contexts/AuthContext';
// import config from '../../config';

// const CustomerOrders = () => {
//   const { user, token } = useContext(AuthContext);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [collapsedOrders, setCollapsedOrders] = useState([]);

//   useEffect(() => {
//     if (!user || !token) return;

//     const fetchOrders = async () => {
//       try {
//         const res = await axios.get(`${config.backendUrl}/api/orders/my-orders`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const newOrders = res.data;

//         // Auto-collapse any orders that are Confirmed Delivered and not already collapsed
//         const confirmedDeliveredIds = newOrders
//           .filter((order) => order.status === 'Confirmed Delivered')
//           .map((order) => order._id);

//         setCollapsedOrders((prev) => [
//           ...new Set([...prev, ...confirmedDeliveredIds]),
//         ]);

//         setOrders(newOrders);
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

//   const handleConfirmReceived = async (orderId) => {
//     try {
//       await axios.put(
//         `${config.backendUrl}/api/orders/${orderId}/confirm-delivery`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setOrders((prevOrders) =>
//         prevOrders.map((order) =>
//           order._id === orderId ? { ...order, status: 'Confirmed Delivered' } : order
//         )
//       );

//       setCollapsedOrders((prev) => [...new Set([...prev, orderId])]);
//     } catch (err) {
//       console.error('Error confirming delivery:', err);
//     }
//   };

//   const getOrderButtonStatus = (order) => {
//     if (order.status === 'Confirmed Delivered') {
//       return 'Confirmed Delivered';
//     }

//     const statuses = order.subOrders.map((sub) => sub.status);
//     const uniqueStatuses = [...new Set(statuses)];

//     if (uniqueStatuses.length === 1) {
//       return uniqueStatuses[0];
//     }

//     const statusPriority = ['Pending', 'OrderReceived', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OutForDelivery', 'Delivered'];
//     return statusPriority.find((status) => statuses.includes(status)) || 'Processing';
//   };

//   const handleToggleCollapse = (orderId) => {
//     setCollapsedOrders((prev) =>
//       prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
//     );
//   };

//   const handleRemoveOrder = (orderId) => {
//     setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
//   };

//   if (loading) return <div>Loading your orders...</div>;

//   return (
//     <div>
//       <h2>Your Orders</h2>
//       {orders.length === 0 && <p>No orders found.</p>}

//       {orders.map((order) => {
//         const isCollapsed = collapsedOrders.includes(order._id);

//         return (
//           <div key={order._id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
//             <h3>Order ID: {order.orderId}</h3>

//             {isCollapsed ? (
//               <div>
//                 <button onClick={() => handleToggleCollapse(order._id)} style={buttonStyle('#007bff')}>
//                   View Order
//                 </button>
//                 <button onClick={() => handleRemoveOrder(order._id)} style={buttonStyle('#dc3545')}>
//                   Remove
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
//                 <p>Total: KES {order.total}</p>
//                 <p>Payment Method: {order.paymentMethod}</p>
//                 <p>Payment Status: {order.paymentStatus}</p>
//                 <p>Delivery: {order.delivery.town}, {order.delivery.location} ({order.delivery.option})</p>

//                 <h4>Sub-Orders (Grouped by Shop):</h4>
//                 <ul>
//                   {order.subOrders.map((sub) => (
//                     <li key={sub._id} style={{ marginBottom: '1rem' }}>
//                       <h5>Shop: {sub.shop?.businessName || 'Unknown Shop'}</h5>
//                       <ul>
//                         {sub.items.map((item) => (
//                           <li key={item._id}>
//                             Product: {item.product?.name} — Qty: {item.quantity} — Price: KES {item.price}
//                           </li>
//                         ))}
//                       </ul>
//                       <button disabled style={buttonStyle('#ccc', true)}>
//                         {sub.status}
//                       </button>
//                       <p><strong>Total:</strong> KES {sub.total}</p>
//                     </li>
//                   ))}
//                 </ul>

//                 {order.status === 'Delivered' ? (
//                   <button
//                     onClick={() => handleConfirmReceived(order._id)}
//                     style={buttonStyle('#28a745')}
//                   >
//                     Confirm Received
//                   </button>
//                 ) : (
//                   <button disabled style={buttonStyle('#ccc', true)}>
//                     {getOrderButtonStatus(order)}
//                   </button>
//                 )}
//               </>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// const buttonStyle = (bg, disabled = false) => ({
//   padding: '0.5rem 1rem',
//   backgroundColor: bg,
//   color: '#fff',
//   border: 'none',
//   borderRadius: '5px',
//   cursor: disabled ? 'not-allowed' : 'pointer',
//   marginRight: '0.5rem',
//   opacity: disabled ? 0.6 : 1,
// });

// export default CustomerOrders;

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import config from '../../config';

const CustomerOrders = () => {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedOrders, setCollapsedOrders] = useState([]);

  useEffect(() => {
    if (!user || !token) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${config.backendUrl}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Only include non-confirmed delivered orders
        const activeOrders = res.data.filter(order => order.status !== 'Confirmed Delivered');
        setOrders(activeOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
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

      // Remove confirmed order from active list
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
    } catch (err) {
      console.error('Error confirming delivery:', err);
    }
  };

  const getOrderButtonStatus = (order) => {
    const statuses = order.subOrders.map((sub) => sub.status);
    const uniqueStatuses = [...new Set(statuses)];

    if (uniqueStatuses.length === 1) {
      return uniqueStatuses[0];
    }

    const statusPriority = ['Pending', 'OrderReceived', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OutForDelivery', 'Delivered'];
    return statusPriority.find((status) => statuses.includes(status)) || 'Processing';
  };

  const handleToggleCollapse = (orderId) => {
    setCollapsedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleRemoveOrder = (orderId) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
  };

  if (loading) return <div>Loading your orders...</div>;

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => {
        const isCollapsed = collapsedOrders.includes(order._id);

        return (
          <div key={order._id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
            <h3>Order ID: {order.orderId}</h3>

            {isCollapsed ? (
              <div>
                <button onClick={() => handleToggleCollapse(order._id)} style={buttonStyle('#007bff')}>
                  View Order
                </button>
                <button onClick={() => handleRemoveOrder(order._id)} style={buttonStyle('#dc3545')}>
                  Remove
                </button>
              </div>
            ) : (
              <>
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
                      <button disabled style={buttonStyle('#ccc', true)}>
                        {sub.status}
                      </button>
                      <p><strong>Total:</strong> KES {sub.total}</p>
                    </li>
                  ))}
                </ul>

                {order.status === 'Delivered' ? (
                  <button
                    onClick={() => handleConfirmReceived(order._id)}
                    style={buttonStyle('#28a745')}
                  >
                    Confirm Received
                  </button>
                ) : (
                  <button disabled style={buttonStyle('#ccc', true)}>
                    {getOrderButtonStatus(order)}
                  </button>
                )}
              </>
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

export default CustomerOrders;
