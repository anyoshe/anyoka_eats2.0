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
  isDeliveryCalculating,
  selectedPaymentType
}) => {
  const [method, setMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);


  // Auto-fill M-Pesa number
  useEffect(() => {
    if (user?.phoneNumber) {
      setMpesaNumber(user.phoneNumber);
    }
  }, [user]);

  // Switch automatically to M-Pesa for platform delivery
  useEffect(() => {
    if (deliveryOption === 'platform' && method === 'COD') {
      setMethod('Mpesa');
    }
  }, [deliveryOption, method]);

  // Build base payload
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

  const handlePlaceOrder = async () => {
  if (loading) return;
  if (!isDeliveryFeeReady)
    return onError?.('Please wait for delivery fee calculation.');

  if (deliveryOption === 'platform' && deliveryFee <= 0)
    return onError?.('Platform delivery must have a valid delivery fee.');

  if (deliveryOption === 'own' && deliveryFee !== 0)
    return onError?.('Own delivery should not have a delivery fee.');

  setLoading(true);

  try {
    const formattedNumber = mpesaNumber.startsWith('254')
      ? mpesaNumber
      : mpesaNumber.replace(/^0/, '254');

    // 🟢 OWN DELIVERY - PAY ON COLLECTION
    if (deliveryOption === 'own' && method === 'COD') {
      const payload = buildOrderPayload({
        paymentMethod: 'COD',
        paymentType: 'full',
        paymentStatus: 'Pending'
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

    // 🟢 OWN DELIVERY - PAY BEFORE PICKUP (M-PESA)
    if (deliveryOption === 'own' && method === 'Mpesa') {
      const payload = buildOrderPayload({
        paymentMethod: 'Mpesa',
        paymentType: 'full',
        paymentStatus: 'Pending'
      });

      // Step 1: Create Order
      const orderRes = await fetch(`${config.backendUrl}/api/orders/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');
      const orderId = orderData.orderId;

      // Step 2: Pay via Mpesa
      setShowMpesaModal(true);
      const mpesaRes = await fetch(`${config.backendUrl}/api/mpesa/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          amount: total, // goods only
          orderId,
          paymentType: 'full'
        })
      });

      const mpesaData = await mpesaRes.json();
      if (!mpesaRes.ok) throw new Error(mpesaData.error || 'M-Pesa payment failed');

      const { CheckoutRequestID } = mpesaData;
      let confirmed = false;

      for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const checkRes = await fetch(`${config.backendUrl}/api/mpesa/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ CheckoutRequestID })
        });
        const checkData = await checkRes.json();
        if (checkData?.ResultCode === 0) {
          confirmed = true;
          break;
        }
      }

      setShowMpesaModal(false);
      if (!confirmed) throw new Error('Payment not confirmed. Try again.');

      clearCart();
      onSuccess?.();
      navigate(`/orders/${orderId}`);
    }

    // 🟢 PLATFORM DELIVERY - M-PESA (Full, Goods, Delivery)
    if (deliveryOption === 'platform' && method === 'Mpesa') {
      const payload = buildOrderPayload({
        paymentMethod: 'Mpesa',
        paymentType: selectedPaymentType, // "full" | "goods" | "delivery"
        paymentStatus: 'Pending'
      });

      // Step 1: Create Order
      const orderRes = await fetch(`${config.backendUrl}/api/orders/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

      const orderId = orderData.orderId;

      // Step 2: Determine amount
      let amount = 0;
      if (selectedPaymentType === 'full') amount = total;
      else if (selectedPaymentType === 'goods') amount = subtotal;
      else if (selectedPaymentType === 'delivery') amount = deliveryFee;

      // Step 3: Trigger M-Pesa
      setShowMpesaModal(true);
      const mpesaRes = await fetch(`${config.backendUrl}/api/mpesa/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          amount,
          orderId,
          paymentType: selectedPaymentType
        })
      });

      const mpesaData = await mpesaRes.json();
      if (!mpesaRes.ok) throw new Error(mpesaData.error || 'M-Pesa payment failed');

      const { CheckoutRequestID } = mpesaData;
      let confirmed = false;

      for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const checkRes = await fetch(`${config.backendUrl}/api/mpesa/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ CheckoutRequestID })
        });
        const checkData = await checkRes.json();
        if (checkData?.ResultCode === 0) {
          confirmed = true;
          break;
        }
      }

      setShowMpesaModal(false);
      if (!confirmed) throw new Error('Payment not confirmed. Try again.');

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

        {/* Mpesa always visible */}
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
