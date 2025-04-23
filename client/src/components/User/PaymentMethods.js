import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { AuthContext } from '../../contexts/AuthContext';
import './PaymentMethods.css';

const PaymentMethods = ({
  cart,
  total,
  deliveryFee,
  deliveryTown,
  deliveryLocation,
  clearCart,
  onSuccess,
  onError
}) => {
  const [method, setMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (loading) return;
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
          fee: deliveryFee
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
    <div className="paymentMethods">
      <h4>Select Payment Method</h4>
      <label>
        <input type="radio" name="payment" value="COD"
               checked={method === 'COD'} onChange={() => setMethod('COD')} />
        Cash on Delivery
      </label>
      <label>
        <input type="radio" name="payment" value="Mpesa"
               checked={method === 'Mpesa'} onChange={() => setMethod('Mpesa')} disabled />
        Mpesa <span className="comingSoon">(Coming Soon)</span>
      </label>
      <label>
        <input type="radio" name="payment" value="Paypal"
               checked={method === 'Paypal'} onChange={() => setMethod('Paypal')} disabled />
        PayPal <span className="comingSoon">(Coming Soon)</span>
      </label>
      <label>
        <input type="radio" name="payment" value="Card"
               checked={method === 'Card'} onChange={() => setMethod('Card')} disabled />
        Visa <span className="comingSoon">(Coming Soon)</span>
      </label>
      <button onClick={handlePlaceOrder} disabled={loading}>
        {loading ? 'Processing...' : method === 'COD' ? 'Place Order' : 'Pay'}
      </button>
    </div>
  );
};


export default PaymentMethods;
