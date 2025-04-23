import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './UserLogout.css'; // Optional: Add styles for the logout icon

const Logout = () => {
  const { setUser, setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from AuthContext
    setUser(null);
    setIsLoggedIn(false);

    // Remove user data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Redirect to the login or home page
    navigate('/');
  };

  return (
    <div className="logout-icon" onClick={handleLogout} title="Logout">
      <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
    </div>
  );
};

export default Logout;