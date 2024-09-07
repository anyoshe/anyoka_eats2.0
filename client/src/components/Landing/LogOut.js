import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartnerContext } from '../../contexts/PartnerContext';

function Logout() {
    const { setPartner } = useContext(PartnerContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear user data from context
        setPartner(null);
        
        // Optionally clear any stored tokens from localStorage or cookies
        localStorage.removeItem('partnerToken'); // if you're using tokens
        // Redirect to the login page
        navigate('/');
    };

    return {
        handleLogout
    };
}

export default Logout;
