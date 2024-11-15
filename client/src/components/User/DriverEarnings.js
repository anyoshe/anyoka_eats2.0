import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
// import './DriverEarnings.css';

const DriverEarnings = () => {
  const [driverEarnings, setDriverEarnings] = useState([]);
  const [filteredDriverEarnings, setFilteredDriverEarnings] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [uniqueDates, setUniqueDates] = useState([]);
  const [uniqueDrivers, setUniqueDrivers] = useState([]);

  useEffect(() => {
    fetchDriverEarnings();
  }, []);

  useEffect(() => {
    filterAndDisplayDriverEarnings();
  }, [filterDate, filterDriver, driverEarnings]);

  const fetchDriverEarnings = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/driverEarnings`);
      const earningsData = response.data;
      console.log('Fetched earnings data:', earningsData);
      // Set unique dates and drivers for filtering
      // const dates = [...new Set(earningsData.map(earning => earning.date))];
      // const drivers = [...new Set(earningsData.map(earning => earning.driverDetails.OfficialNames))];
       // Handle cases where driverDetails might be missing or incomplete
    
    // Safely access driverDetails and OfficialNames using optional chaining
    const dates = [...new Set(earningsData.map(earning => earning.date))];
    const drivers = [
      ...new Set(
        earningsData.map(
          earning =>
            earning.driverDetails?.OfficialNames || 'Unknown Driver' // Default value if undefined
        )
      )
    ];

      setUniqueDates(dates);
      setUniqueDrivers(drivers);
      setDriverEarnings(earningsData);
      setFilteredDriverEarnings(earningsData);
    } catch (error) {
      console.error('Error fetching driver earnings:', error);
    }
  };

  const filterAndDisplayDriverEarnings = () => {
    const filtered = driverEarnings.filter(earning => {
      const isDateMatch = !filterDate || earning.date === filterDate;
      const isDriverMatch = !filterDriver || earning.driverDetails.OfficialNames === filterDriver;
      return isDateMatch && isDriverMatch;
    });
    setFilteredDriverEarnings(filtered);
  };

  const handleDateFilterChange = (event) => {
    setFilterDate(event.target.value);
  };

  const handleDriverFilterChange = (event) => {
    setFilterDriver(event.target.value);
  };

  const createEarningsRow = (earning) => (
    <tr key={earning._id}>
      <td>{earning.driverDetails.OfficialNames}</td>
      <td>{earning.date}</td>
      <td>{earning.orders.length}</td>
      <td>Kes. {earning.totalEarnings}.00</td>
    </tr>
  );

  return (
    <div className="driverEarnings">
      <h2>Driver Daily Earnings</h2>

      <div className="filters">
        <select id="dateFilter" value={filterDate} onChange={handleDateFilterChange}>
          <option value="">Select Date</option>
          {uniqueDates.map(date => <option key={date} value={date}>{date}</option>)}
        </select>

        <select id="driverFilter" value={filterDriver} onChange={handleDriverFilterChange}>
          <option value="">Select Driver</option>
          {uniqueDrivers.map(driver => <option key={driver} value={driver}>{driver}</option>)}
        </select>
      </div>

      <div id="earningsList">
        <table>
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Date</th>
              <th>No. of Deliveries</th>
              <th>Total Earnings</th>
            </tr>
          </thead>
          <tbody>
            {filteredDriverEarnings.map(earning => createEarningsRow(earning))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverEarnings;
