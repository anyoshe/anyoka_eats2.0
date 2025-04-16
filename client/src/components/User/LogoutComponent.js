// import React, { useContext } from "react";
// import { PartnerContext } from '../../contexts/PartnerContext';
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

// const LogoutComponent = () => {
//   const { setPartner } = useContext(PartnerContext);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // Clear partner session
//     setPartner(null);
//     localStorage.removeItem('partnerToken'); // Clear token from localStorage
//     navigate('/sign-up-sign-in'); // Redirect to login page
//   };

//   return (
//     <FontAwesomeIcon
//       icon={faSignOutAlt}
//       className="icon logout-icon"
//       onClick={handleLogout}
//     />
//   );
// };

// export default LogoutComponent;

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
    navigate('/sign-up-sign-in');
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
