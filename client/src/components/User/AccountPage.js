import React, { useState, useContext } from "react";
import './AccountPage.css';
import { PartnerContext } from '../../contexts/PartnerContext';
import Profile from './Profile';
import ShopSection from "./ShopSection";
import NotificationComponent from './NotificationComponent';
import LogoutComponent from './LogoutComponent';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showNotifications, setShowNotifications] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "shop":
        return <ShopSection />;
      case "orders":
        // return <Orders />;
      case "sales":
        // return <Sales />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="container">
      
      {/* <div className="header-nav">
        <h1>Account Page</h1>
        <div className="header-nav-icons">
         
          <FontAwesomeIcon
            icon={faBell}
            className="icon notification-icon"
            data-count={5} 
            onClick={() => setShowNotifications(!showNotifications)}
          />
        
          <LogoutComponent />
        </div>
      </div> */}

      {/* Notification Dropdown */}
      {showNotifications && <NotificationComponent />}

      {/* Tab navigation */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </div>
        <div
          className={`tab ${activeTab === "shop" ? "active" : ""}`}
          onClick={() => setActiveTab("shop")}
        >
          Shop
        </div>
        <div
          className={`tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </div>
        <div
          className={`tab ${activeTab === "sales" ? "active" : ""}`}
          onClick={() => setActiveTab("sales")}
        >
          Sales
        </div>

        <div className="header-nav-icons">
          {/* Notification Icon */}
          <FontAwesomeIcon
            icon={faBell}
            className="icon notification-icon profileNotification"
            data-count={5} 
            onClick={() => setShowNotifications(!showNotifications)}
          />

          {/* Logout Icon */}
          <LogoutComponent />

        </div>
        
      </div>

      {/* Dynamic Tab Content */}
      <div className="tab-content active">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AccountPage;