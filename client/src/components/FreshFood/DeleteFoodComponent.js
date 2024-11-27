import React from 'react';
import axios from 'axios';
import config from '../../config';

const DeleteFoodComponent = ({ foodCode, onDelete }) => {
  const handleDelete = async () => {
    try {
      await axios.delete(`${config.backendUrl}/api/foods/${foodCode}`);
      onDelete(foodCode);
      console.log('Food deleted successfully');
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete Food</button>
    </div>
  );
};

export default DeleteFoodComponent;



  // const initiateMpesaPayment = async (phoneNumber, amount) => {
  //   try {
  //     const response = await axios.post(`${config.backendUrl}/api/mpesa/pay`, {
  //       phoneNumber,
  //       amount
  //     }, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     if (response.status === 200) {
  //       const data = response.data;
  //       if (data.ResponseCode === '0') {
  //         alert(data.CustomerMessage);
  //         return data;
  //       } else {
  //         console.error('Payment failed:', data.ResponseDescription);
  //         alert('Payment failed. Please try again.');
  //         return null;
  //       }
  //     } else {
  //       console.error('Failed to initiate payment:', response.statusText);
  //       alert('Error initiating M-Pesa payment. Please try again.');
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('Error initiating M-Pesa payment:', error);
  //     alert('Error initiating M-Pesa payment. Please try again.');
  //     return null;
  //   }
  // };



  // router.post('/mpesa/pay', async (req, res) => {
//   const { phoneNumber, amount } = req.body;
//   console.log('Received payment request:', { phoneNumber, amount });

//   try {
//     const timestamp = generateTimestamp();
//     console.log('Generated timestamp:', timestamp);

//     // Fetch access token 
//     const authResponse = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
//       headers: {
//         'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
//       }
//     });

//     const { access_token } = authResponse.data;
//     if (!access_token) {
//       throw new Error('Failed to fetch access token');
//     }

//     console.log('Access Token:', access_token);

//     // Generate password and payment data
//     const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
//     const paymentData = {
//       BusinessShortCode: shortcode,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: 'CustomerPayBillOnline',
//       Amount: amount,
//       PartyA: phoneNumber,
//       PartyB: shortcode,
//       PhoneNumber: phoneNumber,
//       CallBackURL: `${ngrokUrl}/mpesa/callback`,
//       AccountReference: 'Test123',
//       TransactionDesc: 'Test Payment'
//     };

//     console.log('Payment Data:', paymentData);

//     // Initiate payment 
//     const paymentResponse = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', paymentData, {
//       headers: {
//         'Authorization': `Bearer ${access_token}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log('Payment Response:', paymentResponse.data);
//     res.json(paymentResponse.data);
//   } catch (error) {
//     console.error('Error initiating M-Pesa payment:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Failed to initiate payment', details: error.message });
//   }
// });// router.post('/mpesa/pay', async (req, res) => {
//   const { phoneNumber, amount } = req.body;
//   console.log('Received payment request:', { phoneNumber, amount });

//   try {
//     const timestamp = generateTimestamp();
//     console.log('Generated timestamp:', timestamp);

//     // Fetch access token 
//     const authResponse = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
//       headers: {
//         'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
//       }
//     });

//     const { access_token } = authResponse.data;
//     if (!access_token) {
//       throw new Error('Failed to fetch access token');
//     }

//     console.log('Access Token:', access_token);

//     // Generate password and payment data
//     const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
//     const paymentData = {
//       BusinessShortCode: shortcode,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: 'CustomerPayBillOnline',
//       Amount: amount,
//       PartyA: phoneNumber,
//       PartyB: shortcode,
//       PhoneNumber: phoneNumber,
//       CallBackURL: `${ngrokUrl}/mpesa/callback`,
//       AccountReference: 'Test123',
//       TransactionDesc: 'Test Payment'
//     };

//     console.log('Payment Data:', paymentData);

//     // Initiate payment 
//     const paymentResponse = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', paymentData, {
//       headers: {
//         'Authorization': `Bearer ${access_token}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log('Payment Response:', paymentResponse.data);
//     res.json(paymentResponse.data);
//   } catch (error) {
//     console.error('Error initiating M-Pesa payment:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Failed to initiate payment', details: error.message });
//   }
// });




// router.post('/mpesa/callback', (req, res) => {
//   const callbackData = req.body;
//   console.log('M-Pesa Callback Received:', callbackData);

//   // Your logic to handle the callback data goes here...
//   // Extract relevant information from the callback data
//   const { Body, ResultCode, ResultDesc } = callbackData;

//   // Log the callback data for debugging or auditing
//   console.log('Callback Body:', Body);
//   console.log('Result Code:', ResultCode);
//   console.log('Result Description:', ResultDesc);

//   // Example: Process the callback based on ResultCode
//   if (ResultCode === 0) {
//     // Successful transaction
//     // Update your database, notify user, etc.
//     console.log('Payment successful. Update database...');
//   } else {
//     // Failed transaction
//     // Handle failure scenario
//     console.log('Payment failed:', ResultDesc);
//   }
//   // Respond with a success status to acknowledge receipt
//   res.sendStatus(200);
// });




  // const initiateMpesaPayment = async (phoneNumber, amount) => {
  //   try {
  //     const response = await axios.post(`${config.backendUrl}/api/mpesa/pay`, {
  //       phoneNumber,
  //       amount
  //     }, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     if (response.status === 200) {
  //       const data = response.data;
  //       if (data.ResponseCode === '0') {
  //         alert(data.CustomerMessage);
  //         return data;
  //       } else {
  //         console.error('Payment failed:', data.ResponseDescription);
  //         alert('Payment failed. Please try again.');
  //         return null;
  //       }
  //     } else {
  //       console.error('Failed to initiate payment:', response.statusText);
  //       alert('Error initiating M-Pesa payment. Please try again.');
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('Error initiating M-Pesa payment:', error);
  //     alert('Error initiating M-Pesa payment. Please try again.');
  //     return null;
  //   }
  // };