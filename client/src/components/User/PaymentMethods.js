import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './PaymentMethods.module.css';

const PaymentMethods = ({
  cart,
  total,
  deliveryFee,
  deliveryTown,
  deliveryLocation,
  clearCart,
  onSuccess,
  onError,
  deliveryOption,
  isDeliveryFeeReady,
  isDeliveryCalculating
}) => {
  const [method, setMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Autofill user phone number if available
  useEffect(() => {
    if (user?.phoneNumber) setMpesaNumber(user.phoneNumber);
  }, [user]);

  // Automatically switch to M-Pesa if platform delivery
  useEffect(() => {
    if (deliveryOption === 'platform' && method === 'COD') {
      setMethod('Mpesa');
    }
  }, [deliveryOption, method]);

  // Build base order payload
  const buildOrderPayload = (extraFields = {}) => ({
    userId: user._id,
    items: cart.map(({ _id, quantity, price, shop }) => ({
      product: _id,
      quantity,
      price,
      shop
    })),
    delivery: {
      town: deliveryTown,
      location: deliveryLocation,
      fee: deliveryFee,
      option: deliveryOption
    },
    paymentMethod: method,
    ...extraFields
  });

  // === HANDLE ORDER PLACEMENT ===
  const handlePlaceOrder = async () => {
    if (loading) return;

    if (!isDeliveryFeeReady)
      return onError?.('Please wait for delivery fee calculation.');
    if (deliveryOption === 'platform' && deliveryFee <= 0)
      return onError?.('Platform delivery must have a valid delivery fee.');
    if (deliveryOption === 'own' && deliveryFee !== 0)
      return onError?.('Own delivery should not have a delivery fee.');

    if (method === 'Mpesa' && !mpesaNumber.trim())
      return onError?.('Please enter a valid M-Pesa number.');

    setLoading(true);

    try {
      // CASE 1: CASH ON DELIVERY (OWN DELIVERY ONLY)
      if (method === 'COD') {
        const payload = buildOrderPayload({
          paymentStatus: 'Pending',
          paymentType: 'collectLater'
        });

        const res = await fetch(`${config.backendUrl}/api/orders/place`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Order failed');

        clearCart();
        onSuccess?.();
        return navigate(`/orders/${data.orderId}`);
      }

      // CASE 2: M-PESA PAYMENT (PLATFORM OR OWN DELIVERY)
      if (method === 'Mpesa') {
        let formattedNumber = mpesaNumber.startsWith('254')
          ? mpesaNumber
          : mpesaNumber.replace(/^0/, '254');

        const amount = total + (deliveryFee || 0);

        // STEP 1️⃣: Create a pending order before payment
        const pendingOrderPayload = buildOrderPayload({
          paymentStatus: 'Pending',
          paymentType: 'full'
        });

        const orderRes = await fetch(`${config.backendUrl}/api/orders/place`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(pendingOrderPayload)
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

        const { orderId } = orderData;
        if (!orderId) throw new Error('Order ID not returned from backend');

        // STEP 2️⃣: Initiate M-Pesa payment using the new orderId
        setShowMpesaModal(true);
        console.log('🚀 Initiating M-Pesa Payment:', {
          phoneNumber: formattedNumber,
          amount,
          orderId,
          deliveryOption
        });

        const paymentInit = await fetch(`${config.backendUrl}/api/mpesa/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: formattedNumber,
            amount,
            orderId, // ✅ include the orderId now
            paymentType: 'full',
            callback: `${config.backendUrl}/api/mpesa/callback`
          })
        });

        const paymentData = await paymentInit.json();
        if (!paymentInit.ok)
          throw new Error(paymentData.error || 'Failed to initiate M-Pesa payment');

        const { CheckoutRequestID } = paymentData;

        // STEP 3️⃣: Poll for payment confirmation
        let paymentConfirmed = false;
        for (let i = 0; i < 8; i++) {
          await new Promise(r => setTimeout(r, 5000));
          const statusRes = await fetch(`${config.backendUrl}/api/mpesa/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CheckoutRequestID })
          });

          const statusData = await statusRes.json();
          if (statusData?.ResultCode === 0) {
            paymentConfirmed = true;
            break;
          }
        }

        setShowMpesaModal(false);

        if (!paymentConfirmed)
          throw new Error('Payment not confirmed. Please try again.');

        // STEP 4️⃣: Update order payment status → Paid
        const confirmRes = await fetch(`${config.backendUrl}/api/orders/${orderId}/confirm-payment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({
            paymentStatus: 'Paid',
            paymentType: 'full'
          })
        });

        const confirmData = await confirmRes.json();
        if (!confirmRes.ok)
          throw new Error(confirmData.error || 'Failed to confirm payment');

        clearCart();
        onSuccess?.();
        navigate(`/orders/${orderId}`);
      }
    } catch (err) {
      console.error('Order Error:', err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === RENDER ===
  return (
    <div className={styles.paymentMethods}>
      <h4>Select Payment Method</h4>

      <div className={styles.paymentMethodsWrapper}>
        {/* COD visible only for own delivery */}
        {deliveryOption === 'own' && (
          <label>
            <input
              type="radio"
              name="payment"
              value="COD"
              checked={method === 'COD'}
              onChange={() => setMethod('COD')}
            />
            <span>Pay on Pickup</span>
          </label>
        )}

        {/* M-Pesa always visible */}
        <label>
          <input
            type="radio"
            name="payment"
            value="Mpesa"
            checked={method === 'Mpesa'}
            onChange={() => setMethod('Mpesa')}
          />
          <span>M-Pesa</span>
        </label>

        {/* Future payment options */}
        {['Paypal', 'Card'].map(opt => (
          <label key={opt}>
            <input
              type="radio"
              name="payment"
              value={opt}
              checked={method === opt}
              onChange={() => setMethod(opt)}
              disabled
            />
            <span>
              {opt} <span className={styles.comingSoon}>(Coming Soon)</span>
            </span>
          </label>
        ))}
      </div>

      {method === 'Mpesa' && (
        <div className={styles.mpesaInputWrapper}>
          <label htmlFor="mpesaNumber">M-Pesa Number:</label>
          <input
            id="mpesaNumber"
            type="tel"
            value={mpesaNumber}
            onChange={e => setMpesaNumber(e.target.value)}
            placeholder="Enter M-Pesa number (e.g. 07xxxxxxxx)"
            className={styles.mpesaInput}
          />
          <small>Ensure this is the number that will make the payment.</small>
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={
          loading ||
          isDeliveryCalculating ||
          !isDeliveryFeeReady ||
          deliveryFee === null ||
          (deliveryOption === 'platform' && deliveryFee <= 0) ||
          (deliveryOption === 'own' && deliveryFee !== 0)
        }
      >
        {loading
          ? method === 'Mpesa'
            ? 'Waiting for Payment...'
            : 'Processing...'
          : method === 'COD'
            ? 'Place Order'
            : 'Pay Now'}
      </button>

      {showMpesaModal && (
        <div className={styles.mpesaModal}>
          <div className={styles.mpesaModalContent}>
            <p>📱 Check your phone to complete the M-Pesa payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
