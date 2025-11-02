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
  subOrderTotal,
}) => {
  const [loading, setLoading] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef(null);
  const statusRef = useRef(currentStatus);

  useEffect(() => {
    statusRef.current = currentStatus;
  }, [currentStatus]);

  const disablePartner =
    loading ||
    (deliveryOption === 'own'
      ? statusFlow.indexOf(currentStatus) > statusFlow.indexOf('PickedUp')
      : statusFlow.indexOf(currentStatus) >= statusFlow.indexOf('ReadyForPickup'));

  const getNextStatus = () => {
    const idx = statusFlow.indexOf(currentStatus);
    return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const handleStatusUpdate = async () => {
    const next = getNextStatus();
    if (!next || next !== 'PickedUp') {
      await updateStatus(next);
      return;
    }

    if (deliveryOption !== 'own') {
      await updateStatus('PickedUp');
      return;
    }

    try {
      const res = await axios.get(`${config.backendUrl}/api/suborders/${subOrderId}`);
      if (res.data.paymentStatus === 'Paid') {
        await updateStatus('Confirmed Delivered');
      } else {
        setShowPaymentPrompt(true);
      }
    } catch (err) {
      alert('Failed to check payment status');
    }
  };

  const updateStatus = async (status) => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${config.backendUrl}/api/suborders/${subOrderId}/status`,
        { status }
      );
      onStatusChange(res.data.status);
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'COD') {
      if (!window.confirm(`Customer paid KES ${subOrderTotal} in cash?`)) return;
      await markAsPaidAndDelivered();
    } else {
      if (!mpesaNumber.match(/^254[0-9]{9}$/)) {
        alert('Enter valid M-Pesa number (2547...)');
        return;
      }
      setPolling(true);
      await initiateMpesaPayment();
    }
  };

  const initiateMpesaPayment = async () => {
    try {
      const res = await axios.post(`${config.backendUrl}/api/mpesa/pay`, {
        phoneNumber: mpesaNumber,
        amount: subOrderTotal,
        orderId: parentOrderId,
        paymentType: 'goods',
        subOrderId,
      });

      const { CheckoutRequestID } = res.data;
      let attempts = 0;
      const poll = async () => {
        if (attempts++ > 15) {
          setPolling(false);
          alert('Payment timeout');
          return;
        }
        const statusRes = await axios.post(`${config.backendUrl}/api/mpesa/status`, { CheckoutRequestID });
        if (statusRes.data.ResultCode === '0') {
          await markAsPaidAndDelivered();
          setPolling(false);
        } else if (statusRes.data.ResultCode === '1032') {
          setPolling(false);
          alert('Payment cancelled');
        } else {
          setTimeout(poll, 5000);
        }
      };
      poll();
    } catch (err) {
      setPolling(false);
      alert('M-Pesa failed');
    }
  };

  const markAsPaidAndDelivered = async () => {
    try {
      const response = await axios.post(
        `${config.backendUrl}/api/suborders/${subOrderId}/pay-and-deliver`,
        { paymentMethod: paymentMethod === 'COD' ? 'COD' : 'Mpesa' }
      );
      setShowPaymentPrompt(false);
      onStatusChange('Confirmed Delivered');
      alert('Suborder marked as Paid & Confirmed Delivered');
      console.log('Success:', response.data);
    } catch (err) {
      console.error('Pay & Deliver failed:', err.response?.data || err.message);
      alert('Failed to finalize: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const nextStatus = getNextStatus();
  if (currentStatus === 'Confirmed Delivered') return null;

  return (
    <div>
      <p><strong>Status:</strong> {currentStatus}</p>

      {nextStatus && !showPaymentPrompt && (
        <button
          onClick={handleStatusUpdate}
          disabled={disablePartner || loading}
          className={styles.statusButtonOrder}
        >
          {loading ? 'Updating...' : `Mark as ${nextStatus}`}
        </button>
      )}

      {/* ✨ MODAL SECTION ✨ */}
      {showPaymentPrompt && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Payment</h3>
            <p><strong>Amount Due:</strong> KES {subOrderTotal}</p>

            <div className={styles.paymentOptions}>
              <label>
                <input
                  type="radio"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                /> Cash (COD)
              </label>
              <label>
                <input
                  type="radio"
                  checked={paymentMethod === 'Mpesa'}
                  onChange={() => setPaymentMethod('Mpesa')}
                /> M-Pesa
              </label>
            </div>

            {paymentMethod === 'Mpesa' && (
              <input
                type="tel"
                placeholder="2547xxxxxxxx"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                className={styles.input}
              />
            )}

            <div className={styles.modalActions}>
              <button
                onClick={handlePayment}
                disabled={polling}
                className={styles.confirmBtn}
              >
                {polling ? 'Waiting for PIN...' : 'Confirm Payment'}
              </button>
              <button
                onClick={() => setShowPaymentPrompt(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusUpdater;
