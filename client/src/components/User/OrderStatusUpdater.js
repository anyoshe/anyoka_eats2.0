// src/components/OrderStatusUpdater.js
import React, { useState } from 'react';
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
];

const OrderStatusUpdater = ({ subOrderId, currentStatus, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const getNextStatus = () => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1
      ? statusFlow[currentIndex + 1]
      : null;
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

  return (
    <div>
      <p>
        <strong>Status:</strong> {currentStatus}
      </p>
      {nextStatus && (
        <button onClick={handleStatusUpdate} disabled={loading}>
          {loading ? 'Updating...' : `Mark as ${nextStatus}`}
        </button>
      )}
    </div>
  );
};

export default OrderStatusUpdater;
