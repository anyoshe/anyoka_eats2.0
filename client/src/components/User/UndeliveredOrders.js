import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';

const UndeliveredOrders = ({ partner }) => {
  const [orders, setOrders] = useState([]);
  const [expectedSales, setExpectedSales] = useState(0);
  const [expectedCommission, setExpectedCommission] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [commissionDue, setCommissionDue] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [partnerRestaurants, setPartnerRestaurants] = useState([]);

  
  useEffect(() => {
    const fetchPartnerRestaurants = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}/restaurants`);
        setPartnerRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching partner restaurants:', error);
      }
    };
  
    fetchPartnerRestaurants();
  }, [partner]);
  
  useEffect(() => {
    if (partnerRestaurants.length > 0) {
      fetchOrders();
    }
  }, [partnerRestaurants]);
  
  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const response = await axios.get(`${config.backendUrl}/api/orders`);
      const allOrders = response.data.filter(order => order.status !== undefined);
      const undeliveredOrders = allOrders.filter(order => order.status !== 'Delivered');
  
      console.log('Partner Restaurants during fetchOrders:', partnerRestaurants);
  
      const filteredOrders = undeliveredOrders.filter(order => 
        partnerRestaurants.some(restaurant => 
          restaurant.restaurant === order.selectedRestaurant 
        )
      );
      
      console.log('Filtered Orders:', filteredOrders);
  
      setOrders(filteredOrders);
      calculateTotals(filteredOrders);
  
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  
  const calculateTotals = (orders) => {
    let expectedSalesTotal = 0;
    let deliveredSalesTotal = 0;
    let deliveriesCount = 0;
  
    orders.forEach(order => {
      if (order.status !== 'Delivered') {
        expectedSalesTotal += order.totalPrice;
      } else {
        deliveredSalesTotal += order.totalPrice;
        deliveriesCount += 1;
      }
    });
  
    setExpectedSales(expectedSalesTotal);
    setExpectedCommission(expectedSalesTotal * 0.1); // 10% margin
    setTotalSales(deliveredSalesTotal);
    setCommissionDue(deliveredSalesTotal * 0.1); // 10% margin
    setTotalDeliveries(deliveriesCount);
  };
  

  const updateOrderStatus = async (orderId, nextStatus) => {
    try {
      await axios.patch(`${config.backendUrl}/api/updateOrderStatus/${orderId}`, { status: nextStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusButtons = (status, orderId) => {
    const statusOrder = ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'];
    const currentIndex = statusOrder.indexOf(status);
    const nextStatus = statusOrder[currentIndex + 1];

    return nextStatus ? (
      <button onClick={() => updateOrderStatus(orderId, nextStatus)}>Mark as {nextStatus}</button>
    ) : null;
  };

  const createOrderElement = (order) => (
    <div key={order.orderId} className="orderDetails">
      <p>Order ID: {order.orderId}</p>
      <p>Customer Name: {order.customerName}</p>
      <p>Phone Number: {order.phoneNumber}</p>
      <p>Dish Category: {order.selectedCategory}</p>
      <p>Location: {order.customerLocation}</p>
      <p>Expected Delivery Time: {order.expectedDeliveryTime}</p>
      <p>Dishes Ordered:</p>
      <ul>
        {order.dishes.map((dish) => (
          <li key={dish.dishName}>{dish.dishName} - Quantity: {dish.quantity}</li>
        ))}
      </ul>
      <p>Total Price: Kes.{order.totalPrice}.00</p>
      <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
      <p>Status: <span className="order-status">{order.status || 'undefined'}</span></p>
      {getStatusButtons(order.status, order.orderId)}
    </div>
  );

  const groupedOrders = orders.reduce((acc, order) => {
    const key = order.selectedRestaurant;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(order);
    return acc;
  }, {});

  return (
    <div className="dayOrders">
      <div id="ordersList">
        {Object.keys(groupedOrders).map((restaurant) => (
          <div key={restaurant} id={`${restaurant}-section`}>
            <h2>{restaurant}</h2>
            <hr />
            <ul id={`orders-${restaurant}`}>
              {groupedOrders[restaurant].map((order) => createOrderElement(order))}
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

export default UndeliveredOrders;


