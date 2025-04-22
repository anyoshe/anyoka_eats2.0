import React, { useState } from 'react';
// import AllUndeliveredOrders from './AllUndeliveredOrders';
import AllDeliveredOrders from './AllDeliveredOrders';
import AllUndeliveredFoodOrders from './AllUndeliveredFoodOrders';
import AllDeliveredFoodOrders from './AllDeliveredFoodOrders';
import DriverEarnings from './DriverEarnings';
// import './userAdmin.module.css';
import styles from './UserPage.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import NotificationComponent from './NotificationComponent';

const UserPage = () => {
  // State to keep track of the active component
  const [activeTab, setActiveTab] = useState('AllUndeliveredOrders');
  const [notifications, setNotifications] = useState([]);


  // Function to render the selected component
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'AllDeliveredOrders':
        return <AllDeliveredOrders />;
      // case 'AllUndeliveredOrders':
      //   return <AllUndeliveredOrders />;
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
    <div className='userCover'>
      <nav className="navs">
        <div className="navs-container">
          {/* <div className="logo">
            <img src="../assets/online Chefs (1).png" width="85" height="55" alt="Logo" />
          </div> */}
          <div className="logo">
           Anyoka Eats
          </div>

          <a href="/" className="homeLink">Home</a>
          <div className='notificationIcon'>
                    <FontAwesomeIcon icon={faBell} />
                    {notifications.length > 0 && <span className='notificationBadge'>{notifications.length}</span>}
                  </div>
          {/* <div className="toggle-button">
            <span></span>
            <span></span>
            <span></span>
          </div>*/}
        </div> 
      </nav>

      {/* Tabbed Buttons */}
      <div className="tab-buttons">
        <button 
          onClick={() => setActiveTab('AllDeliveredOrders')}
          className={activeTab === 'AllDeliveredOrders' ? 'active' : ''}
        >
          Delivered Meals
        </button>

        <button 
          onClick={() => setActiveTab('AllUndeliveredOrders')}
          className={activeTab === 'AllUndeliveredOrders' ? 'active' : ''}
        >
          Undelivered Meals        
        </button>

        <button 
          onClick={() => setActiveTab('AllUndeliveredFoodOrders')}
          className={activeTab === 'AllUndeliveredFoodOrders' ? 'active' : ''}
        >
          Undelivered Groceries
        </button>

        <button 
          onClick={() => setActiveTab('AllDeliveredFoodOrders')}
          className={activeTab === 'AllDeliveredFoodOrders' ? 'active' : ''}
        >
          Delivered Groceries
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
