// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import config from '../../config';
// import { AuthContext } from '../../contexts/AuthContext';
// import './PaymentMethods.css';
// import DeliveryOptions from './DeliveryOptions';

// const PaymentMethods = ({
//   cart,
//   total,
//   deliveryFee,
//   deliveryTown,
//   deliveryLocation,
//   clearCart,
//   onSuccess,
//   onError,
//   deliveryOption,
//   isDeliveryFeeReady,
//   isDeliveryCalculating
// }) => {
//   const [method, setMethod] = useState('COD');
//   const [loading, setLoading] = useState(false);
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handlePlaceOrder = async () => {

//     console.log("Submitting order with:", {
//       deliveryOption,
//       deliveryTown,
//       deliveryLocation,
//       deliveryFee,
//     });

//     if (loading) return;

//     if (!isDeliveryFeeReady) {
//       onError?.("Please wait for delivery fee to be calculated.");
//       return;
//     }

//     if (deliveryOption === 'platform' && deliveryFee <= 0) {
//       onError?.("Platform delivery must have a valid delivery fee.");
//       return;
//     }

//     if (deliveryOption === 'own' && deliveryFee !== 0) {
//       onError?.("Own delivery should not have any delivery fee.");
//       return;
//     }



//     setLoading(true);
//     try {
//       const payload = {
//         userId: user._id,
//         items: cart.map(i => ({
//           product: i._id,
//           quantity: i.quantity,
//           price: i.price,
//           shop: i.shop
//         })),
//         delivery: {
//           town: deliveryTown,
//           location: deliveryLocation,
//           fee: deliveryFee,
//           option: deliveryOption,
//         },
//         paymentMethod: method
//       };

//       const res = await fetch(`${config.backendUrl}/api/orders/place`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${user.token}`,
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Order failed');

//       clearCart();
//       onSuccess?.();
//       navigate(`/orders/${data.orderId}`);
//     } catch (err) {
//       console.error(err);
//       onError?.(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="paymentMethods">
//       <h4>Select Payment Method</h4>
//       <label>
//         <input type="radio" name="payment" value="COD"
//           checked={method === 'COD'} onChange={() => setMethod('COD')} />
//         Cash on Delivery
//       </label>
//       <label>
//         <input type="radio" name="payment" value="Mpesa"
//           checked={method === 'Mpesa'} onChange={() => setMethod('Mpesa')} disabled />
//         Mpesa <span className="comingSoon">(Coming Soon)</span>
//       </label>
//       <label>
//         <input type="radio" name="payment" value="Paypal"
//           checked={method === 'Paypal'} onChange={() => setMethod('Paypal')} disabled />
//         PayPal <span className="comingSoon">(Coming Soon)</span>
//       </label>
//       <label>
//         <input type="radio" name="payment" value="Card"
//           checked={method === 'Card'} onChange={() => setMethod('Card')} disabled />
//         Visa <span className="comingSoon">(Coming Soon)</span>
//       </label>

//       <button
//         onClick={handlePlaceOrder}
//         disabled={
//           loading ||
//           isDeliveryCalculating ||
//           !isDeliveryFeeReady ||
//           deliveryFee === null ||
//           (deliveryOption === 'platform' && deliveryFee <= 0) ||
//           (deliveryOption === 'own' && deliveryFee !== 0)
//         }>
//         {loading ? 'Processing...' : method === 'COD' ? 'Place Order' : 'Pay'}
//       </button>

//     </div>
//   );
// };


// export default PaymentMethods;


import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './PaymentMethods.module.css'; // <-- Updated to module CSS
import DeliveryOptions from './DeliveryOptions';

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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    console.log("Submitting order with:", {
      deliveryOption,
      deliveryTown,
      deliveryLocation,
      deliveryFee,
    });

    if (loading) return;

    if (!isDeliveryFeeReady) {
      onError?.("Please wait for delivery fee to be calculated.");
      return;
    }

    if (deliveryOption === 'platform' && deliveryFee <= 0) {
      onError?.("Platform delivery must have a valid delivery fee.");
      return;
    }

    if (deliveryOption === 'own' && deliveryFee !== 0) {
      onError?.("Own delivery should not have any delivery fee.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: user._id,
        items: cart.map(i => ({
          product: i._id,
          quantity: i.quantity,
          price: i.price,
          shop: i.shop
        })),
        delivery: {
          town: deliveryTown,
          location: deliveryLocation,
          fee: deliveryFee,
          option: deliveryOption,
        },
        paymentMethod: method
      };

      const res = await fetch(`${config.backendUrl}/api/orders/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');

      clearCart();
      onSuccess?.();
      navigate(`/orders/${data.orderId}`);
    } catch (err) {
      console.error(err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentMethods}>

      <h4>Select Payment Method</h4>

      <div className={styles.paymentMethodsWrapper}>
      <label>
        <input
          type="radio"
          name="payment"
          value="COD"
          checked={method === 'COD'}
          onChange={() => setMethod('COD')}
        />
        Cash on Delivery
      </label>

      <label>
        <input
          type="radio"
          name="payment"
          value="Mpesa"
          checked={method === 'Mpesa'}
          onChange={() => setMethod('Mpesa')}
          disabled
        />
        Mpesa <span className={styles.comingSoon}>(Coming Soon)</span>
      </label>

      <label>
        <input
          type="radio"
          name="payment"
          value="Paypal"
          checked={method === 'Paypal'}
          onChange={() => setMethod('Paypal')}
          disabled
        />
        PayPal <span className={styles.comingSoon}>(Coming Soon)</span>
      </label>
      
      <label>
        <input
          type="radio"
          name="payment"
          value="Card"
          checked={method === 'Card'}
          onChange={() => setMethod('Card')}
          disabled
        />
        Visa <span className={styles.comingSoon}>(Coming Soon)</span>
      </label>

      </div>
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
        {loading ? 'Processing...' : method === 'COD' ? 'Place Order' : 'Pay'}
      </button>
    </div>
  );
};

export default PaymentMethods;
