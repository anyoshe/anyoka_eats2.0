import React, { useState, useContext, useEffect } from "react";
import styles from './CustomerDashboard.module.css';
import { AuthContext } from '../../contexts/AuthContext';
import CustomerProfileDisplay from './CustomerProfileDisplay';
import AuthPromptModal from '../../components/User/AuthPromptModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CustomerOrders from './CustomerOrders';


const CustomerDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { user, logout, setRedirectPath } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !showAuthPrompt) {
      setRedirectPath(location.pathname);
      setShowAuthPrompt(true);
    }
  }, [user, showAuthPrompt, location, setRedirectPath]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <CustomerProfileDisplay />;
      case "orders":
        return <CustomerOrders />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={styles.dashboardWrapper}>
        <div className={styles.container}>

          {/* Hamburger */}
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
              <div className={styles.mobileTab} onClick={() => handleTabChange("profile")}>
                Profile
              </div>
              <div className={styles.mobileTab} onClick={() => handleTabChange("orders")}>
                My Orders
              </div>
              <div className={styles.mobileTab} onClick={handleLogout}>
                Logout
              </div>
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
              My Orders
            </div>
            <div
              className={`${styles.tab}`}
              onClick={handleLogout}
              title="Logout"
            >
              <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '0.4rem' }} />
              Logout
            </div>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Auth Prompt */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onRequestClose={() => setShowAuthPrompt(false)}
      />
    </>
  );
};

export default CustomerDashboard;
