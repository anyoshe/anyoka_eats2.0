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
  selectedPaymentType,
}) => {
  const [method, setMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext); // ← ADD token

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // -----------------------------------------------------------------
  //  Auto-fill M-Pesa number
  // -----------------------------------------------------------------
  useEffect(() => {
    if (user?.phoneNumber) {
      setMpesaNumber(user.phoneNumber);
    }
  }, [user]);

  // -----------------------------------------------------------------
  //  Force M-Pesa for platform delivery
  // -----------------------------------------------------------------
  useEffect(() => {
    if (deliveryOption === 'platform' && method === 'COD') {
      setMethod('Mpesa');
    }
  }, [deliveryOption, method]);

  // -----------------------------------------------------------------
  //  Payload builder
  // -----------------------------------------------------------------
  const buildOrderPayload = (extraFields = {}) => ({
    userId: user._id,
    items: cart.map(({ _id, quantity, price, shop }) => ({
      product: _id,
      quantity,
      price,
      shop,
    })),
    delivery: {
      town: deliveryTown,
      location: deliveryLocation,
      fee: deliveryFee,
      option: deliveryOption,
    },
    paymentMethod: method,
    ...extraFields,
  });

  // -----------------------------------------------------------------
  //  SAFE FETCH HELPER (handles non-JSON errors)
  // -----------------------------------------------------------------
  const safeFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const contentType = res.headers.get('content-type');
    let data;
    try {
      data = contentType?.includes('application/json') ? await res.json() : await res.text();
    } catch {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg = data?.error || data || `HTTP ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  };

  // -----------------------------------------------------------------
  //  M-PESA PAYMENT HELPER
  // -----------------------------------------------------------------
  const initiateMpesaPayment = async (formattedNumber, amount, orderId, paymentType) => {
    // 1. Trigger STK-push
    const mpesaData = await safeFetch(`${config.backendUrl}/api/mpesa/pay`, {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: formattedNumber,
        amount,
        orderId,
        paymentType,
      }),
    });

    const { CheckoutRequestID } = mpesaData;
    if (!CheckoutRequestID) throw new Error('Missing CheckoutRequestID');

    // 2. Poll M-Pesa
    let confirmed = false;
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 5000));

      const checkData = await safeFetch(`${config.backendUrl}/api/mpesa/status`, {
        method: 'POST',
        body: JSON.stringify({ CheckoutRequestID }),
      });

      if (checkData?.ResultCode === '0') {
        confirmed = true;
        break;
      }
      if (checkData?.ResultCode === '1032') {
        throw new Error('Payment cancelled by user');
      }
    }

    if (!confirmed) throw new Error('Payment not confirmed. Try again.');

    // 3. Re-fetch fresh order
    return await safeFetch(`${config.backendUrl}/api/orders/${orderId}`);
  };

  // -----------------------------------------------------------------
  //  MAIN ORDER HANDLER
  // -----------------------------------------------------------------
  const handlePlaceOrder = async () => {
    if (loading || !token) return;
    if (!isDeliveryFeeReady) return onError?.('Please wait for delivery fee.');

    if (deliveryOption === 'platform' && deliveryFee <= 0)
      return onError?.('Platform delivery must have a valid fee.');

    if (deliveryOption === 'own' && deliveryFee !== 0)
      return onError?.('Own delivery should not have a fee.');

    setLoading(true);

    try {
      const formattedNumber = mpesaNumber.startsWith('254')
        ? mpesaNumber
        : mpesaNumber.replace(/^0/, '254');

      // 1. OWN DELIVERY – COD
      if (deliveryOption === 'own' && method === 'COD') {
        const payload = buildOrderPayload({
          paymentMethod: 'COD',
          paymentType: 'full',
          paymentStatus: 'Pending',
        });

        const data = await safeFetch(`${config.backendUrl}/api/orders/place`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        clearCart();
        onSuccess?.();
        return navigate(`/orders/${data.orderId}`);
      }

      // 2. OWN DELIVERY – M-PESA
      if (deliveryOption === 'own' && method === 'Mpesa') {
        const payload = buildOrderPayload({
          paymentMethod: 'Mpesa',
          paymentType: 'full',
          paymentStatus: 'Pending',
        });

        const orderData = await safeFetch(`${config.backendUrl}/api/orders/place`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const orderId = orderData.orderId;
        setShowMpesaModal(true);
        await initiateMpesaPayment(formattedNumber, total, orderId, 'full');
        setShowMpesaModal(false);

        clearCart();
        onSuccess?.();
        navigate(`/orders/${orderId}`);
        return;
      }

      // 3. PLATFORM DELIVERY – M-PESA
      if (deliveryOption === 'platform' && method === 'Mpesa') {
        const payload = buildOrderPayload({
          paymentMethod: 'Mpesa',
          paymentType: selectedPaymentType,
          paymentStatus: 'Pending',
        });

        const orderData = await safeFetch(`${config.backendUrl}/api/orders/place`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const orderId = orderData.orderId;

        let amount = 0;
        if (selectedPaymentType === 'full') amount = total;
        else if (selectedPaymentType === 'goods') amount = subtotal;
        else if (selectedPaymentType === 'delivery') amount = deliveryFee;

        setShowMpesaModal(true);
        await initiateMpesaPayment(formattedNumber, amount, orderId, selectedPaymentType);
        setShowMpesaModal(false);

        clearCart();
        onSuccess?.();
        navigate(`/orders/${orderId}`);
        return;
      }
    } catch (err) {
      console.error('Order Error:', err);
      onError?.(err.message);
    } finally {
      setLoading(false);
      setShowMpesaModal(false);
    }
  };

  // -----------------------------------------------------------------
  //  RENDER
  // -----------------------------------------------------------------
  return (
    <div className={styles.paymentMethods}>
      <h4>Select Payment Method</h4>

      <div className={styles.paymentMethodsWrapper}>
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

        {['Paypal', 'Card'].map((opt) => (
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
            onChange={(e) => setMpesaNumber(e.target.value)}
            placeholder="e.g. 07xxxxxxxx"
            className={styles.mpesaInput}
          />
          <small>Use the number that will pay.</small>
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={
          loading ||
          isDeliveryCalculating ||
          !isDeliveryFeeReady ||
          !token ||
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
            <p>Check your phone to complete payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;