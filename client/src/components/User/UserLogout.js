import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './UserLogout.module.css';

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/');
  };


  return (
    <div className={styles.logoutIcon} onClick={handleLogout} title="Logout">
      <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
    </div>
  );
};

export default Logout;
