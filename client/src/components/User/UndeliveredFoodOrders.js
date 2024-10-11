// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import config from '../../config';

// const UndeliveredFoodOrders = ({ partner }) => {
//   const [foodOrders, setFoodOrders] = useState([]);
//   const [expectedSales, setExpectedSales] = useState(0);
//   const [expectedCommission, setExpectedCommission] = useState(0);
//   const [totalSales, setTotalSales] = useState(0);
//   const [commissionDue, setCommissionDue] = useState(0);
//   const [totalDeliveries, setTotalDeliveries] = useState(0);
//   const [partnerVendors, setPartnerVendors] = useState([]);

//   useEffect(() => {
//     const fetchPartnerVendors = async () => {
//       try {
//         const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}/vendors`);
//         setPartnerVendors(response.data);
//       } catch (error) {
//         console.error('Error fetching partner vendors:', error);
//       }
//     };
  
//     fetchPartnerVendors();
//   }, [partner]);
  
//   useEffect(() => {
//     if (partnerVendors.length > 0) {
//       fetchFoodOrders();
//     }
//   }, [partnerVendors]);
  
//   const fetchFoodOrders = async () => {
//     try {
//       console.log('Fetching foodOrders...');
//       const response = await axios.get(`${config.backendUrl}/api/foodOrders`);
//       const allFoodOrders = response.data.filter(foodOrder => foodOrder.status !== undefined);
//       const undeliveredFoodOrders = allFoodOrders.filter(foodOrder => foodOrder.status !== 'Delivered');

//       console.log('Partner Vendors during fetchFoodOrders:', partnerVendors);
  
//       const filteredFoodOrders = undeliveredFoodOrders.filter(foodOrder => 
//         partnerVendors.some(vendor => 
//           vendor.vendor === foodOrder.selectedVendor 
//         )
//       );
      
//       console.log('Filtered FoodOrders:', filteredFoodOrders);
  
//       setFoodOrders(filteredFoodOrders);
//       calculateTotals(filteredFoodOrders);
  
//     } catch (error) {
//       console.error('Error fetching foodOrders:', error);
//     }
//   };
  
//   const calculateTotals = (foodOrders) => {
//     let expectedSalesTotal = 0;
//     let deliveredSalesTotal = 0;
//     let deliveriesCount = 0;
  
//     foodOrders.forEach(foodOrder => {
//       if (foodOrder.status !== 'Delivered') {
//         expectedSalesTotal += foodOrder.totalPrice;
//       } else {
//         deliveredSalesTotal += foodOrder.totalPrice;
//         deliveriesCount += 1;
//       }
//     });
  
//     setExpectedSales(expectedSalesTotal);
//     setExpectedCommission(expectedSalesTotal * 0.1); // 10% margin
//     setTotalSales(deliveredSalesTotal);
//     setCommissionDue(deliveredSalesTotal * 0.1); // 10% margin
//     setTotalDeliveries(deliveriesCount);
//   };

//   const updateFoodOrderStatus = async (orderId, vendorId, nextStatus) => {
//     try {
//       await axios.patch(`${config.backendUrl}/api/updateFoodOrderStatus/${orderId}/${vendorId}`, { status: nextStatus });
//       fetchFoodOrders();
//     } catch (error) {
//       console.error('Error updating foodOrder status:', error);
//     }
//   };

//   const getStatusButtons = (status, orderId, vendorId) => {
//     const statusFoodOrder = ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'];
//     const currentIndex = statusFoodOrder.indexOf(status);
//     const nextStatus = statusFoodOrder[currentIndex + 1];

//     return nextStatus ? (
//       <button className='statusbutn' onClick={() => updateFoodOrderStatus(orderId, vendorId, nextStatus)}>Mark as {nextStatus}</button>
//     ) : null;
//   };

//   const createFoodOrderElement = (foodOrder) => (
//     <div key={foodOrder.orderId} className="orderDetails">     
//       <p><span className='detailsTitles'>Order ID: </span> {foodOrder.orderId}</p>
//       <p><span className='detailsTitles'>Name: </span>{foodOrder.customerName}</p>
//       <p><span className='detailsTitles'>Number: </span>{foodOrder.phoneNumber}</p>
//       <p><span className='detailsTitles'>Location: </span> {foodOrder.customerLocation}</p>
//       <p><span className='detailsTitles'>Expected Delivery Time: </span> {foodOrder.expectedDeliveryTime}</p>
//       <p><span className='detailsTitles'>Foods Ordered: </span></p>
//       <ul>
//         {foodOrder.foods.map((food) => (
//           <li key={food.foodName}>{food.foodName} - Quantity: {food.quantity}</li>
//         ))}
//       </ul>
//       <p><span className='detailsTitles'>Delivery Charges: Kes.</span>{foodOrder.deliveryCharges}.00</p>
//       <p><span className='detailsTitles'>Total Price: Kes.</span>{foodOrder.totalPrice}.00</p>
//       <p><span className='detailsTitles'>Created At:</span>{new Date(foodOrder.createdAt).toLocaleString()}</p>
//       <p><span className='detailsTitles'>Status: </span><span className="order-status">{foodOrder.status || 'undefined'}</span></p>
//       {getStatusButtons(foodOrder.status, foodOrder.orderId, foodOrder.selectedVendor)}
//     </div>
//   );

//   const groupedFoodOrders = foodOrders.reduce((acc, foodOrder) => {
//     const key = foodOrder.selectedVendor;
//     if (!acc[key]) {
//       acc[key] = [];
//     }
//     acc[key].push(foodOrder);
//     return acc;
//   }, {});

//   return (
//     <div className="dayOrders">
//       <div id="ordersList">
//         {Object.keys(groupedFoodOrders).map((vendor) => (
//           <div key={vendor} id={`${vendor}-section`}>
//             <h2>{vendor}</h2>
//             <hr className='orderhr' />
//             <ul id={`orders-${vendor}`}>
//               {groupedFoodOrders[vendor].map((foodOrder) => createFoodOrderElement(foodOrder))}
//             </ul>
//           </div>
//         ))}
//       </div>

//       <div id="worthSummary">
//         <p>Expected Sales: <span id="totalSalesExpected" className='downtotals'> Ksh.{expectedSales.toFixed(2)}</span></p>
//         <p>Expected Commission: <span id="commissionExpected" className='downtotals'>Ksh.{expectedCommission.toFixed(2)}</span></p><br />
//       </div>

//       <div id="sales">
//         <div id="salesTotal">
//           <p>Total Sales: Kes. <span id="totalSales">{totalSales.toFixed(2)}</span></p>
//           <p>Commission Due: Kes. <span id="commissionDue">{commissionDue.toFixed(2)}</span></p>
//           <p>Total Deliveries Made: <span id="totalDeliveries">{totalDeliveries}</span></p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UndeliveredFoodOrders;

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

  const updateFoodOrderStatus = async (orderId, vendorId, nextStatus) => {
    try {
      console.log(`Updating order status for orderId: ${orderId}, vendorId: ${vendorId}, to status: ${nextStatus}`);
      await axios.patch(`${config.backendUrl}/api/updateFoodOrderStatus/${orderId}/${vendorId}`, { status: nextStatus });
      fetchFoodOrders();
    } catch (error) {
      console.error('Error updating food order status:', error);
    }
  };

  const getStatusButtons = (status, orderId, vendorId) => {
    const statusSteps = ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'];
    const currentIndex = statusSteps.indexOf(status);
    const nextStatus = statusSteps[currentIndex + 1];

    return nextStatus ? (
      <button className='statusbutn' onClick={() => updateFoodOrderStatus(orderId, vendorId, nextStatus)}>Mark as {nextStatus}</button>
    ) : null;
  };

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
      {getStatusButtons(vendorOrder.status, order.orderId, vendorOrder.vendor)}
    </div>
  );

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
