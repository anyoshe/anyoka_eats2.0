import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';

const UndeliveredFoodOrders = ({ partner }) => {
  const [foodOrders, setFoodOrders] = useState([]);
  const [expectedSales, setExpectedSales] = useState(0);
  const [expectedCommission, setExpectedCommission] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [commissionDue, setCommissionDue] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [partnerVendors, setPartnerVendors] = useState([]);

  
  useEffect(() => {
    const fetchPartnerVendors = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}/vendors`);
        setPartnerVendors(response.data);
      } catch (error) {
        console.error('Error fetching partner vendors:', error);
      }
    };
  
    fetchPartnerVendors();
  }, [partner]);
  
  useEffect(() => {
    if (partnerVendors.length > 0) {
      fetchFoodOrders();
    }
  }, [partnerVendors]);
  
  const fetchFoodOrders = async () => {
    try {
      console.log('Fetching foodOrders...');
      const response = await axios.get(`${config.backendUrl}/api/foodOrders`);
      const allFoodOrders = response.data.filter(foodOrder => foodOrder.status !== undefined);
      const undeliveredFoodOrders = allFoodOrders.filter(foodOrder => foodOrder.status !== 'Delivered');
  
      console.log('Partner Vendors during fetchFoodOrders:', partnerVendors);
  
      const filteredFoodOrders = undeliveredFoodOrders.filter(foodOrder => 
        partnerVendors.some(vendor => 
          vendor.vendor === foodOrder.selectedVendor 
        )
      );
      
      console.log('Filtered FoodOrders:', filteredFoodOrders);
  
      setFoodOrders(filteredFoodOrders);
      calculateTotals(filteredFoodOrders);
  
    } catch (error) {
      console.error('Error fetching foodOrders:', error);
    }
  };
  
  const calculateTotals = (foodOrders) => {
    let expectedSalesTotal = 0;
    let deliveredSalesTotal = 0;
    let deliveriesCount = 0;
  
    foodOrders.forEach(foodOrder => {
      if (foodOrder.status !== 'Delivered') {
        expectedSalesTotal += foodOrder.totalPrice;
      } else {
        deliveredSalesTotal += foodOrder.totalPrice;
        deliveriesCount += 1;
      }
    });
  
    setExpectedSales(expectedSalesTotal);
    setExpectedCommission(expectedSalesTotal * 0.1); // 10% margin
    setTotalSales(deliveredSalesTotal);
    setCommissionDue(deliveredSalesTotal * 0.1); // 10% margin
    setTotalDeliveries(deliveriesCount);
  };
  

  const updateFoodOrderStatus = async (orderId, nextStatus) => {
    try {
      await axios.patch(`${config.backendUrl}/api/updateFoodOrderStatus/${orderId}`, { status: nextStatus });
      fetchFoodOrders();
    } catch (error) {
      console.error('Error updating foodOrder status:', error);
    }
  };

  const getStatusButtons = (status, orderId) => {
    const statusFoodOrder = ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'];
    const currentIndex = statusFoodOrder.indexOf(status);
    const nextStatus = statusFoodOrder[currentIndex + 1];

    return nextStatus ? (
      <button onClick={() => updateFoodOrderStatus(orderId, nextStatus)}>Mark as {nextStatus}</button>
    ) : null;
  };

  const createFoodOrderElement = (foodOrder) => (
    <div key={foodOrder.orderId} className="orderDetails">
      <p>Order ID: {foodOrder.orderId}</p>
      <p>Customer Name: {foodOrder.customerName}</p>
      <p>Phone Number: {foodOrder.phoneNumber}</p>
      <p>Food Category: {foodOrder.selectedCategory}</p>
      <p>Location: {foodOrder.customerLocation}</p>
      <p>Expected Delivery Time: {foodOrder.expectedDeliveryTime}</p>
      <p>Foods Ordered:</p>
      <ul>
        {foodOrder.foods.map((food) => (
          <li key={food.foodName}>{food.foodName} - Quantity: {food.quantity}</li>
        ))}
      </ul>
      <p>Total Price: Kes.{foodOrder.totalPrice}.00</p>
      <p>Created At: {new Date(foodOrder.createdAt).toLocaleString()}</p>
      <p>Status: <span className="order-status">{foodOrder.status || 'undefined'}</span></p>
      {getStatusButtons(foodOrder.status, foodOrder.orderId)}
    </div>
  );

  const groupedFoodOrders = foodOrders.reduce((acc, foodOrder) => {
    const key = foodOrder.selectedVendor;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(foodOrder);
    return acc;
  }, {});

  return (
    <div className="dayOrders">
      <div id="ordersList">
        {Object.keys(groupedFoodOrders).map((vendor) => (
          <div key={vendor} id={`${vendor}-section`}>
            <h2>{vendor}</h2>
            <hr />
            <ul id={`orders-${vendor}`}>
              {groupedFoodOrders[vendor].map((foodOrder) => createFoodOrderElement(foodOrder))}
            </ul>
          </div>
        ))}
      </div>
      <div id="worthSummary">
        <p>Expected Sales: Kes. <span id="totalSalesExpected">{expectedSales.toFixed(2)}</span></p>
        <p>Expected Commission: Kes. <span id="commissionExpected">{expectedCommission.toFixed(2)}</span></p><br />
      </div>
      <div id="sales">
        <div id="salesList"></div>
        <div id="salesTotal">
          <p>Total Sales: Kes. <span id="totalSales">{totalSales.toFixed(2)}</span></p>
          <p>Commission Due: Kes. <span id="commissionDue">{commissionDue.toFixed(2)}</span></p>
          <p>Total Deliveries Made: <span id="totalDeliveries">{totalDeliveries}</span></p>
        </div>
      </div>
    </div>
  );
};

export default UndeliveredFoodOrders;


