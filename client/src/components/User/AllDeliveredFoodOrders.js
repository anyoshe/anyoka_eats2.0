import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import "./UserPage.css";

const AllDeliveredFoodOrders = () => {
  const [foodOrders, setFoodOrders] = useState([]);
  const [filteredFoodOrders, setFilteredFoodOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [commissionDue, setCommissionDue] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [filterDate, setFilterDate] = useState('');
  const [filterVendor, setFilterVendor] = useState('');

  useEffect(() => {
    fetchDeliveredFoodOrders();
  }, []);

  useEffect(() => {
    filterAndDisplayFoodOrders();
  }, [filterDate, filterVendor, foodOrders]);

  const fetchDeliveredFoodOrders = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/foodOrders`);
      const deliveredFoodOrders = response.data.filter(foodOrder => foodOrder.overallStatus === 'Delivered');
      setFoodOrders(deliveredFoodOrders);
      setFilteredFoodOrders(deliveredFoodOrders);
      calculateTotals(deliveredFoodOrders);
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
            (!filterVendor || foodOrder.vendorOrders.some(vendorOrder => vendorOrder.vendor === filterVendor));
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
    foodOrder.vendorOrders.map(vendorOrder => (
      <tr key={`${foodOrder.orderId}-${vendorOrder._id}`} className="salesDetails">
        <td>{foodOrder.orderId}</td>
        <td>{vendorOrder.foods.map(food => food.foodCode).join(", ")}</td>
        <td>{foodOrder.createdAt.split('T')[0]}</td>
        <td>{vendorOrder.vendor}</td>
        <td>Kes.{vendorOrder.totalPrice}.00</td>
        <td>{vendorOrder.driverDetails ? vendorOrder.driverDetails.name : 'N/A'}</td>
        <td>{vendorOrder.driverDetails ? vendorOrder.driverDetails.contactNumber : 'N/A'}</td>
      </tr>
    ))
  );

  const uniqueDates = [...new Set(foodOrders.map(foodOrder => foodOrder.createdAt.split('T')[0]))];
  const uniqueVendors = [...new Set(foodOrders.flatMap(foodOrder => foodOrder.vendorOrders.map(vendorOrder => vendorOrder.vendor)))];

  return (
    <div className="salesOrders">
      <button id="fetchSalesButton" onClick={fetchDeliveredFoodOrders}>Fetch Delivered Orders</button>
      <div id="salesList">
        <table>
          <thead>
            <tr>
              <th>Sales Number</th>
              <th>Food Codes</th>
              <th>
                Date
                <select id="dateFilter" value={filterDate} onChange={handleDateFilterChange}>
                  <option value="">All Dates</option>
                  {uniqueDates.map(date => <option key={date} value={date}>{date}</option>)}
                </select>
              </th>
              <th>
                Vendor
                <select id="vendorFilter" value={filterVendor} onChange={handleVendorFilterChange}>
                  <option value="">All Vendors</option>
                  {uniqueVendors.map(vendor => <option key={vendor} value={vendor}>{vendor}</option>)}
                </select>
              </th>
              <th>Sales Amount</th>
              <th>Driver Name</th>
              <th>Driver Contact</th>
            </tr>
          </thead>
          <tbody id="salesBody">
            {filteredFoodOrders.flatMap(foodOrder => createSalesElement(foodOrder))}
          </tbody>
        </table>
      </div>

      <div id="salesTotals">
        <div id="salesTotal">
          <p>Total Sales: <span id="totalSales" className="sameTotal">{totalSales.toFixed(2)}</span></p>
          <p>Commission Due: <span id="commissionDue" className="sameTotal">{commissionDue.toFixed(2)}</span></p>
          <p>Total Deliveries: <span id="totalDeliveries" className="sameTotal">{totalDeliveries}</span></p>
        </div>
      </div>
    </div>
  );
};

export default AllDeliveredFoodOrders;
