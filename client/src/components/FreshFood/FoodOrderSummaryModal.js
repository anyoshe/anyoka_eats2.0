/* global google */
import React, { useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;

const calculateDistance = async (lat1, lon1, lat2, lon2) => {
  const service = new google.maps.DistanceMatrixService();

  return new Promise((resolve, reject) => {
    service.getDistanceMatrix(
      {
        origins: [new google.maps.LatLng(lat1, lon1)],  // Starting point (vendor)
        destinations: [new google.maps.LatLng(lat2, lon2)],  // End point (customer or pinned location)
        travelMode: 'DRIVING',  // You can change to 'WALKING', 'BICYCLING', or 'TRANSIT'
      },
      (response, status) => {
        if (status === 'OK') {
          const distanceInMeters = response.rows[0].elements[0].distance.value;  // Distance in meters
          const distanceInKm = distanceInMeters / 1000;  // Convert to kilometers
          resolve(distanceInKm);
        } else {
          reject(`Error calculating distance: ${status}`);
        }
      }
    );
  });
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
            <button type="button" className="btn btn-success m-2" onClick={() => handlePayment('mpesa')}>Mpesa</button>
            <button type="button" className="btn btn-primary m-2" onClick={() => handlePayment('visa')}>Visa Card</button>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSummaryModal = ({
  show, handleClose, vendorName, orderedFoods = [], vendorLocation, pinnedLocation, totalDistanceBetweenVendors
}) => {
  const [contactNumber, setContactNumber] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [distanceToPinned, setDistanceToPinned] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const foodOrdersByVendor = orderedFoods.reduce((acc, food) => {
    const vendorName = food.vendor;  // Assuming food.vendorName or food.vendorId references the vendor.
    if (!acc[vendorName]) {
      acc[vendorName] = {
        vendorName: food.vendorName,
        foods: [],
      };
    }
    acc[vendorName].foods.push(food);
    return acc;
  }, {});

  const isSingleVendor = Object.keys(foodOrdersByVendor).length === 1;

  // Fetch distance on component load
  useEffect(() => {
    if (vendorLocation && pinnedLocation) {
      async function fetchDistance() {
        try {
          const calculatedDistanceToPinned = await calculateDistance(vendorLocation.lat, vendorLocation.lng, pinnedLocation.lat, pinnedLocation.lng);
          setDistanceToPinned(calculatedDistanceToPinned);

          const totalDistance = totalDistanceBetweenVendors + calculatedDistanceToPinned;
          console.log('Total Distance:', totalDistance);

          const newDeliveryCharges = totalDistance <= 1 ? 50 : 50 + (Math.ceil(totalDistance - 1) * 30);
          setDeliveryCharges(newDeliveryCharges);

          const totalFoodsPrice = orderedFoods.reduce((total, food) => total + food.price * food.quantity, 0);
          setGrandTotal(totalFoodsPrice + newDeliveryCharges);
        } catch (error) {
          console.error('Error fetching distance:', error);
        }
      }

      fetchDistance();
    }
  }, [vendorLocation, pinnedLocation, totalDistanceBetweenVendors, orderedFoods]);

  const handleContactNumberChange = (e) => setContactNumber(e.target.value);
  const handleTimeChange = (e) => setSelectedTime(e.target.value);

  const handleConfirmOrder = () => {
    if (!contactNumber) {
      alert('Please enter your contact number');
      return;
    }
    if (!selectedTime) {
      alert('Please enter the time you expect your order.');
      return;
    }
    setShowPaymentModal(true);
  };

  const getReadableAddress = async (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        // Extracting the most relevant address
        const address = data.results[0].formatted_address;
        console.log('Formatted Address:', address);
        return address;
      } else {
        console.error('Error fetching address:', data);
        throw new Error('No results found for the provided location.');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  };

  const handlePayment = async (method) => {
    try {
      if (method === 'mpesa') {
        const paymentPhoneNumber = prompt('Enter your M-Pesa phone number (format: 254712345678):', '254');
        if (!paymentPhoneNumber || !/^254\d{9}$/.test(paymentPhoneNumber)) {
          alert('Please enter a valid phone number.');
          return;
        }

        let amount;
        let validAmount = false;
        while (!validAmount) {
          amount = prompt('Enter the amount to pay:', grandTotal);
          if (isNaN(amount) || amount <= 0 || amount.includes('.') || !Number.isInteger(Number(amount))) {
            alert('Please enter a valid whole number.');
          } else {
            validAmount = true;
          }
        }

        const response = await initiateMpesaPayment(paymentPhoneNumber, amount);
        if (response && response.ResponseCode === '0') {
          alert('Payment successful!');
          setShowPaymentModal(false);

          const address = await getReadableAddress(pinnedLocation.lat, pinnedLocation.lng);

          if (isSingleVendor) {
            const [vendor] = Object.keys(foodOrdersByVendor);
            const vendorFoodsPrice = foodOrdersByVendor[vendor].foods.reduce((total, food) => total + food.price * food.quantity, 0);

            const foodOrderDetails = {
              phoneNumber: contactNumber,
              selectedVendor: vendor,
              customerLocation: address,
              expectedDeliveryTime: selectedTime,
              foods: foodOrdersByVendor[vendor].foods,
              deliveryCharges,
              totalPrice: vendorFoodsPrice + deliveryCharges,
            };

            await saveOrderToDatabase(foodOrderDetails);
          } else {
            for (const [vendor, vendorFoods] of Object.entries(foodOrdersByVendor)) {
              const vendorFoodsPrice = vendorFoods.foods.reduce((total, food) => total + food.price * food.quantity, 0);

              const foodOrderDetails = {
                phoneNumber: contactNumber,
                selectedVendor: vendor,
                customerLocation: address,
                expectedDeliveryTime: selectedTime,
                foods: vendorFoods.foods,
                deliveryCharges,  // You can adjust this for each vendor if needed
                totalPrice: vendorFoodsPrice + deliveryCharges,
              };

              await saveOrderToDatabase(foodOrderDetails);
            }
          }

          clearCart();
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          handlePaymentFailure();
        }
      } else {
        console.error('Unsupported payment method.');
      }
    } catch (error) {
      console.error('Error in handlePayment:', error);
      alert('An error occurred while processing the payment.');
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
          return data;
        } else {
          console.error('Payment failed:', data.ResponseDescription);
          alert('Payment failed. Please try again.');
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


  // const saveOrderToDatabase = async (foodOrderDetails) => {
  //   const maxRetries = 5; // Maximum number of retry attempts
  //   let attempts = 0;
  //   let orderSaved = false;

  //   while (attempts < maxRetries && !orderSaved) {
  //     try {
  //       console.log('Sending foodOrderDetails to database:', foodOrderDetails);

  //       // Send the updated foodOrderDetails to the backend
  //       const response = await fetch(`${config.backendUrl}/api/paidFoodOrder`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(foodOrderDetails),
  //       });

  //       console.log('Response from backend:', response);

  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log('Order saved successfully:', data);
  //         alert('Order recieved successfully! Your order will be processed and dispatched as soon as possible.');
  //         orderSaved = true;
  //       } else {
  //         const error = await response.json();
  //         console.error('Error saving order:', error);
  //         alert('Error saving order: ' + error.message);
  //         attempts++;
  //       }
  //     } catch (error) {
  //       console.error('Error saving order:', error);
  //       alert('Error saving order. Please check your network and try again.');
  //       attempts++;
  //     }

  //     // If the order was not saved and we have reached the maximum retries
  //     if (!orderSaved && attempts >= maxRetries) {
  //       alert('Failed to save order after multiple attempts. Please check your network and try again later.');
  //     }
  //   }
  // };

  const saveOrderToDatabase = async (foodOrderDetails) => {
    const maxRetries = 5; // Maximum number of retry attempts
    let attempts = 0;
    let orderSaved = false;

    while (attempts < maxRetries && !orderSaved) {
      try {
        console.log('Sending foodOrderDetails to database:', foodOrderDetails);

        // Send the updated foodOrderDetails to the backend
        const response = await fetch(`${config.backendUrl}/api/paidFoodOrder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(foodOrderDetails),
        });

        console.log('Response from backend:', response);

        if (response.ok) {
          const data = await response.json();
          console.log('Order saved successfully:', data);
          alert('Order received successfully! Your order will be processed and dispatched as soon as possible.');
          orderSaved = true;
        } else {
          const error = await response.json();
          console.error('Error saving order:', error);
          alert('Error saving order: ' + (error.message || 'An unknown error occurred.'));
          attempts++;
        }
      } catch (error) {
        console.error('Error saving order:', error);

        // Handling network-related errors with a fallback message
        const errorMessage = error.message || 'Network error. Please check your connection and try again.';
        alert('Error saving order: ' + errorMessage);
        attempts++;
      }
    }

    if (!orderSaved && attempts >= maxRetries) {
      alert('Failed to save the order after multiple attempts. Please try again later.');
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
        alert('Order has been canceled.');
        setShowPaymentModal(false);

      }
    } setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const saveOrderForLater = () => {
    const foodOrderDetails = {
      phoneNumber: contactNumber,
      selectedVendor: vendorName,
      customerLocation: pinnedLocation,
      expectedDeliveryTime: selectedTime,
      foods: orderedFoods,
      deliveryCharges: deliveryCharges,
      totalPrice: grandTotal,
    };
    localStorage.setItem('savedOrder', JSON.stringify(foodOrderDetails));
  };



  return (
    <>
      <div className={`modal fade ${show ? 'show' : ''}`} id="orderSummaryModal" tabIndex="-1" aria-labelledby="orderSummaryModalLabel" aria-hidden="true" style={{ display: show ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="orderSummaryModalLabel">Order Summary</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="form-group my-3">
                <label htmlFor="contactNumber">Contact Number</label>
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
                <label htmlFor="deliveryTime">Expected Delivery Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="deliveryTime"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  required
                />
              </div>

              {/* Display ordered foods grouped by vendor */}
              {Object.entries(foodOrdersByVendor).map(([vendorName, { foods }], vendorIndex) => (
                <div key={vendorIndex}>
                  <h5>{vendorName}</h5>
                  <ul className="list-group mb-3">
                    {foods.map((food, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between lh-sm">
                        <div>
                          <h6 className="my-0">{food.foodName}</h6>
                          <small className="text-muted">{food.foodDescription}</small>
                        </div>
                        <span className="text-muted">{food.quantity} x KES {food.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="d-flex justify-content-between">
                <span>Delivery Charges (KES)</span>
                <strong>{deliveryCharges.toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Total (KES)</span>
                <strong>{grandTotal.toFixed(2)}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmOrder}>Confirm Order</button>
            </div>
          </div>
        </div>
      </div>

      <PaymentOptionsModal show={showPaymentModal} handleClose={() => setShowPaymentModal(false)} handlePayment={handlePayment} />
    </>
  );
};

export default OrderSummaryModal;
