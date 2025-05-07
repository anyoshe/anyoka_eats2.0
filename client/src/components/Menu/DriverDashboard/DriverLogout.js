import React, { useContext } from 'react';
import { DriverContext } from '../../../contexts/DriverContext'; // Updated import for DriverContext
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './DriverLogout.module.css';

const DriverLogout = () => {
  const { logoutDriver } = useContext(DriverContext); // Use logoutDriver from DriverContext
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutDriver();  // Call logoutDriver to clear the driver context and localStorage
    navigate('/');  // Navigate to home or login page after logout
  };

  return (
    <FontAwesomeIcon
      icon={faSignOutAlt}
      className={styles.logoutIcon}
      onClick={handleLogout}
    />
  );
};

export default DriverLogout;
