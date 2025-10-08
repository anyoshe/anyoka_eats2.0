import React, { useState, useContext, useEffect } from "react";
import styles from './AccountPage.module.css';
import { PartnerContext } from '../../contexts/PartnerContext';
import Profile from './Profile';
import ShopSection from "./ShopSection";
import VendorShare from './VendorShare';
import NotificationComponent from './NotificationComponent';
import LogoutComponent from './LogoutComponent';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import Orders from './Orders';
import { faBars } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import config from '../../config';
import Sales from "./Sales";
import { useNavigate } from 'react-router-dom';


const AccountPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile")
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, addNotification, markAsRead, unreadCount, logout } = useContext(PartnerContext);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);



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
      case "share":
        return <VendorShare />;
      default:
        return null;
    }
  };

  const logoutAndClose = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className={styles.accountPageWrapper}>
      <div className={styles.container}>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/', { replace: true })}
          aria-label="Back to landing"
        >
          ← Back
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <NotificationComponent
            onClose={() => setShowNotifications(false)}
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
          <div className={styles.notificationIconWrapper} onClick={() => setShowNotifications(!showNotifications)}>
            <FontAwesomeIcon
              icon={faBell}
              className={`${styles.icon} ${styles.notificationIcon}`}
            />
            {unreadCount > 0 && (
              <div className={styles.notificationBadge}>{unreadCount}</div>
            )}
          </div>
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
            <div className={styles.mobileDivider}></div>
            <div className={styles.mobileDanger} onClick={() => logoutAndClose()}>Logout</div>
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
          <div
            className={`${styles.tab} ${activeTab === "share" ? styles.active : ""}`}
            onClick={() => setActiveTab("share")}
          >
            Share
          </div>

          <div className={styles.headerNavIcons}>
            <div className={`${styles.notificationIconWrapper}`}>
              <FontAwesomeIcon
                icon={faBell}
                className={`${styles.icon} ${styles.notificationIcon} ${styles.profileNotification}`}
                onClick={() => setShowNotifications(!showNotifications)}
              />
              {unreadCount > 0 && (
                <div className={styles.notificationBadge}>{unreadCount}</div>
              )}
            </div>


            {/* Logout Icon */}
            <LogoutComponent />
          </div>
        </div>

        {/* Content */}
        <div className={`${styles.tabContent} ${styles.active}`}>
          {isLoading ? (
            <div className={styles.skeletonWrapper}>
              <div className={styles.skeletonRow}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonCol}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineShort} />
                </div>
              </div>
              <div className={styles.skeletonGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            renderTabContent()
          )}
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
