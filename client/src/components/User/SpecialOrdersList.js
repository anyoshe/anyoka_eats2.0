import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';

const SpecialOrders = ({ partner }) => {
  const [specialOrders, setSpecialOrders] = useState([]);
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
      fetchSpecialOrders();
    }
  }, [partnerRestaurants]);

  const fetchSpecialOrders = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/specialOrders`);
      const allSpecialOrders = response.data;

      const filteredSpecialOrders = allSpecialOrders.filter(order => 
        order.selectedRestaurant === 'Any Restaurant' ||
        partnerRestaurants.some(restaurant => restaurant.restaurant === order.selectedRestaurant)
      );

      setSpecialOrders(filteredSpecialOrders);

    } catch (error) {
      console.error('Error fetching special orders:', error);
    }
  };

  const updateSpecialOrderStatus = async (orderId, nextStatus) => {
    try {
      await axios.patch(`${config.backendUrl}/api/updateSpecialOrderStatus/${orderId}`, { status: nextStatus });
      fetchSpecialOrders();
    } catch (error) {
      console.error('Error updating special order status:', error);
    }
  };

  const getStatusButtons = (status, orderId) => {
    const statusSpecialOrder = ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'];
    const currentIndex = statusSpecialOrder.indexOf(status);
    const nextStatus = statusSpecialOrder[currentIndex + 1];

    return nextStatus ? (
      <button onClick={() => updateSpecialOrderStatus(orderId, nextStatus)}>Mark as {nextStatus}</button>
    ) : null;
  };

  const createSpecialOrderElement = (specialOrder) => (
    <div key={specialOrder._id} className="orderDetails">
      <p>Order ID: {specialOrder._id}</p>
      <p>Customer Name: {specialOrder.customerName}</p>
      <p>Customer Phone: {specialOrder.customerPhone}</p>
      <p>Delivery Location: {specialOrder.deliveryLocation}</p>
      <p>Delivery Date: {new Date(specialOrder.deliveryDate).toLocaleDateString()}</p>
      <p>Delivery Time: {specialOrder.deliveryTime}</p>
      <p>Selected Restaurant: {specialOrder.selectedRestaurant}</p>
      <p>Order Details: {specialOrder.orderDetails}</p>
      <p>Special Instructions: {specialOrder.specialInstructions}</p>
      <p>Created At: {new Date(specialOrder.createdAt).toLocaleString()}</p>
      <p>Status: <span className="order-status">{specialOrder.status}</span></p>
      {getStatusButtons(specialOrder.status, specialOrder._id)}
    </div>
  );

  return (
    <div className="specialOrders">
      <h2>Special Orders</h2>
      <div id="ordersList">
        {specialOrders.length > 0 ? (
          specialOrders.map((specialOrder) => createSpecialOrderElement(specialOrder))
        ) : (
          <p>No special orders available.</p>
        )}
      </div>
    </div>
  );
};

export default SpecialOrders;
