import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';

const AllUndeliveredFoodOrders = () => {
  const [foodOrders, setFoodOrders] = useState([]);
  const [expectedSales, setExpectedSales] = useState(0);
  const [expectedCommission, setExpectedCommission] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [commissionDue, setCommissionDue] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);

  useEffect(() => {
    fetchFoodOrders();
  }, []);

  const fetchFoodOrders = async () => {
    try {
      console.log('Fetching all food orders...');
      const response = await axios.get(`${config.backendUrl}/api/foodOrders`);
      console.log('Food orders response:', response.data);
      const allFoodOrders = response.data;

      // Filter undelivered vendor orders
      const undeliveredOrders = [];

      allFoodOrders.forEach(order => {
        const undeliveredVendorOrders = order.vendorOrders.filter(vendorOrder => 
          vendorOrder.status !== 'Delivered'
        );

        if (undeliveredVendorOrders.length > 0) {
          undeliveredOrders.push({ ...order, vendorOrders: undeliveredVendorOrders });
        }
      });

      console.log('Filtered undelivered orders:', undeliveredOrders);
      setFoodOrders(undeliveredOrders);
      calculateTotals(undeliveredOrders);

    } catch (error) {
      console.error('Error fetching food orders:', error);
    }
  };

  const calculateTotals = (foodOrders) => {
    console.log('Calculating totals for food orders:', foodOrders);
    let expectedSalesTotal = 0;
    let deliveredSalesTotal = 0;
    let deliveriesCount = 0;

    foodOrders.forEach(order => {
      order.vendorOrders.forEach(vendorOrder => {
        if (vendorOrder.status !== 'Delivered') {
          expectedSalesTotal += vendorOrder.totalPrice;
        } else {
          deliveredSalesTotal += vendorOrder.totalPrice;
          deliveriesCount += 1;
        }
      });
    });

    console.log('Expected Sales Total:', expectedSalesTotal);
    console.log('Delivered Sales Total:', deliveredSalesTotal);
    console.log('Deliveries Count:', deliveriesCount);

    setExpectedSales(expectedSalesTotal);
    setExpectedCommission(expectedSalesTotal * 0.1); // 10% commission
    setTotalSales(deliveredSalesTotal);
    setCommissionDue(deliveredSalesTotal * 0.1); // 10% commission
    setTotalDeliveries(deliveriesCount);
  };

  // Status Buttons
  const getStatusButtons = (status, orderId, vendorId) => {
    const statusSteps = ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'];
    const currentIndex = statusSteps.indexOf(status);
    const nextStatus = statusSteps[currentIndex + 1];

    return nextStatus ? (
      <button 
        className='statusbutn' 
        onClick={() => updateFoodOrderStatus(orderId, vendorId, nextStatus)}>
        Mark as {nextStatus}
      </button>
    ) : null;
  };

  // Update Food Order Status
  const updateFoodOrderStatus = async (orderId, vendorId, nextStatus) => {
    try {
      console.log(`Updating order status for orderId: ${orderId}, vendorId: ${vendorId}, to status: ${nextStatus}`);

      const response = await axios.patch(`${config.backendUrl}/api/updateFoodOrderStatus/${orderId}/${vendorId}`, {
        status: nextStatus,
      });

      console.log("Response from backend after status update:", response.data);

      // Re-fetch all orders after status update
      fetchFoodOrders();
    } catch (error) {
      console.error('Error updating food order status:', error);
    }
  };

  // Create Food Order Element
  const createFoodOrderElement = (order, vendorOrder) => (
    <div key={vendorOrder._id} className="orderDetails">
      <p><span className='detailsTitles'>Order ID: </span> {order.orderId}</p>
      <p><span className='detailsTitles'>Name: </span>{order.customerName}</p>
      <p><span className='detailsTitles'>Number: </span>{order.phoneNumber}</p>
      <p><span className='detailsTitles'>Location: </span> {order.customerLocation}</p>
      <p><span className='detailsTitles'>Expected Delivery Time: </span> {order.expectedDeliveryTime}</p>
      <p><span className='detailsTitles'>Foods Ordered: </span></p>
      <ul>
        {vendorOrder.foods.map((food) => (
          <li key={food.foodName}>{food.foodName} - Quantity: {food.quantity}</li>
        ))}
      </ul>
      <p><span className='detailsTitles'>Delivery Charges: Kes.</span>{vendorOrder.deliveryCharges}.00</p>
      <p><span className='detailsTitles'>Total Price: Kes.</span>{vendorOrder.totalPrice}.00</p>
      <p><span className='detailsTitles'>Status: </span><span className="order-status">{vendorOrder.status || 'undefined'}</span></p>

      {/* Status Buttons */}
      {getStatusButtons(vendorOrder.status, order.orderId, vendorOrder._id)}
    </div>
  );

  // Group and Display Food Orders
  const groupedFoodOrders = foodOrders.reduce((acc, order) => {
    order.vendorOrders.forEach(vendorOrder => {
      const key = vendorOrder.vendor;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({ order, vendorOrder });
    });
    return acc;
  }, {});

  return (
    <div className="dayOrders">
      <div id="ordersList">
        {Object.keys(groupedFoodOrders).map((vendor) => (
          <div key={vendor} id={`${vendor}-section`}>
            <h2>{vendor}</h2>
            <hr className='orderhr' />
            <ul id={`orders-${vendor}`}>
              {groupedFoodOrders[vendor].map(({ order, vendorOrder }) => createFoodOrderElement(order, vendorOrder))}
            </ul>
          </div>
        ))}
      </div>

      <div id="worthSummary">
        <p>Expected Sales: <span id="totalSalesExpected" className='downtotals'> Ksh.{expectedSales.toFixed(2)}</span></p>
        <p>Expected Commission: <span id="commissionExpected" className='downtotals'>Ksh.{expectedCommission.toFixed(2)}</span></p><br />
      </div>
    </div>
  );
};

export default AllUndeliveredFoodOrders;
