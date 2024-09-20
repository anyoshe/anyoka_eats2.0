import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import './Profile.css';

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
      <button className='statusbutn' onClick={() => updateOrderStatus(orderId, nextStatus)}>Mark as {nextStatus}</button>
    ) : null;
  };

  const createOrderElement = (order) => (
    <div key={order.orderId} className="orderDetails">
      <p>
        <span className='detailsTitles'>Order ID: </span> 
        {order.orderId}
      </p>

      <p>
        {/* <span className='detailsTitles'>Customer Name: </span>  */}
        <span className='detailsTitles'>Name: </span>
        {order.customerName}
      </p>

      <p>
        {/* <span className='detailsTitles'>Phone Number: </span>  */}
        <span className='detailsTitles'>Number: </span> 
        {order.phoneNumber}
      </p>

      {/* <p>Dish Category: {order.selectedCategory}</p> */}

      <p>
        <span className='detailsTitles'>Location: </span>
        {order.customerLocation}
      </p>

      <p>
        {/* <span className='detailsTitles'>Expected Delivery Time: </span>  */}
        <span className='detailsTitles'>Expected Time: </span> 
        {order.expectedDeliveryTime}
      </p>

      <p>
        {/* <span className='detailsTitles'>Dishes Ordered: </span> */}
        <span className='detailsTitles'>Orders: </span>
      </p>

      <ul>
        {order.dishes.map((dish) => (
          <li key={dish.dishName}>{dish.dishName} - Quantity: {dish.quantity}</li>
        ))}
      </ul>

      <p>
        {/* <span className='detailsTitles'>Total Price: Kes.</span> */}
        <span className='detailsTitles'>Total: Kes.</span>
        {order.totalPrice}.00
      </p>

      <p>
        <span className='detailsTitles'>Created At:</span> 
      {new Date(order.createdAt).toLocaleString()}
      </p>

      <p>
        <span className='detailsTitles'>Status:</span> 
        <span className="order-status">{order.status || 'undefined'}</span>
      </p>

      {getStatusButtons(order.status, order.orderId )}
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
          <div key={restaurant} id={`${restaurant}-section`} className='orderh2Divs'>

            <h2 className='orderh2title'>{restaurant}</h2>

            <hr className='orderhr' />

            <ul id={`orders-${restaurant}`} className='unorderdOrderList'>
              {groupedOrders[restaurant].map((order) => createOrderElement(order))}
            </ul>
          </div>
        ))}
      </div>

      <div id="worthSummary">
        <p>Expected Sales:<span id="totalSalesExpected" className='downtotals'>Ksh.{expectedSales.toFixed(2)}</span></p>
        <p>Expected Commission:<span id="commissionExpected" className='downtotals'>Ksh.{expectedCommission.toFixed(2)}</span></p><br />
      </div>

      <div id="sales">
        {/* <div id="salesList"></div> */}
        <div id="salesTotal">
          <p>Total Sales:<span id="totalSales">Ksh.{totalSales.toFixed(2)}</span></p>
          <p>Commission Due:<span id="commissionDue">Ksh.{commissionDue.toFixed(2)}</span></p>
          <p>Total Deliveries Made:<span id="totalDeliveries">Ksh.{totalDeliveries}</span></p>
        </div>
      </div>

    </div>
  );
};

export default UndeliveredOrders;


