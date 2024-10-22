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
        console.log('Fetching partner vendors...');
        const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}/vendors`);
        console.log('Partner vendors response:', response.data);
        setPartnerVendors(response.data);
      } catch (error) {
        console.error('Error fetching partner vendors:', error);
      }
    };

    fetchPartnerVendors();
  }, [partner]);

  useEffect(() => {
    if (partnerVendors.length > 0) {
      console.log('Partner vendors fetched:', partnerVendors);
      fetchFoodOrders();
    } else {
      console.log('No partner vendors found yet.');
    }
  }, [partnerVendors]);

  const fetchFoodOrders = async () => {
    try {
      console.log('Fetching food orders...');
      const response = await axios.get(`${config.backendUrl}/api/foodOrders`);
      console.log('Food orders response:', response.data);
      const allFoodOrders = response.data;

      // Filter undelivered vendor orders
      const undeliveredOrders = [];

      allFoodOrders.forEach(order => {
        const undeliveredVendorOrders = order.vendorOrders.filter(vendorOrder => 
          vendorOrder.status !== 'Delivered' &&
          partnerVendors.some(vendor => vendor.vendor === vendorOrder.vendor)
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


// Fetch Driver Details
const fetchDriverDetails = async (driverId) => {
  try {
    console.log(`Fetching driver details for driverId: ${driverId}`);
    const response = await axios.get(`${config.backendUrl}/api/getDriverDetails/${driverId}`);
    console.log('Driver details fetched:', response.data);
    return response.data; // Return driver details
  } catch (error) {
    console.error('Error fetching driver details:', error);
    throw error;
  }
};

// Update Food Order Status
const updateFoodOrderStatus = async (orderId, vendorId, nextStatus, driverId = null) => {
  try {
    console.log(`Updating order status for orderId: ${orderId}, vendorId: ${vendorId}, to status: ${nextStatus}`);

    let driverDetails = null;
    let pickedAt = null;

    // If the next status is "On Transit", fetch driver details
    if (nextStatus === 'On Transit' && driverId) {
      driverDetails = await fetchDriverDetails(driverId);
      pickedAt = new Date().toISOString(); // Add timestamp
    }

    // Update the vendor order status in the backend
    await axios.patch(`${config.backendUrl}/api/updateFoodOrderStatus/${orderId}/${vendorId}`, {
      status: nextStatus,
      ...(driverDetails && { driverDetails }),  // Include driver details if available
      ...(pickedAt && { pickedAt })            // Include timestamp when picked
    });

    // After updating, re-fetch all orders
    await fetchFoodOrders();

    // Check if all vendor orders have been marked as "On Transit"
    checkAndUpdateParentOrderStatus(orderId);
  } catch (error) {
    console.error('Error updating food order status:', error);
  }
};


const checkAndUpdateParentOrderStatus = async (orderId) => {
  try {
    const response = await axios.get(`${config.backendUrl}/api/getFoodOrder/${orderId}`);
    const foodOrder = response.data;
    console.log('Fetched food order data:', foodOrder);

    // Ensure vendorOrders is defined and an array
    if (!foodOrder || !Array.isArray(foodOrder.vendorOrders)) {
      console.error('Invalid food order or vendorOrders not found');
      return;
    }

    // Check if all vendor orders are marked as "On Transit"
    const allVendorsOnTransit = foodOrder.vendorOrders.every(vendorOrder => vendorOrder.status === 'On Transit');

    let newOverallStatus = 'Waiting for vendors';  // Default status

    if (allVendorsOnTransit) {
      newOverallStatus = 'On Transit';
    } else {
      // Determine the overall status based on the most advanced vendor status
      for (let vendorOrder of foodOrder.vendorOrders) {
        if (vendorOrder.status === 'Delivered') {
          newOverallStatus = 'Delivered';
          break;  // Delivered is the final status, no need to check further
        } else if (vendorOrder.status === 'Processed and packed') {
          newOverallStatus = 'Ready for pickup';
        } else if (vendorOrder.status === 'Dispatched') {
          newOverallStatus = 'Dispatched';
        } else if (vendorOrder.status === 'On Transit') {
          newOverallStatus = 'On Transit';  // This might be redundant but just to reinforce
        }
      }
    }

    // If the overall status needs to be updated
    if (foodOrder.overallStatus !== newOverallStatus) {
      await axios.patch(`${config.backendUrl}/api/updateParentFoodOrderStatus/${orderId}`, { overallStatus: newOverallStatus });
      console.log(`Food order ${orderId} overall status updated to '${newOverallStatus}'`);
    }
  } catch (error) {
    console.error('Error updating parent food order status:', error);
  }
};


// Status Buttons
const getStatusButtons = (status, orderId, vendorId, driverId) => {
  const statusSteps = ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'];
  const currentIndex = statusSteps.indexOf(status);
  const nextStatus = statusSteps[currentIndex + 1];

  return nextStatus ? (
    <button 
      className='statusbutn' 
      onClick={() => updateFoodOrderStatus(orderId, vendorId, nextStatus, driverId)}>
      Mark as {nextStatus}
    </button>
  ) : null;
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

    {/* Driver Details if present */}
    {vendorOrder.driverDetails && (
      <>
        <p><span className='detailsTitles'>Driver Name: </span>{vendorOrder.driverDetails.name}</p>
        <p><span className='detailsTitles'>Driver Contact: </span>{vendorOrder.driverDetails.contactNumber}</p>
        <p><span className='detailsTitles'>Vehicle Registration: </span>{vendorOrder.driverDetails.vehicleRegistration}</p>
        <p><span className='detailsTitles'>Picked At: </span>{new Date(vendorOrder.pickedAt).toLocaleString()}</p>
      </>
    )}

    {/* Status Buttons */}
    {getStatusButtons(vendorOrder.status, order.orderId, vendorOrder.vendor, order.driverId)}
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

    <div id="sales">
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
