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

  // Set initial M-Pesa number when user data loads
  useEffect(() => {
    if (user?.phoneNumber) {
      setMpesaNumber(user.phoneNumber);
    }
  }, [user]);

  // Automatically switch to M-Pesa if delivery option is platform
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

  // === Handle Order Placement ===
  const handlePlaceOrder = async () => {
    if (loading) return;

    // Basic validation
    if (!isDeliveryFeeReady) return onError?.('Please wait for delivery fee to be calculated.');
    if (deliveryOption === 'platform' && deliveryFee <= 0)
      return onError?.('Platform delivery must have a valid delivery fee.');
    if (deliveryOption === 'own' && deliveryFee !== 0)
      return onError?.('Own delivery should not have any delivery fee.');

    // Validate Mpesa number if Mpesa selected
    if (method === 'Mpesa' && !mpesaNumber.trim()) {
      return onError?.('Please enter a valid M-Pesa number.');
    }

    setLoading(true);

    try {
      // 🧾 CASE 1: Cash on Delivery
      if (method === 'COD') {
        const payload = buildOrderPayload();
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

      // 📱 CASE 2: M-Pesa Payment
      if (method === 'Mpesa') {
        let formattedNumber = mpesaNumber.startsWith('254')
          ? mpesaNumber
          : mpesaNumber.replace(/^0/, '254');

        // const amount = total + (deliveryFee || 0);
        // 🔸 Adjust payment for long distance deliveries
        let amount = total + (deliveryFee || 0);
        let isPartialPayment = false;

        // Estimate from DeliveryOptions distance info if available
        try {
          const firstDistance = window.localStorage.getItem('latestDistanceKm'); // optional fallback
          if (firstDistance && parseFloat(firstDistance) > 100) {
            isPartialPayment = true;
            const deposit = Math.round((total + (deliveryFee || 0)) * 0.3);
            amount = deposit;

            // Wait for user to confirm before continuing
            const confirmProceed = window.confirm(
              `🚚 Long-distance delivery detected (${firstDistance} km).\n` +
              `You’ll pay a 30% deposit now: KSH ${deposit}.\n` +
              `The remaining balance will be paid on delivery.\n\n` +
              `Do you want to continue?`
            );

            if (!confirmProceed) {
              setLoading(false);
              setShowMpesaModal(false);
              return; // stop payment if they cancel
            }
          }

        } catch (err) {
          console.warn('Distance check failed:', err);
        }


        setShowMpesaModal(true);

        const res = await fetch(`${config.backendUrl}/api/mpesa/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: formattedNumber, amount })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'M-Pesa payment failed');

        const { CheckoutRequestID } = data;

        // 🔁 Poll for payment confirmation
        let paymentConfirmed = false;
        for (let i = 0; i < 8; i++) {
          await new Promise(r => setTimeout(r, 5000));

          const statusRes = await fetch(`${config.backendUrl}/api/mpesa/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CheckoutRequestID })
          });

          const statusData = await statusRes.json();
          console.log('Payment status:', statusData);

          if (statusData?.ResultCode === 0) {
            paymentConfirmed = true;
            break;
          }
        }

        setShowMpesaModal(false);

        if (!paymentConfirmed) throw new Error('Payment not confirmed. Try again.');

        // ✅ Confirmed payment → Place order

        const orderPayload = buildOrderPayload({
          paymentStatus: isPartialPayment ? 'DepositPaid' : 'Paid',
          paymentType: isPartialPayment ? 'deposit' : 'full'
        });

        const orderRes = await fetch(`${config.backendUrl}/api/orders/place`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(orderPayload)
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || 'Order placement failed after payment');

        clearCart();
        onSuccess?.();
        navigate(`/orders/${orderData.orderId}`);
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
            <span>Cash on Delivery</span>
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

      {/* Editable Mpesa number input */}
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

      {/* M-Pesa modal */}
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
