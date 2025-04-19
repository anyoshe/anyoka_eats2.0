import React, { useState, useContext } from "react";
import styles from './AccountPage.module.css';
import { PartnerContext } from '../../contexts/PartnerContext';
import Profile from './Profile';
import ShopSection from "./ShopSection";
import NotificationComponent from './NotificationComponent';
import LogoutComponent from './LogoutComponent';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

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
        return <div>Orders content coming soon...</div>;
      case "sales":
        return <div>Sales content coming soon...</div>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.accountPageWrapper}>
      <div className={styles.container}>
      {/* Notification dropdown */}
      {showNotifications && <NotificationComponent />}

      {/* Tabs */}
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
            data-count={5}
            onClick={() => setShowNotifications(!showNotifications)}
          />
          <LogoutComponent />
        </div>
      </div>

      {/* Content */}
      <div className={`${styles.tabContent} ${styles.active}`}>
        {renderTabContent()}
      </div>
    </div>
    </div>
  );
};

export default AccountPage;
