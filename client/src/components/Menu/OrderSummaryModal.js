import React, { useState } from 'react';
import config from '../../config';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './OrderSummaryModal.css';

const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
// Function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

const PaymentOptionsModal = ({ show, handleClose, handlePayment }) => {
  return (
    <div className={`modal fade ${show ? 'show' : ''}`} id="paymentOptionsModal" tabIndex="-1" aria-labelledby="paymentOptionsModalLabel" aria-hidden="true" style={{ display: show ? 'block' : 'none' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="paymentOptionsModalLabel">Payment Options</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <h6>Select your preferred payment method</h6>
            <button type="button" className="optionPay" onClick={() => handlePayment('mpesa')}>Mpesa</button>
            <button type="button" className="optionPay" onClick={() => handlePayment('visa')}>Visa Card</button>
            <button type="button" className="optionPay" onClick={() => handlePayment('cash')}>Cash on Delivery</button>
          </div>
          <div className="modal-footer">
            <button type="button" className="optionPay" onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSummaryModal = ({ show, handleClose, restaurantName, orderedDishes = [], restaurantLocation, pinnedLocation }) => {
  const [contactNumber, setContactNumber] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  if (!restaurantLocation || !pinnedLocation) {
    console.error('Restaurant or pinned location is missing:', { restaurantLocation, pinnedLocation });
    return null;
  }

  const distance = calculateDistance(restaurantLocation.lat, restaurantLocation.lng, pinnedLocation.lat, pinnedLocation.lng);

  let deliveryCharges = 0;
  if (distance <= 1) {
    deliveryCharges = 50; // Base charge for distances up to 2 km
  } else {
    deliveryCharges = 50 + (Math.ceil(distance - 1) * 30); // Base charge plus KES 30 for every km beyond 2 km
  }

  const totalDishesPrice = orderedDishes.reduce((total, dish) => total + dish.price * dish.quantity, 0);
  const grandTotal = totalDishesPrice + deliveryCharges;

  const handleContactNumberChange = (e) => {
    setContactNumber(e.target.value);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleConfirmOrder = () => {

    // Check if contact number is provided or the user has signed in with WhatsApp
    if (!contactNumber) {
      alert('Please enter your contact number or sign in with WhatsApp.');
      return; // Prevent further execution
    }
    if (!selectedTime) {
      alert('Please select a delivery time.');
      return; // Prevent further execution
    }
    setShowPaymentModal(true);
  };

  const getReadableAddress = async (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const address = data.results[0].formatted_address;
        return address;
      } else {
        console.error('Error fetching address:', data);
        throw new Error('Unable to fetch address');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  };



  // Handler for email change
  const handleEmailChange = (event) => {
    setCustomerEmail(event.target.value);
  };


  const handlePayment = async (method) => {
    switch (method) {
      case 'visa':
        console.log('Processing Visa Card payment...');
        // Visa payment logic can be added here
        break;

      case 'mpesa':
        console.log('Processing M-Pesa payment...');
        try {
          // Step 1: Prompt for phone number
          const paymentPhoneNumber = prompt('Enter your M-Pesa phone number (format: 254712345678):', '254');
          if (!paymentPhoneNumber || !/^254\d{9}$/.test(paymentPhoneNumber)) {
            alert('Please enter a valid phone number in the format 254712345678.');
            return;
          }

          
          // Step 2: Calculate and confirm the payment amount
          const amount = Math.round(grandTotal); // Automatically round to the nearest whole number
          alert(`The Total Bill amount to Pay is ${amount}. Please Click OK to Proceed for Payment.`);

          // Proceed with further logic
          if (amount <= 0 || isNaN(amount)) {
            alert('Error: Invalid payment amount.');
            return; // Exit early if an unexpected issue arises
          }

          // Continue with payment processing
          console.log(`Proceeding with payment of ${amount}`);

        //   let amount;
        // let validAmount = false;
        // while (!validAmount) {
        //   amount = prompt('Enter the amount to pay:', grandTotal);
        //   if (isNaN(amount) || amount <= 0 || amount.includes('.') || !Number.isInteger(Number(amount))) {
        //     alert('Please enter a valid whole number.');
        //   } else {
        //     validAmount = true;
        //   }
        // }
          // Step 3: Initiate payment and wait for confirmation
          const paymentResponse = await initiateMpesaPayment(paymentPhoneNumber, amount);
          if (paymentResponse && paymentResponse.success) {
            // Payment confirmed, proceed with success handling logic
            alert('Payment successful! Proceeding with your order...');
            // Step 4: Handle order details and notifications
            const address = await getReadableAddress(pinnedLocation.lat, pinnedLocation.lng);

            const orderDetails = {
              phoneNumber: contactNumber,
              email: customerEmail,
              selectedRestaurant: restaurantName,
              customerLocation: address,
              expectedDeliveryTime: selectedTime,
              dishes: orderedDishes,
              deliveryCharges: deliveryCharges,
              totalPrice: grandTotal,
            };

            const savedOrderData = await saveOrderToDatabase(orderDetails);

            try {
              await sendEmailNotification({
                ...orderDetails,
                orderId: savedOrderData.orderId, // Include the orderId from backend
              });
            } catch (emailError) {
              console.error('Error sending email:', emailError);
            }



            // Clear cart, close modal, and redirect
            clearCart();
            setShowPaymentModal(false);
            redirectToHomePage();
          } else {
            // Payment not confirmed
            alert(paymentResponse.message || 'Payment not confirmed. Please try again.');
          }
        } catch (error) {
          console.error('M-Pesa payment error:', error);
          alert('Error initiating M-Pesa payment. Please try again.');
        }
        break;

        case 'cash':
          console.log('Processing Cash on Delivery...');
          alert('You have chosen Cash on Delivery. Please ensure you have the correct amount in cash when your order arrives.');
        
          // Retrieve readable address
          const address = await getReadableAddress(pinnedLocation.lat, pinnedLocation.lng);
        
          const orderDetails = {
            phoneNumber: contactNumber,
            email: customerEmail,
            selectedRestaurant: restaurantName,
            customerLocation: address,
            expectedDeliveryTime: selectedTime,
            dishes: orderedDishes,
            deliveryCharges: deliveryCharges,
            totalPrice: grandTotal,
            // userId: currentUserId,  // Ensure userId is sent if logged in
            // customerName: customerFullName,  // Pass customer name if available
          };
        
          try {
            const response = await axios.post(`${config.backendUrl}/api/cash/pay`, orderDetails);
        
            if (response.status === 200) {
              alert('Order placed successfully with Cash on Delivery!');
              clearCart();
              setShowPaymentModal(false);
              redirectToHomePage();
            }
          } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
          }
          break;
        

      default:
        console.error('Unsupported payment method.');
        return;
    }
  };

  const initiateMpesaPayment = async (phoneNumber, amount) => {
    try {
      const response = await axios.post(`${config.backendUrl}/api/mpesa/pay`, {
        phoneNumber,
        amount,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        const data = response.data;
        if (data.ResponseCode === '0') {
          alert('Payment initiated. Please complete it on your phone. Click OK after payment is confirmed.');

          // Wait for payment confirmation
          const paymentResult = await waitForPaymentConfirmation(data.CheckoutRequestID);

          if (paymentResult.success) {
            alert('Payment confirmed!');
          } else {
            alert(paymentResult.message);
          }

          return paymentResult;
        } else {
          alert('Payment initiation failed. Please try again.');
          return { success: false, message: data.ResponseDescription };
        }
      } else {
        alert('Error initiating M-Pesa payment.');
        return { success: false, message: 'Failed to initiate payment.' };
      }
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      alert('Network error. Please try again.');
      return { success: false, message: 'Network error.' };
    }
  };

  const waitForPaymentConfirmation = async (checkoutRequestID) => {
    const maxRetries = 10;
    const retryInterval = 5000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const statusResponse = await axios.post(`${config.backendUrl}/api/mpesa/status`, {
          CheckoutRequestID: checkoutRequestID,
        }, {
          headers: { 'Content-Type': 'application/json' },
        });

        const statusData = statusResponse.data;

        if (statusData.ResultCode === '0') {
          return { success: true, message: statusData.ResultDesc };
        } else if (statusData.ResultCode === '1032') {
          return { success: false, message: 'Payment canceled by user.' };
        } else if (statusData.ResultCode === '1') {
          return { success: false, message: 'Payment failed. Please try again.' };
        }

        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }

    return { success: false, message: 'Payment confirmation timed out. Please try again.' };
  };

  const redirectToHomePage = () => {
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };


  // Update saveOrderToDatabase to retrieve the orderId from the backend response
  const saveOrderToDatabase = async (orderDetails) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/paidOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails)
      });

      if (response.ok) {
        const data = await response.json(); // Contains { message, orderId }
        console.log('Order saved successfully:', data);
        alert('Order received successfully! Your order will be processed and dispatched as soon as possible.');
        return data; // Return the data including orderId
      } else {
        const error = await response.json();
        console.error('Error saving order:', error);
        alert('Error encountered in receiving your order: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error receiving your order. Please try again.');
    }
  };

  // Updated sendEmailNotification to include orderId
  const sendEmailNotification = async (orderDetails) => {
    console.log(orderDetails);
    const emailDetails = {
      to: customerEmail,
      subject: `Order Confirmation - ${orderDetails.orderId}`,
      body: `
            <p>Dear Customer,</p>
            <p>Thank you for your order from ${orderDetails.selectedRestaurant}.</p>
            <p>Your order has been successfully placed and will be delivered to ${orderDetails.customerLocation} by ${orderDetails.expectedDeliveryTime}.</p>
            <p><strong>Order Number:</strong> ${orderDetails.orderId}</p>
            <p><strong>Total Amount:</strong> KSH ${orderDetails.totalPrice.toFixed(2)}</p>
            <p>Track your order with the order number above if you need assistance.</p>
            <p>Thank you for choosing us!</p>
        `,
    };

    try {
      const response = await axios.post(`${config.backendUrl}/api/sendConfirmationEmail`, emailDetails, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        console.log('Email sent successfully:', response.data);
      } else {
        console.error('Failed to send email:', response.data);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('There was an issue sending the email notification. Please check your network and try again.');
    }
  };

  const clearCart = () => {
    const cartItemsElement = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');
    const cartCountElement = document.getElementById('cartCount');
    if (cartItemsElement) {
      while (cartItemsElement.firstChild) {
        cartItemsElement.removeChild(cartItemsElement.firstChild);
      }
    }
    if (totalPriceElement) totalPriceElement.textContent = 'KES 0.00';
    if (cartCountElement) cartCountElement.textContent = '0';
  };


  const handlePaymentFailure = () => {
    const retry = window.confirm('Payment transfer failed! Would you like to try again?');
    if (retry) {
      handlePayment('mpesa');
    } else {
      const saveForLater = window.confirm('Would you like to save the order for later?');
      if (saveForLater) {
        alert('Your order has been saved for later.');
        saveOrderForLater();
      } else {
        alert('Order has been canceled. Your cart will remain saved.');

      }

      setShowPaymentModal(false);
    }

    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };
  const saveOrderForLater = () => {
    const address = getReadableAddress(pinnedLocation.lat, pinnedLocation.lng);
    const orderDetails = {
      phoneNumber: contactNumber,
      selectedRestaurant: restaurantName,
      customerLocation: address,
      expectedDeliveryTime: selectedTime,
      dishes: orderedDishes,
      deliveryCharges: deliveryCharges,
      totalPrice: grandTotal,
    };
    localStorage.setItem('savedOrder', JSON.stringify(orderDetails));
  };



  return (
    <>
      <div className={`modal fade ${show ? 'show' : ''}`} id="orderSummaryModal" tabIndex="-1" aria-labelledby="orderSummaryModalLabel" aria-hidden="true" style={{ display: show ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg orderModal">
          <div className="modal-content cartModalContent" id='sumaryModalcontent'>
            <div className="modal-header">
              <h5 className="modal-title" id="orderSummaryModalLabel">Order Summary</h5>
            </div>
            <div className="modal-body">
              <div className="form-group my-3">
                <label htmlFor="contactNumber" className='summary'>Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  id="contactNumber"
                  value={contactNumber}
                  onChange={handleContactNumberChange}
                  placeholder="Enter your contact number"
                  required
                />
              </div>

              <div className="form-group my-3">
                <label htmlFor="email" className='summary'>Your Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={customerEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group my-3">
                <label htmlFor="deliveryTime" className='summary'>When To Be Delivered</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="deliveryTime"
                  value={selectedTime}
                  onChange={handleTimeChange}
                />
              </div>

              <ul className="list-group mb-3 form-group">
                <p className='summary'>Dishes Ordered</p>
                {orderedDishes.map((dish, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between ">

                    <div>

                      <h6 className="my-0">{dish.dishName}</h6>

                      {/* <small className="text-muted">{dish.dishDescription}</small> */}
                    </div>
                    <span className="text-muted">{dish.quantity} x KSH {dish.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="d-flex justify-content-between">
                <span className='summary_total_details'>Delivery Charges (KSH)</span>
                <span className='price'>{deliveryCharges.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between">
                <span className='summary_total_details'>Total (KSH)</span>
                <span className='price'>{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="closeOrder" onClick={handleConfirmOrder}>Confirm</button>
              <button type="button" className="closeOrder" onClick={handleClose}>Close</button>
            </div>

          </div>
        </div>
      </div>
      <PaymentOptionsModal show={showPaymentModal} handleClose={() => setShowPaymentModal(false)} handlePayment={handlePayment} />
    </>
  );
};

export default OrderSummaryModal;
