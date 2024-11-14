import React, { useState } from 'react';
import AllUndeliveredOrders from './AllUndeliveredOrders';
import AllDeliveredOrders from './AllDeliveredOrders';
import AllUndeliveredFoodOrders from './AllUndeliveredFoodOrders';
import AllDeliveredFoodOrders from './AllDeliveredFoodOrders';
import DriverEarnings from './DriverEarnings';
import './UserPage.css';

const UserPage = () => {
  // State to keep track of the active component
  const [activeTab, setActiveTab] = useState('AllUndeliveredOrders');

  // Function to render the selected component
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'AllDeliveredOrders':
        return <AllDeliveredOrders />;
      case 'AllUndeliveredOrders':
        return <AllUndeliveredOrders />;
      case 'AllUndeliveredFoodOrders':
        return <AllUndeliveredFoodOrders />;
      case 'AllDeliveredFoodOrders':
        return <AllDeliveredFoodOrders />;
        case 'DriverEarnings':
        return <DriverEarnings />;
      default:
        return null;
    }
  };

  return (
    <div>
      <nav className="navs">
        <div className="navs-container">
          <div className="logo">
            <img src="../assets/online Chefs (1).png" width="85" height="55" alt="Logo" />
          </div>
          <div className="Kitchen">
            <h3>OUR KITCHEN</h3>
          </div>
          <a href="./../customer/index.html">Go Home</a>
          <div className="toggle-button">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Tabbed Buttons */}
      <div className="tab-buttons">
        <button 
          onClick={() => setActiveTab('AllDeliveredOrders')}
          className={activeTab === 'AllDeliveredOrders' ? 'active' : ''}
        >
          All Delivered Orders
        </button>
        <button 
          onClick={() => setActiveTab('AllUndeliveredOrders')}
          className={activeTab === 'AllUndeliveredOrders' ? 'active' : ''}
        >
          All Undelivered Orders
        </button>
        <button 
          onClick={() => setActiveTab('AllUndeliveredFoodOrders')}
          className={activeTab === 'AllUndeliveredFoodOrders' ? 'active' : ''}
        >
          Undelivered Food Orders
        </button>
        <button 
          onClick={() => setActiveTab('AllDeliveredFoodOrders')}
          className={activeTab === 'AllDeliveredFoodOrders' ? 'active' : ''}
        >
          Delivered Food Orders
        </button>
        <button 
          onClick={() => setActiveTab('DriverEarnings')}
          className={activeTab === 'DriverEarnings' ? 'active' : ''}
        >
          Driver Earnings
        </button>
      </div>

      {/* Render Active Component */}
      <div className="tab-content">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default UserPage;
