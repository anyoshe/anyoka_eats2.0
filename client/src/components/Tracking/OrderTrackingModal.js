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
      let order = null;

      // Attempt to fetch as a regular order (dishes)
      let response = await fetch(`${config.backendUrl}/api/orders/${orderId}`);
      if (response.ok) {
        order = await response.json();
        setOrderDetails(order);
        updateOrderSchematic(order.status, false); // false indicates a regular order
        setError(null);
      } else {
        // If not found, attempt to fetch as a FoodOrder
        response = await fetch(`${config.backendUrl}/api/foodorders/${orderId}`);
        if (response.ok) {
          order = await response.json();
          setOrderDetails(order);
          updateOrderSchematic(order.overallStatus, true); // true indicates a FoodOrder
          setError(null);
        } else {
          setError('Order not found.');
          setOrderDetails(null);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Error fetching order.');
      setOrderDetails(null);
    }
  };

  const updateOrderSchematic = (status, isFoodOrder) => {
    const steps = isFoodOrder
      ? ['Waiting for vendors', 'Ready for pickup', 'Dispatched', 'On Transit', 'Delivered']
      : ['Order Received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'];

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
          {/* <div className="step" id="step1">Order Placed</div> */}
          <div className="step" id="step1">Order Received</div>
          <div className="step" id="step2">Order Processed and Packed</div>
          <div className="step" id="step3">Order Dispatched</div>
          <div className="step" id="step4">On Transit</div>
          <div className="step" id="step5">Order Delivered</div>
          {/* <div className="step" id="step6">Service Rating</div> */}
        </div>

        <div id="orderDetails2">
          {orderDetails ? (
            orderDetails.vendorOrders ? (
              <>
                <div className='divDetail_one details'>
                  <p className='detailP'><span className='tagSpan'>Name :</span> {orderDetails.customerName}</p>
                  <p className='detailP'><span className='tagSpan'>Delivery Location :</span> {orderDetails.customerLocation}</p>
                  <p className='detailP'><span className='tagSpan'>Delivery Time :</span> {orderDetails.expectedDeliveryTime}</p>
                </div>

                <div className='divDetail_two details'>
                  <p className='detailP'><span className='tagSpan'>Overall Status :</span> {orderDetails.overallStatus}</p>
                  <p className='detailP'><span className='tagSpan'>Total Price :</span> {orderDetails.totalPrice.toFixed(2)}</p>

                  {orderDetails.vendorOrders.map((vendorOrder, index) => (
                    <div key={index} className='vendorOrder'>
                      <h4>Vendor: {vendorOrder.vendor}</h4>
                      <ul>
                        {vendorOrder.foods.map((food, idx) => (
                          <li key={idx}>
                            {food.quantity} {food.foodName} @ {food.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                      <p>Vendor Total: {vendorOrder.totalPrice.toFixed(2)}</p>
                      <p>Status: {vendorOrder.status}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className='divDetail_one details'>
                  <p className='detailP'><span className='tagSpan'>Name :</span> {orderDetails.customerName}</p>
                  <p className='detailP'><span className='tagSpan'>Delivery Location :</span> {orderDetails.customerLocation}</p>
                  <p className='detailP'><span className='tagSpan'>Delivery Time :</span> {orderDetails.expectedDeliveryTime}</p>
                </div>

                <div className='divDetail_two details'>
                  <p className='detailP'><span className='tagSpan'>Status :</span> {orderDetails.status}</p>
                  <p className='detailP'><span className='tagSpan'>Dishes:</span></p>
                  <ul className='orderUnList'>
                    {orderDetails.dishes.map(dish => (
                      <li key={dish.dishName} className='orderList'>
                         {dish.quantity} {dish.dishName} @ {dish.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p className='detailP'><span className='tagSpan'>Total Price :</span> {orderDetails.totalPrice.toFixed(2)}</p>
                </div>
              </>
            )
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

