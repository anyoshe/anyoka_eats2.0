import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import './Profile.css';

const AllUndeliveredOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expectedSales, setExpectedSales] = useState(0);
  const [expectedCommission, setExpectedCommission] = useState(0);

  useEffect(() => {
    fetchAllUndeliveredOrders();
  }, []);

  const fetchAllUndeliveredOrders = async () => {
    try {
      console.log('Fetching undelivered orders from all restaurants...');
      const response = await axios.get(`${config.backendUrl}/api/orders`);
      const allOrders = response.data;

      // Filter only undelivered orders
      const undeliveredOrders = allOrders.filter(order => order.status !== 'Delivered');
      console.log('Undelivered Orders:', undeliveredOrders);

      setOrders(undeliveredOrders);
      calculateTotals(undeliveredOrders);
    } catch (error) {
      console.error('Error fetching undelivered orders:', error);
    }
  };

  const calculateTotals = (orders) => {
    let expectedSalesTotal = 0;

    orders.forEach(order => {
      if (order.status !== 'Delivered') {
        expectedSalesTotal += order.totalPrice;
      }
    });

    setExpectedSales(expectedSalesTotal);
    setExpectedCommission(expectedSalesTotal * 0.1); // Assuming a 10% commission
  };

  const updateOrderStatus = async (orderId, currentStatus, nextStatus, driverId) => {
    try {
      let driverDetails = null;
      let pickedAt = null;

      if (nextStatus === 'On Transit') {
        if (!driverId) throw new Error('Driver ID is required to move to On Transit');
        
        driverDetails = await fetchDriverDetails(driverId);
        pickedAt = new Date().toISOString();
      }

      const response = await axios.patch(`${config.backendUrl}/api/updateOrderStatus/${orderId}`, {
        status: nextStatus,
        driverId,
        ...(driverDetails && { driverDetails }),
        ...(pickedAt && { pickedAt })
      });

      const updatedOrder = response.data.order;
      updateOrdersInUI(updatedOrder);
      fetchAllUndeliveredOrders(); // Refresh orders list
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const fetchDriverDetails = async (driverId) => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/getDriverDetails/${driverId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver details:', error);
      throw error;
    }
  };

  const updateOrdersInUI = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderId === updatedOrder.orderId ? updatedOrder : order
      )
    );
  };

  const getStatusButtons = (status, orderId, driverId) => {
    const statusOrder = ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'];
    const currentIndex = statusOrder.indexOf(status);
    const nextStatus = statusOrder[currentIndex + 1];

    return nextStatus ? (
      <button 
        className='statusbutn' 
        onClick={() => updateOrderStatus(orderId, status, nextStatus, driverId)}
      >
        Mark as {nextStatus}
      </button>
    ) : null;
  };

  const createOrderElement = (order) => (
    <div key={order.orderId} className="orderDetails">
      <p><span className='detailsTitles'>Order ID: </span>{order.orderId}</p>
      <p><span className='detailsTitles'>Name: </span>{order.customerName}</p>
      <p><span className='detailsTitles'>Number: </span>{order.phoneNumber}</p>
      <p><span className='detailsTitles'>Location: </span>{order.customerLocation}</p>
      <p><span className='detailsTitles'>Expected Time: </span>{order.expectedDeliveryTime}</p>
      <p><span className='detailsTitles'>Orders: </span></p>
      <ul>
        {order.dishes.map((dish) => (
          <li key={dish.dishName}>{dish.dishName} - Quantity: {dish.quantity}</li>
        ))}
      </ul>
      <p><span className='detailsTitles'>Total: Kes.</span>{order.totalPrice}.00</p>
      <p><span className='detailsTitles'>Created At: </span>{new Date(order.createdAt).toLocaleString()}</p>
      <p><span className='detailsTitles'>Status: </span><span className="order-status">{order.status || 'undefined'}</span></p>

      {order.driverDetails && (
        <>
          <p><span className='detailsTitles'>Driver Name: </span>{order.driverDetails.name}</p>
          <p><span className='detailsTitles'>Driver Contact: </span>{order.driverDetails.contactNumber}</p>
          <p><span className='detailsTitles'>Vehicle Registration: </span>{order.driverDetails.vehicleRegistration}</p>
          <p><span className='detailsTitles'>Picked At: </span>{new Date(order.pickedAt).toLocaleString()}</p>
        </>
      )}

      {getStatusButtons(order.status, order.orderId, order.driverId)}
    </div>
  );

  const groupedOrders = orders.reduce((acc, order) => {
    const key = order.selectedRestaurant;
    if (!acc[key]) acc[key] = [];
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
    </div>
  );
};

export default AllUndeliveredOrders;
