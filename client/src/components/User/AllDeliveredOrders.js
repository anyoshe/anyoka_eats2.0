import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import "./UserPage.module.css";

const AllDeliveredOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [commissionDue, setCommissionDue] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [filterDate, setFilterDate] = useState('');
  const [filterRestaurant, setFilterRestaurant] = useState('');

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  useEffect(() => {
    filterAndDisplayOrders();
  }, [filterDate, filterRestaurant, orders]);

  const fetchDeliveredOrders = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/orders`);
      const deliveredOrders = response.data.filter(order => order.status === 'Delivered');
      setOrders(deliveredOrders);
      setFilteredOrders(deliveredOrders); // Set filtered orders initially
      calculateTotals(deliveredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const calculateTotals = (orders) => {
    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const commissionDue = totalSales * 0.1;
    const totalDeliveries = orders.length;

    setTotalSales(totalSales);
    setCommissionDue(commissionDue);
    setTotalDeliveries(totalDeliveries);
  };

  const filterAndDisplayOrders = () => {
    const filteredOrders = orders.filter(order => {
      const orderDate = order.createdAt.split('T')[0];
      return (!filterDate || orderDate === filterDate) &&
            (!filterRestaurant || order.selectedRestaurant === filterRestaurant);
    });
    setFilteredOrders(filteredOrders);
    calculateTotals(filteredOrders);
  };

  const handleDateFilterChange = (event) => {
    setFilterDate(event.target.value);
  };

  const handleRestaurantFilterChange = (event) => {
    setFilterRestaurant(event.target.value);
  };

  const createSalesElement = (order) => (
    <tr key={order.orderId} id={`sale-${order.orderId}`} className="salesDetails">
      <td>{order.orderId}</td>
      <td>{order.dishes.map(dish => dish.dishCode).join(", ")}</td>
      <td>{order.createdAt.split('T')[0]}</td>
      <td>{order.selectedRestaurant}</td>
      <td>Kes.{order.totalPrice}.00</td>
      <td>{order.driverDetails ? order.driverDetails.name : 'N/A'}</td>
      <td>{order.driverDetails ? order.driverDetails.contactNumber : 'N/A'}</td>
    </tr>
  );

  const uniqueDates = [...new Set(orders.map(order => order.createdAt.split('T')[0]))];
  const uniqueRestaurants = [...new Set(orders.map(order => order.selectedRestaurant))];

  return (
    <div className="salesOrders">
      <button id="fetchSalesButton" onClick={fetchDeliveredOrders}>All Delivered Orders</button>
      <div id="salesList">
        <table>
          <thead>
            <tr>
              <th>Sales Number</th>
              <th>Dish Code</th>
              <th>
                Date
                <select id="dateFilter" value={filterDate} onChange={handleDateFilterChange}>
                  <option value="">All Dates</option>
                  {uniqueDates.map(date => <option key={date} value={date}>{date}</option>)}
                </select>
              </th>
              <th>
                Restaurant
                <select id="restaurantFilter" value={filterRestaurant} onChange={handleRestaurantFilterChange}>
                  <option value="">All Restaurants</option>
                  {uniqueRestaurants.map(restaurant => <option key={restaurant} value={restaurant}>{restaurant}</option>)}
                </select>
              </th>
              <th>Sales Amount</th>
              <th>Driver Name</th>
              <th>Driver Contact</th>
            </tr>
          </thead>
          <tbody id="salesBody">
            {filteredOrders.map(order => createSalesElement(order))}
          </tbody>
        </table>
      </div>

      <div id="salesTotals">
        <div id="salesTotal">
          <p>Total Sales: Kes. <span id="totalSales" className="sameTotal">{totalSales.toFixed(2)}</span></p>
          <p>Commission: Kes. <span id="commissionDue" className="sameTotal">{commissionDue.toFixed(2)}</span></p>
          <p>Total Deliveries: <span id="totalDeliveries" className="sameTotal">{totalDeliveries}</span></p>
        </div>
      </div>
    </div>
  );
};

export default AllDeliveredOrders;
