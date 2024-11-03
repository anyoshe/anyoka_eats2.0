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
  

const fetchDriverDetails = async (driverId) => {
  try {
    console.log(`Fetching driver details for driverId: ${driverId}`);
    const response = await axios.get(`${config.backendUrl}/api/getDriverDetails/${driverId}`);
    console.log('Driver details fetched:', response.data);
    return response.data; // Ensure driver details are included here
  } catch (error) {
    console.error('Error fetching driver details:', error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, currentStatus, nextStatus, driverId) => {
  try {
    let driverDetails = null;
    let pickedAt = null;

    // If the next status is "On Transit", fetch driver details and add a timestamp
    if (nextStatus === 'On Transit') {
      if (!driverId) {
        throw new Error('Driver ID is required to move to On Transit');
      }

      driverDetails = await fetchDriverDetails(driverId);
      pickedAt = new Date().toISOString(); // Add timestamp
    }

    // Send the updated order status to the backend
    const response = await axios.patch(`${config.backendUrl}/api/updateOrderStatus/${orderId}`, {
      status: nextStatus,
      driverId,
      ...(driverDetails && { driverDetails }),
      ...(pickedAt && { pickedAt })
    });

    // Assuming the backend response includes the updated order
    const updatedOrder = response.data.order;

    // Now you need to update the UI with the updated order details
    // If you're storing orders in a state, update the state here
    updateOrdersInUI(updatedOrder);  // Create this function to update your state/UI

    fetchOrders(); // Optionally re-fetch all orders if needed
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};


const updateOrdersInUI = (updatedOrder) => {
  setOrders((prevOrders) =>
    prevOrders.map((order) =>
      order.orderId === updatedOrder.orderId ? updatedOrder : order
    )
  );
};

// Function to render status buttons based on current status
const getStatusButtons = (status, orderId, driverId) => {
  const statusOrder = ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'];
  const currentIndex = statusOrder.indexOf(status);
  const nextStatus = statusOrder[currentIndex + 1];

  // For "Dispatched" status, pass driverId to transition to "On Transit"
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
    <p><span className='detailsTitles'>Order ID: </span> {order.orderId}</p>
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

    {/* Driver details are shown only if they exist */}
    {order.driverDetails && (
      <>
        <p><span className='detailsTitles'>Driver Name: </span>{order.driverDetails.name}</p>
        <p><span className='detailsTitles'>Driver Contact: </span>{order.driverDetails.contactNumber}</p>
        <p><span className='detailsTitles'>Vehicle Registration: </span>{order.driverDetails.vehicleRegistration}</p>
        <p><span className='detailsTitles'>Picked At: </span>{new Date(order.pickedAt).toLocaleString()}</p>
      </>
    )}

    {/* Pass driverId if order is dispatched and ready to be marked as On Transit */}
    {getStatusButtons(order.status, order.orderId, order.driverId)}
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

      {/* <div id="sales">
        {/* <div id="salesList"></div> */}
        {/* <div id="salesTotal">
          <p>Total Sales:<span id="totalSales">Ksh.{totalSales.toFixed(2)}</span></p>
          <p>Commission Due:<span id="commissionDue">Ksh.{commissionDue.toFixed(2)}</span></p>
          <p>Total Deliveries Made:<span id="totalDeliveries">Ksh.{totalDeliveries}</span></p>
        </div>
      </div>  */}

    </div>
  );
};

export default UndeliveredOrders;


