import React, { useState, useContext } from "react";
import styles from './AccountPage.module.css';
import { PartnerContext } from '../../contexts/PartnerContext';
import Profile from './Profile';
import ShopSection from "./ShopSection";
import NotificationComponent from './NotificationComponent';
import LogoutComponent from './LogoutComponent';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import Orders from './Orders';
import { faBars } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import config from '../../config';
import Sales from "./Sales";


const AccountPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, addNotification, markAsRead } = useContext(PartnerContext);
  const [orderDetails, setOrderDetails] = useState(null);



  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };


  const handleViewOrder = async (orderId) => {
    try {
      const res = await axios.get(`${config.backendUrl}/api/orders/${orderId}`);
      setOrderDetails(res.data);
      // Optionally show in a modal or route to detail page
    } catch (err) {
      console.error('Failed to fetch order:', err);
    }
  };

  const handleViewSubOrder = async (subOrderId) => {
    try {
      const res = await axios.get(`${config.backendUrl}/api/suborders/${subOrderId}`);
      setOrderDetails({
        ...res.data,
        isSubOrder: true,
      });
    } catch (err) {
      console.error('Failed to fetch suborder:', err);
    }
  };
  

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "shop":
        return <ShopSection />;
      case "orders":
        return <Orders />;
      case "sales":
        return <Sales />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.accountPageWrapper}>
      <div className={styles.container}>

        {/* Notification Dropdown */}
        {showNotifications && (
          <NotificationComponent
          onView={(id, isSubOrder) => {
            if (isSubOrder) {
              handleViewSubOrder(id);
            } else {
              handleViewOrder(id);
            }
          }}
        />
              

        )}

        {/* Hamburger icon for small screens */}
        <div className={styles.hamburgerMenu}>
          <FontAwesomeIcon
            icon={faBars}
            className={styles.hamburgerIcon}
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </div>

        {/* Slide-out menu shown conditionally */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileTab} onClick={() => handleTabChange("profile")}>Profile</div>
            <div className={styles.mobileTab} onClick={() => handleTabChange("orders")}>Orders</div>
            <div className={styles.mobileTab} onClick={() => handleTabChange("sales")}>Sales</div>
            <div className={styles.mobileTab} onClick={() => handleTabChange("shop")}>Shop</div>
          </div>
        )}


        {/* Tab navigation */}
        <div className={styles.tabs}>
          <div
            className={`${styles.tab} ${activeTab === "profile" ? styles.active : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </div>
          <div
            className={`${styles.tab} ${activeTab === "shop" ? styles.active : ""}`}
            onClick={() => setActiveTab("shop")}
          >
            Shop
          </div>
          <div
            className={`${styles.tab} ${activeTab === "orders" ? styles.active : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </div>
          <div
            className={`${styles.tab} ${activeTab === "sales" ? styles.active : ""}`}
            onClick={() => setActiveTab("sales")}
          >
            Sales
          </div>

          <div className={styles.headerNavIcons}>

            <FontAwesomeIcon
              icon={faBell}
              className={`${styles.icon} ${styles.notificationIcon} ${styles.profileNotification}`}
              data-count={notifications.length}
              onClick={() => setShowNotifications(!showNotifications)}
            />

            {/* Logout Icon */}
            <LogoutComponent />
          </div>
        </div>

        {/* Content */}
        <div className={`${styles.tabContent} ${styles.active}`}>
          {renderTabContent()}
        </div>
        {orderDetails && (
          <OrderDetailsModal
            order={orderDetails}
            onClose={() => setOrderDetails(null)}
          />
        )}
      </div>
    </div>
  );
};


const OrderDetailsModal = ({ order, onClose }) => {
  const isSubOrder = order.isSubOrder;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{isSubOrder ? 'SubOrder Summary' : 'Order Details'}</h2>
        
        {isSubOrder ? (
          <>
            <p><strong>SubOrder ID:</strong> {order._id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> KES {order.total}</p>
            <h4>Items</h4>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.product.name} - {item.quantity} x KES {item.price}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p><strong>Order ID:</strong> {order.orderId}</p>
            <p><strong>Delivery:</strong> {order.delivery.town}, {order.delivery.location}</p>
            <p><strong>Total:</strong> KES {order.total}</p>
            <h4>Items</h4>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.product.name} - {item.quantity} x KES {item.price}
                </li>
              ))}
            </ul>
          </>
        )}
        
        <button className={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};


export default AccountPage;
