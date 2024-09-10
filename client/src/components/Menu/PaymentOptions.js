import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import './PaymentOptions.css';

const PaymentOptions = ({ orderDetails, onPaymentSuccess, onPaymentFailure }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(orderDetails.totalPrice);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleMpesaPayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.backendUrl}/api/mpesa/pay`, {
        phoneNumber,
        amount
      });

      setPaymentResult(response.data);
      setLoading(false);

      if (response.data.ResponseCode === '0') {
        onPaymentSuccess();
      } else {
        onPaymentFailure();
      }
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error.response ? error.response.data : error.message);
      setPaymentResult({ error: 'Failed to initiate payment' });
      setLoading(false);
      onPaymentFailure();
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'mpesa') {
      handleMpesaPayment();
    } else {
      // Handle other payment methods if any
    }
  };

  return (
    <div className='paymentOptionDiv'>
      <h3 className='paymentHeader'>Payment Options</h3>
      <div>
        <label htmlFor="paymentMethod">Select Payment Method:</label>
        <select id="paymentMethod" value={paymentMethod} onChange={handlePaymentMethodChange}>
          <option value="mpesa" className='mpesa'>M-Pesa</option>
          <option value="visa">Visa</option>
          {/* <option value="visa">Airtel Money</option>
          <option value="visa">Equity</option>
          <option value="visa">KCB</option> */}
        </select>
      </div>

      {paymentMethod === 'mpesa' && (
        <div>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="Enter your M-Pesa phone number"
            required
          />
        </div>
      )}

      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>

      {paymentResult && (
        <div>
          {paymentResult.error ? (
            <p>Error: {paymentResult.error}</p>
          ) : (
            <p>Payment Result: {JSON.stringify(paymentResult)}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentOptions;

  