import React, { useContext } from 'react';
import { PartnerContext } from '../../contexts/PartnerContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const LogoutComponent = () => {
  const { logout } = useContext(PartnerContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <FontAwesomeIcon
      icon={faSignOutAlt}
      className="icon logout-icon"
      onClick={handleLogout}
    />
  );
};

export default LogoutComponent;
