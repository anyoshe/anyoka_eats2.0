// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import config from '../../config';

// const statusFlow = [
//   'Pending',
//   'OrderReceived',
//   'Preparing',
//   'ReadyForPickup',
//   'PickedUp',
//   'OutForDelivery',
//   'Delivered',
// ];

// const OrderStatusUpdater = ({ subOrderId, currentStatus, parentOrderId, onStatusChange }) => {
//   const [loading, setLoading] = useState(false);
//   const [parentStatus, setParentStatus] = useState(null);

//   const getNextStatus = () => {
//     const currentIndex = statusFlow.indexOf(currentStatus);
//     return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
//   };

//   useEffect(() => {
//     if (currentStatus === 'OutForDelivery' && parentOrderId) {
//       const fetchParentStatus = async () => {
//         try {
//           const response = await axios.get(`${config.backendUrl}/api/orders/${parentOrderId}/status`);
//           setParentStatus(response.data.status);
//         } catch (error) {
//           console.error('Error fetching parent order status:', error);
//         }
//       };

//       fetchParentStatus();
//     }
//   }, [currentStatus, parentOrderId]);

//   const handleStatusUpdate = async () => {
//     const nextStatus = getNextStatus();
//     if (!nextStatus) return;

//     setLoading(true);
//     try {
//       const response = await axios.put(
//         `${config.backendUrl}/api/suborders/${subOrderId}/status`,
//         { status: nextStatus }
//       );
//       onStatusChange(response.data.status);
//     } catch (error) {
//       console.error('Error updating status:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const nextStatus = getNextStatus();
//   const isDelivered = currentStatus === 'OutForDelivery' && parentStatus === 'Delivered';
//   const isConfirmedDelivered = parentStatus === 'Confirmed Delivered';

//   if (isConfirmedDelivered) return null; // Don't show updater at all

//   return (
//     <div>
//       <p><strong>Status:</strong> {currentStatus}</p>
//       {nextStatus && (
//         <button
//           onClick={handleStatusUpdate}
//           disabled={loading || isDelivered}
//         >
//           {loading
//             ? 'Updating...'
//             : isDelivered
//             ? 'Delivered'
//             : `Mark as ${nextStatus}`}
//         </button>
//       )}
//     </div>
//   );
// };

// export default OrderStatusUpdater;


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../../config';

const statusFlow = [
  'Pending',
  'OrderReceived',
  'Preparing',
  'ReadyForPickup',
  'PickedUp',
  'OutForDelivery',
  'Delivered',
  'Confirmed Delivered',
];

const OrderStatusUpdater = ({
  subOrderId,
  currentStatus,
  parentOrderId,
  onStatusChange,
  deliveredBy,
}) => {
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const statusRef = useRef(currentStatus);

  useEffect(() => {
    statusRef.current = currentStatus;
  }, [currentStatus]);

  const updateSubOrderStatus = async (newStatus) => {
    try {
      const response = await axios.put(
        `${config.backendUrl}/api/suborders/${subOrderId}/status`,
        { status: newStatus }
      );
      onStatusChange(response.data.status);
    } catch (error) {
      console.error('Error auto-updating suborder status:', error);
    }
  };

  const fetchAndSyncWithParent = async () => {
    try {
      const res = await axios.get(`${config.backendUrl}/api/order/${parentOrderId}/status`);
      const parentStatus = res.data.status;
      const current = statusRef.current;

      if (parentStatus === 'Delivered' && current === 'OutForDelivery') {
        await updateSubOrderStatus('Delivered');
      } else if (parentStatus === 'Confirmed Delivered' && current !== 'Confirmed Delivered') {
        await updateSubOrderStatus('Confirmed Delivered');
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  useEffect(() => {
    if (deliveredBy && currentStatus === 'OutForDelivery') {
      intervalRef.current = setInterval(fetchAndSyncWithParent, 8000);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [deliveredBy, currentStatus, parentOrderId]);

  const getNextStatus = () => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `${config.backendUrl}/api/suborders/${subOrderId}/status`,
        { status: nextStatus }
      );
      onStatusChange(response.data.status);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStatus = getNextStatus();

  if (currentStatus === 'Confirmed Delivered') return null;

  return (
    <div>
      <p><strong>Status:</strong> {currentStatus}</p>
      {nextStatus && (
        <button
          onClick={handleStatusUpdate}
          disabled={loading || (currentStatus === 'OutForDelivery' && deliveredBy)}
        >
          {loading
            ? 'Updating...'
            : currentStatus === 'OutForDelivery' && deliveredBy
            ? 'Syncing with parent...'
            : `Mark as ${nextStatus}`}
        </button>
      )}
    </div>
  );
};

export default OrderStatusUpdater;