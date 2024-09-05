import React, { useState, useEffect } from 'react';
import config from '../../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './OrderTrackingModal.css'

const OrderTrackingModal = ({ isOpen, onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when the modal is closed
      setOrderId('');
      setOrderDetails(null);
      setError(null);
    }
  }, [isOpen]);

  const trackOrder = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/orders/${orderId}`);
      const order = await response.json();

      if (order) {
        setOrderDetails(order);
        updateOrderSchematic(order.status);
        setError(null);
      } else {
        setError('Order not found.');
        setOrderDetails(null);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Error fetching order.');
      setOrderDetails(null);
    }
  };

  const updateOrderSchematic = (status) => {
    const steps = [
      'Order Placed',
      'Order Received',
      'Processed and packed',
      'Dispatched',
      'Delivered',
      'Service Rating',
    ];

    const normalizedStatus = status.toLowerCase();

    steps.forEach((step, index) => {
      const stepElement = document.getElementById(`step${index + 1}`);
      stepElement.classList.remove('completed');
    });

    steps.forEach((step, index) => {
      const normalizedStep = step.toLowerCase();
      const stepElement = document.getElementById(`step${index + 1}`);
      if (steps.findIndex(s => s.toLowerCase() === normalizedStatus) >= index) {
        stepElement.classList.add('completed');
      }
    });
  };

  if (!isOpen) return null; 

  return (
    // console.log("Rendering modal"),
    // isOpen && (
      <div className="modal">
        <div className='modalDiv'>
        
          <h2 className='trackingHeader'>Track Your Order</h2>

          <div className='input_button'>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID"
              className='trackingInput'
            />

            <button onClick={trackOrder} className='trackingButton'>Track </button>
          </div>

          <div id="orderSchematic">
            <div className="step" id="step1">Order Placed</div>
            <div className="step" id="step2">Order Received</div>
            <div className="step" id="step3">Order Processed and Packed</div>
            <div className="step" id="step4">Order Dispatched</div>
            <div className="step" id="step5">Order Delivered</div>
            <div className="step" id="step6">Service Rating</div>
          </div>

          <div id="orderDetails2">
            {orderDetails ? (
              <>
                {/* <p>Order ID: {orderDetails.orderId}</p> */}
                {/* <p>Customer Name: {orderDetails.customerName}</p> */}
                <div className='divDetail_one details'>
                  <p className='detailP'><span className='tagSpan'>Name :</span> {orderDetails.customerName}</p>
                    {/* <p>Phone Number: {orderDetails.phoneNumber}</p> */}

                    <p className='detailP'><span className='tagSpan'>Delivery Location :</span> {orderDetails.customerLocation}</p>
                    
                    {/* <p>Expected Delivery Time: {orderDetails.expectedDeliveryTime}</p> */}
                  <p className='detailP'><span className='tagSpan'>Delivery Time :</span> {orderDetails.expectedDeliveryTime}</p>
                </div>

                <div className='divDetail_two details'>
                  <p className='detailP'><span className='tagSpan'>Status :</span> {orderDetails.status}</p>

                  <p className='detailP'><span className='tagSpan'>Dishes:</span></p>
                  
                  {/* <ul>
                    {orderDetails.dishes.map(dish => (
                      <li key={dish.dishName} className='orderList'>
                        {dish.dishName} - {dish.quantity} @ {dish.price}
                      </li>
                    ))}
                  </ul> */}
                  <ul className='orderUnList'>
                    {orderDetails.dishes.map(dish => (
                      <li key={dish.dishName} className='orderList'>
                        {dish.quantity}  {dish.dishName}  @  {dish.price}
                      </li>
                    ))}
                  </ul>

                  <p className='detailP'><span className='tagSpan'>Total Price : </span>{orderDetails.totalPrice}</p>

                </div>
              </>
            ) : (
              <p>{error}</p>
            )}
          </div>

         <div className='closeBtnDiv'> 
          <button onClick={onClose} className='trackinCloseButton'>Close</button>
         </div>

        </div>
      </div>
    // )
  );
};

export default OrderTrackingModal;

