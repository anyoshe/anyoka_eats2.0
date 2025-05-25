import React, { useState, useContext } from "react";
import styles from './DriverDashboard.module.css';
import { DriverContext } from '../../../contexts/DriverContext';
import DriverProfileDisplay from './DriverProfileDisplay';
import DriverNotification from "./DriverNotification";
import DriverLogout from './DriverLogout';
import DriverOrders from './DriverOrders'; 
import ActiveDriverOrders from './ActiveDriverOrders'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBars } from "@fortawesome/free-solid-svg-icons";
import CompletedDriverOrders from "./CompletedDriverOrders";

const DriverDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("available"); 
  const [showNotifications, setShowNotifications] = useState(false);
  const { driver, notifications } = useContext(DriverContext);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <DriverProfileDisplay />;
      case "available":
        return <DriverOrders />; 
      case "active":
        return <ActiveDriverOrders />; 
        case "completed":
        return <CompletedDriverOrders />; 
      default:
        return null;
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.container}>

        {/* Notification Dropdown */}
        {showNotifications && (
          <DriverNotification
            notifications={notifications}
          />
        )}

        {/* Hamburger Menu */}
        <div className={styles.hamburgerMenu}>
          <FontAwesomeIcon
            icon={faBars}
            className={styles.hamburgerIcon}
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <div onClick={() => handleTabChange("profile")}>Profile</div>
            <div onClick={() => handleTabChange("available")}>Available Orders</div>
            <div onClick={() => handleTabChange("active")}>Active Orders</div>
            <div onClick={() => handleTabChange("completed")}>Completed Orders</div>
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <div
            className={`${styles.tab} ${activeTab === "profile" ? styles.active : ""}`}
            onClick={() => handleTabChange("profile")}
          >
            Profile
          </div>
          <div
            className={`${styles.tab} ${activeTab === "available" ? styles.active : ""}`}
            onClick={() => handleTabChange("available")}
          >
            Available Orders
          </div>
          <div
            className={`${styles.tab} ${activeTab === "active" ? styles.active : ""}`}
            onClick={() => handleTabChange("active")}
          >
            Active Orders
          </div>
          <div
            className={`${styles.tab} ${activeTab === "completed" ? styles.active : ""}`}
            onClick={() => handleTabChange("completed")}
          >
            Completed Orders
          </div>

          <div className={styles.headerNavIcons}>
            <FontAwesomeIcon
              icon={faBell}
              className={`${styles.icon} ${styles.notificationIcon}`}
              data-count={notifications?.length || 0}
              onClick={() => setShowNotifications(!showNotifications)}
            />
            <DriverLogout />
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${styles.tabContent}`}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;