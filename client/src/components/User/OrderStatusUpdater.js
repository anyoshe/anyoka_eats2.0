import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../../config';
import styles from './OrderStatusUpdater.module.css';

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
  deliveryOption,
}) => {
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const statusRef = useRef(currentStatus);

  // Disable after PickedUp for own delivery, after ReadyForPickup for platform
  const disablePartner =
    loading ||
    (deliveryOption === 'own'
      ? statusFlow.indexOf(currentStatus) > statusFlow.indexOf('PickedUp') // allow up to PickedUp
      : statusFlow.indexOf(currentStatus) >= statusFlow.indexOf('ReadyForPickup'));
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
          disabled={disablePartner}
          className={styles.statusButtonOrder}
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