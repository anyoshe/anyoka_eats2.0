import React, { useState, useContext } from "react";
import styles from './DriverDashboard.module.css';
import { DriverContext } from '../../../contexts/DriverContext';
import DriverProfileDisplay from './DriverProfileDisplay';
import DriverNotification from "./DriverNotification";
import DriverLogout from './DriverLogout';
import DriverOrders from './DriverOrders'; 
import ActiveDriverOrders from './ActiveDriverOrders'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBars, faHome } from "@fortawesome/free-solid-svg-icons";
import CompletedDriverOrders from "./CompletedDriverOrders";
import { useNavigate } from "react-router-dom";


const DriverDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("available"); 
  const [showNotifications, setShowNotifications] = useState(false);
  const { driver, notifications, logoutDriver } = useContext(DriverContext);

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

  const navigate = useNavigate();


  const handleToggleNotifications = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setShowNotifications((prev) => !prev);
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.container}>

        {/* Notification Dropdown */}
        {showNotifications && (
          <DriverNotification
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {/* Hamburger Menu */}
        <div className={styles.hamburgerMenu}>
          <div className={styles.mobileHeaderLeft}>
            <FontAwesomeIcon
              icon={faBell}
              className={`${styles.icon} ${styles.notificationIcon}`}
              data-count={notifications?.length || 0}
              onClick={handleToggleNotifications}
            />
          </div>
          <FontAwesomeIcon
            icon={faBars}
            className={styles.hamburgerIcon}
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <>
          <div className={styles.mobileMenuOverlay} onClick={() => setMenuOpen(false)} />
          <div className={styles.mobileMenu}>
            <div onClick={() => handleTabChange("profile")} className={styles.mobileMenuDiv}>Profile</div>

            <div onClick={() => handleTabChange("available")} className={styles.mobileMenuDiv}>Available Orders</div>

            <div onClick={() => handleTabChange("active")} className={styles.mobileMenuDiv}>Active Orders</div>

            <div onClick={() => handleTabChange("completed")} className={styles.mobileMenuDiv}>Completed Orders</div>
            
            <button
              type="button"
              className={styles.mobileLogout}
              onClick={() => { logoutDriver(); navigate('/'); }}
            >
              Logout
            </button>
          </div>
          </>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={styles.backButton} onClick={() => navigate("/")}>
            <FontAwesomeIcon icon={faHome} />
            <span style={{ marginLeft: '0.4rem' }}>Home</span>
          </button>

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
              onClick={handleToggleNotifications}
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