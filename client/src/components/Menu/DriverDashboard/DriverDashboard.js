// import React, { useState, useContext } from "react";
// import styles from './DriverDashboard.module.css';
// import { DriverContext } from '../../../contexts/DriverContext';
// import DriverProfileDisplay from './DriverProfileDisplay';
// import Orders from '../../User/Orders';
// import DriverNotification from "./DriverNotification";
// import DriverLogout from './DriverLogout';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBell, faBars } from "@fortawesome/free-solid-svg-icons";
// import axios from 'axios';
// import config from '../../../config';

// const DriverDashboard = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [showNotifications, setShowNotifications] = useState(false);
//   const { driver, notifications } = useContext(DriverContext);
//   const [orderDetails, setOrderDetails] = useState(null);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setMenuOpen(false);
//   };

//   const handleViewOrder = async (orderId) => {
//     try {
//       const res = await axios.get(`${config.backendUrl}/api/orders/${orderId}`);
//       setOrderDetails(res.data);
//     } catch (err) {
//       console.error('Failed to fetch order:', err);
//     }
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "profile":
//         return <DriverProfileDisplay />;
//     //   case "vehicle":
//         // return <VehicleSection />;
//       case "orders":
//         return <Orders onViewOrder={handleViewOrder} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className={styles.dashboardWrapper}>
//       <div className={styles.container}>

//         {/* Notification Dropdown */}
//         {showNotifications && (
//           <DriverNotification
//             notifications={notifications}
//             onView={handleViewOrder}
//           />
//         )}

//         {/* Hamburger Menu */}
//         <div className={styles.hamburgerMenu}>
//           <FontAwesomeIcon
//             icon={faBars}
//             className={styles.hamburgerIcon}
//             onClick={() => setMenuOpen(!menuOpen)}
//           />
//         </div>

//         {/* Mobile Menu */}
//         {menuOpen && (
//           <div className={styles.mobileMenu}>
//             <div onClick={() => handleTabChange("profile")}>Profile</div>
//             <div onClick={() => handleTabChange("vehicle")}>Vehicle</div>
//             <div onClick={() => handleTabChange("orders")}>Orders</div>
//           </div>
//         )}

//         {/* Tabs */}
//         <div className={styles.tabs}>
//           <div
//             className={`${styles.tab} ${activeTab === "profile" ? styles.active : ""}`}
//             onClick={() => handleTabChange("profile")}
//           >
//             Profile
//           </div>
//           <div
//             className={`${styles.tab} ${activeTab === "vehicle" ? styles.active : ""}`}
//             onClick={() => handleTabChange("vehicle")}
//           >
//             Vehicle
//           </div>
//           <div
//             className={`${styles.tab} ${activeTab === "orders" ? styles.active : ""}`}
//             onClick={() => handleTabChange("orders")}
//           >
//             Orders
//           </div>

//           <div className={styles.headerNavIcons}>
//             <FontAwesomeIcon
//               icon={faBell}
//               className={`${styles.icon} ${styles.notificationIcon}`}
//               data-count={notifications?.length || 0}
//               onClick={() => setShowNotifications(!showNotifications)}
//             />
//             <DriverLogout />
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className={`${styles.tabContent}`}>
//           {renderTabContent()}
//         </div>

//         {/* Modal for Order Details */}
//         {orderDetails && (
//           <OrderDetailsModal order={orderDetails} onClose={() => setOrderDetails(null)} />
//         )}
//       </div>
//     </div>
//   );
// };

// const OrderDetailsModal = ({ order, onClose }) => {
//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.modalContent}>
//         <h2>Order Details</h2>
//         <p><strong>Order ID:</strong> {order._id}</p>
//         <p><strong>Status:</strong> {order.status}</p>
//         <p><strong>Destination:</strong> {order.delivery?.location}</p>
//         <p><strong>Total:</strong> KES {order.total}</p>
//         <button className={styles.closeBtn} onClick={onClose}>Close</button>
//       </div>
//     </div>
//   );
// };

// export default DriverDashboard;

import React, { useState, useContext } from "react";
import styles from './DriverDashboard.module.css';
import { DriverContext } from '../../../contexts/DriverContext';
import DriverProfileDisplay from './DriverProfileDisplay';
import DriverNotification from "./DriverNotification";
import DriverLogout from './DriverLogout';
import DriverOrders from './DriverOrders'; // Import the DriverOrders component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBars } from "@fortawesome/free-solid-svg-icons";

const DriverDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
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
      case "orders":
        return <DriverOrders />; // Render the DriverOrders component
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
            <div onClick={() => handleTabChange("orders")}>Orders</div>
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
            className={`${styles.tab} ${activeTab === "orders" ? styles.active : ""}`}
            onClick={() => handleTabChange("orders")}
          >
            Orders
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