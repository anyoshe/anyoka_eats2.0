import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext';
import './Sales.css'; // Optional: style file

const Sales = () => {
  const { partner } = useContext(PartnerContext);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!partner?._id) return;

    const fetchSales = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}/orders`);
        // Filter orders with parentOrder status === 'Confirmed Delivered'
        const completed = response.data.filter(
          (order) => order.parentOrder?.status === 'Confirmed Delivered'
        );
        setSales(completed);
        setFilteredSales(completed); // Initially, show all sales
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [partner]);

  const handleDateFilter = (event) => {
    const date = event.target.value;
    setSelectedDate(date);

    if (date) {
      const filtered = sales.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === date;
      });
      setFilteredSales(filtered);
    } else {
      setFilteredSales(sales); // Reset to all sales if no date is selected
    }
  };

  const calculateTotalSales = () => {
    return filteredSales.reduce((total, order) => total + order.total, 0);
  };

  const exportCSV = () => {
    if (filteredSales.length === 0) return;

    const csvData = filteredSales.map((order) => ({
      orderId: order.parentOrder?.orderId || '',
      customer: order.parentOrder?.user?.names || 'N/A',
      total: order.total || 0,
      driver: order.deliveredBy || 'N/A',
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading sales data...</p>;

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h2>Completed Sales</h2>
        <div className="sales-filters">
          <label htmlFor="dateFilter">Filter by Date:</label>
          <input
            type="date"
            id="dateFilter"
            value={selectedDate}
            onChange={handleDateFilter}
          />
          <button onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <p>No completed sales found for the selected date.</p>
      ) : (
        <>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total (KES)</th>
                <th>Delivered By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((order) => (
                <tr key={order._id}>
                  <td>{order.parentOrder?.orderId || 'N/A'}</td>
                  <td>{order.parentOrder?.user?.names || 'N/A'}</td>
                  <td>{order.total}</td>
                  <td>{order.parentOrder?.deliveredBy || 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => {
                        // Logic to view the whole suborder
                        alert(`Viewing suborder: ${order._id}`);
                      }}
                    >
                      View Suborder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sales-total">
            <h3>Total Sales: KES {calculateTotalSales()}</h3>
          </div>
        </>
      )}
    </div>
  );
};

export default Sales;