import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import "./UserPage.css";

const DeliveredFoodOrders = ({ partner }) => {
  const [foodOrders, setFoodOrders] = useState([]);
  const [filteredFoodOrders, setFilteredFoodOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [commissionDue, setCommissionDue] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [filterDate, setFilterDate] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
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
      fetchDeliveredFoodOrders();
    }
  }, [partnerVendors]);

  useEffect(() => {
    filterAndDisplayFoodOrders();
  }, [filterDate, filterVendor, foodOrders]);
  
  const fetchDeliveredFoodOrders = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/foodOrders`);
      const deliveredFoodOrders = response.data.filter(foodOrder => foodOrder.status === 'Delivered');
      
      const partnerFoodOrders = deliveredFoodOrders.filter(foodOrder => 
        partnerVendors.some(vendor => vendor.vendor === foodOrder.selectedVendor)
      );
  
      setFoodOrders(partnerFoodOrders);
      setFilteredFoodOrders(partnerFoodOrders); // Set filtered orders initially
      calculateTotals(partnerFoodOrders);
    } catch (error) {
      console.error('Error fetching foodOrders:', error);
    }
  };

  const calculateTotals = (foodOrders) => {
    const totalSales = foodOrders.reduce((acc, foodOrder) => acc + foodOrder.totalPrice, 0);
    const commissionDue = totalSales * 0.1;
    const totalDeliveries = foodOrders.length;

    setTotalSales(totalSales);
    setCommissionDue(commissionDue);
    setTotalDeliveries(totalDeliveries);
  };

  const filterAndDisplayFoodOrders = () => {
    const filteredFoodOrders = foodOrders.filter(foodOrder => {
      const orderDate = foodOrder.createdAt.split('T')[0];
      return (!filterDate || orderDate === filterDate) &&
            (!filterVendor || foodOrder.selectedVendor === filterVendor);
    });
    setFilteredFoodOrders(filteredFoodOrders);
    calculateTotals(filteredFoodOrders);
  };

  const handleDateFilterChange = (event) => {
    setFilterDate(event.target.value);
  };

  const handleVendorFilterChange = (event) => {
    setFilterVendor(event.target.value);
  };

  const createSalesElement = (foodOrder) => (
    <tr key={foodOrder.orderId} id={`sale-${foodOrder.orderId}`} className="salesDetails">
      <td>{foodOrder.orderId}</td>
      <td>{foodOrder.foodCode}</td>
      <td>{foodOrder.createdAt.split('T')[0]}</td>
      <td>{foodOrder.selectedRestaurant}</td>
      {/* <td>{foodOrder.customerName}</td> */}
      {/* <td>{foodOrder.phoneNumber}</td> */}
      <td>Kes.{foodOrder.totalPrice}.00</td>
    </tr>
  );

  const uniqueDates = [...new Set(foodOrders.map(foodOrder => foodOrder.createdAt.split('T')[0]))];
  const uniqueVendors = [...new Set(foodOrders.map(foodOrder => foodOrder.selectedVendor))];

  return (
    <div className="salesOrders">
      <button id="fetchSalesButton" onClick={fetchDeliveredFoodOrders}>Fresh Food Sales</button>
      <div id="salesList">
        <table>
          <thead>
            <tr>
              <th>Sales Number</th>
              <th>Food Code</th>
              <th>
                Date
                <select id="dateFilter" value={filterDate} onChange={handleDateFilterChange}>
                  <option value="">All Dates</option>
                  {uniqueDates.map(date => <option key={date} value={date}>{date}</option>)}
                </select>
              </th>
              <th>
                Vendor
                <select id="restaurantFilter" value={filterVendor} onChange={handleVendorFilterChange}>
                  <option value="">All Vendors</option>
                  {uniqueVendors.map(vendor => <option key={vendor} value={vendor}>{vendor}</option>)}
                </select>
              </th>
              {/* <th>Customer Name</th>
              <th>Phone Number</th> */}
              <th>Sales Amount</th>
            </tr>
          </thead>
          <tbody id="salesBody">
            {filteredFoodOrders.map(foodOrder => createSalesElement(foodOrder))}
          </tbody>
        </table>
      </div>

      {/* <div id="salesTotal">
        <p>Total Sales: Kes. <span id="totalSales">{totalSales.toFixed(2)}</span></p>
        <p>Commission Due: Kes. <span id="commissionDue">{commissionDue.toFixed(2)}</span></p>
        <p>Total Deliveries Made: <span id="totalDeliveries">{totalDeliveries}</span></p>
      </div> */}

      <div id="salesTotals">
        <div id="salesTotal">
          <p>Total Sales : <span id="totalSales"  className="sameTotal">{totalSales.toFixed(2)}</span> <i class="fas fa-list-alt"></i>
          </p>

          <p>Commission : <span id="commissionDue"  className="sameTotal">{commissionDue.toFixed(2)}</span> <i class="fas fa-dollar-sign"></i>
          </p>

          <p>Total Deliveries : <span id="totalDeliveries"  className="sameTotal">{totalDeliveries}</ span><i class="fas fa-truck"></i>
          </p>
          
        </div>
      </div>

    </div>
  );
};

export default DeliveredFoodOrders;

