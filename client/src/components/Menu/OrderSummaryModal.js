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

  if (!restaurantLocation || !pinnedLocation) {
    console.error('Restaurant or pinned location is missing:', { restaurantLocation, pinnedLocation });
    return null;
  }

  const distance = calculateDistance(restaurantLocation.lat, restaurantLocation.lng, pinnedLocation.lat, pinnedLocation.lng);

  let deliveryCharges = 0;
  if (distance <= 1) {
    deliveryCharges = 50; // Base charge for distances up to 2 km
  } else {
    deliveryCharges = 50 + (Math.ceil(distance - 1) * 40); // Base charge plus KES 30 for every km beyond 2 km
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

  const handlePayment = async (method) => {
    switch (method) {
      case 'visa':
        console.log('Processing Visa Card payment...');
        break;
      case 'mpesa':
        console.log('Processing M-Pesa payment...');
        try {
          const paymentPhoneNumber = prompt('Enter your M-Pesa phone number (format: 254712345678):', '254');
          if (!paymentPhoneNumber || !/^254\d{9}$/.test(paymentPhoneNumber)) {
            alert('Please enter a valid phone number in the format 254712345678.');
            return;
          }
          const amount = prompt('Enter the amount to pay:', grandTotal);
          if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
          }
          const response = await initiateMpesaPayment(paymentPhoneNumber, amount);
          if (response && response.ResponseCode === '0') {
            // Success is already handled inside initiateMpesaPayment
            return; // Ensure early return on success
          } else {
            handlePaymentFailure();
          }
        } catch (error) {
          console.error('M-Pesa payment error:', error);
          alert('Error initiating M-Pesa payment. Please try again.');
          handlePaymentFailure();
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
        amount
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        const data = response.data;
        if (data.ResponseCode === '0') {
          alert(data.CustomerMessage);
          await handlePaymentSuccess(data); // Handle success
          return data; // Ensure it returns after success
        } else {
          console.error('Payment failed:', data.ResponseDescription);
          alert('Payment failed. Please try again.');
          handlePaymentFailure(); // Handle failure
          return null;
        }
      } else {
        console.error('Failed to initiate payment:', response.statusText);
        alert('Error initiating M-Pesa payment. Please try again.');
        return null;
      }
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      alert('Error initiating M-Pesa payment. Please try again.');
      return null;
    }
  };
  
  const handlePaymentSuccess = async (data) => {
    try {
      const address = await getReadableAddress(pinnedLocation.lat, pinnedLocation.lng);
  
      // Save the order to the database first
      const orderDetails = {
        phoneNumber: contactNumber,
        selectedRestaurant: restaurantName,
        customerLocation: address,
        expectedDeliveryTime: selectedTime,
        dishes: orderedDishes,
        deliveryCharges: deliveryCharges,
        totalPrice: grandTotal,
      };
  
      await saveOrderToDatabase(orderDetails); // Save order to the database
  
      // Send the SMS notification, but catch errors separately
      try {
        await sendSmsNotification(data);
      } catch (smsError) {
        console.error('Error sending SMS:', smsError);
        // SMS failure should not impact the main success flow
      }
  
      alert('Payment successful! Your order is being processed.');
      clearCart();
      setShowPaymentModal(false);
  
      // Redirect after successful order processing
      redirectToHomePage();
  
    } catch (error) {
      console.error('Error during payment success process:', error);
      alert('There was an issue processing your order. Please try again.');
    }
  };
  
  // Separate redirection logic into a function
  const redirectToHomePage = () => {
    // Delay redirection for 2 seconds to allow user to see the success alert
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };
  
  const saveOrderToDatabase = async (orderDetails) => {
    try {

    console.log('Sending orderDetails to database:', orderDetails);

      // Send the updated orderDetails to the backend
      const response = await fetch(`${config.backendUrl}/api/paidOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails)
      });

      if (response.ok) {
        const data = await response.json(); 
        console.log('Order saved successfully:', data);
        alert('Order recieved successfully! Your order will be processed and dispatched as soon as possible.');
      
      } else {
        const error = await response.json();
        console.error('Error saving order:', error);
        alert('Error encountered in recieving your order: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error recieving your order. Please try again.');
    }
  };

  const sendSmsNotification = async (paymentData) => {
    const smsDetails = {
      phoneNumber: contactNumber,
      message: `Your payment of KSH ${grandTotal.toFixed(2)} was successful! Your order will be delivered to ${pinnedLocation} by ${selectedTime}.`,
    };
    
    try {
      const response = await axios.post(`${config.backendUrl}/api/sendSms`, smsDetails, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 200) {
        console.log('SMS sent successfully:', response.data);
      } else {
        console.error('Failed to send SMS:', response.data);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('There was an issue sending the SMS notification. Please check your network and try again.');
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
    const address =  getReadableAddress(pinnedLocation.lat, pinnedLocation.lng);
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
          <div className="modal-content cartModalContent">
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
