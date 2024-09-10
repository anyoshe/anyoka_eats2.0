import React, { useState, useRef, useEffect, useContext } from 'react';
import { PartnerContext } from '../../contexts/PartnerContext';
import { useNavigate } from 'react-router-dom';
import './UserProfileDashBoard.css';
import axios from 'axios';
import Profile from './Profile';
import './Profile.css';
import OtherContactsSection from './OtherContactSection';
import OtherServicesSection from './OtherServiceSection';
import HotelRestaurantSection from './HotelRestaurantSection';
import OutsideCatering from '../User/OutsideCatering';
import ConferenceForm from '../User/ConferenceForm';
import config from '../../config';
import FreshFoodsManagement from './FreshFoodsManagement';
import UndeliveredOrders from './UndeliveredOrders';
import DeliveredOrders from './DeliveredOrders';
import UndeliveredFoodOrders from './UndeliveredFoodOrders';
import DeliveredFoodOrders from './DeliveredFoodOrders';
import SpecialOrders from './SpecialOrdersList';
import Logout from '../Landing/LogOut';

// const Orders = () => <div>Orders Content Here</div>;
// const Sales = () => <div>Sales Content Here</div>;
// const Logout = () => <div>Log Out Content Here</div>;

const UserProfileDashBoard = () => {
  const { partner, setPartner } = useContext(PartnerContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [services, setServices] = useState([]); 
  const [orderSubsection, setOrderSubsection] = useState('undeliveredOrders');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
     // Fetch partner data on mount
     fetchPartnerData();

    document.addEventListener('mousedown', handleClickOutside);
    // fetchServices(); // Fetch services on component mount

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (partner?._id) {
      fetchServices(); // Fetch services only if partner ID is available
    }
  }, [partner]);

  const fetchPartnerData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/sign-up-sign-in');
      return;
    }

    try {
      const response = await axios.get(`${config.backendUrl}/api/partner`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const fetchedData = response.data;

      if (JSON.stringify(partner) !== JSON.stringify(fetchedData)) {
        setPartner(fetchedData);
      }
    } catch (error) {
      console.error('Error fetching partner data:', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };


  const fetchServices = async () => {
    if (!partner?._id) return; // Exit if partner ID is not available

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${config.backendUrl}/api/other-services/${partner._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      setServices(data.otherServices?.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]); // Ensure services is empty if there's an error
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setPartner(null);
    navigate('/sign-up-sign-in');
  };

  const toggleDropdown = () => {
    setDropdownOpen(prevState => !prevState);
  };


  const handleSectionChange = (section) => {
    setActiveSection(section);
    setDropdownOpen(false);
  };
  
  const handleOrderSubsectionChange = (subsection) => {
    setOrderSubsection(subsection);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  const onUpdateServices = (updatedServices) => {
    setServices(updatedServices);
  };

  const onSave = async () => {
    try {
      const partnerId = partner._id;
      // Construct and update partner data here
      console.log("Changes saved successfully.");
      fetchServices(); // Re-fetch services after save to update the dropdown
    } catch (error) {
      console.error('Error updating partner:', error);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'restaurant':
        return <HotelRestaurantSection partner={partner} />;
      case 'outsidecatering':
        return <OutsideCatering partnerId={partner?._id} />;
        case 'conferencing&meeting':
          return <ConferenceForm partner={partner} />;
      case 'freshfoods':
        return <FreshFoodsManagement partner={partner} />;
      case 'orders':
        return (
          <div>
            <button onClick={() => handleOrderSubsectionChange('undeliveredOrders')}>Undelivered Orders</button>
            <button onClick={() => handleOrderSubsectionChange('undeliveredFoodOrders')}>Undelivered Food Orders</button>
            <button onClick={() => handleOrderSubsectionChange('specialOrders')}>Special Orders</button>
            <div>
              {orderSubsection === 'undeliveredOrders' && <UndeliveredOrders partner={partner} />}
              {orderSubsection === 'undeliveredFoodOrders' && <UndeliveredFoodOrders partner={partner} />}
              {orderSubsection === 'specialOrders' && <SpecialOrders partner={partner} />}
            </div>
          </div>
        );
      case 'sales':
       
      return (
        <div>
          <div className="button-group">
            <button onClick={() => handleOrderSubsectionChange('deliveredOrders')}>Dish Sales</button>
            <button onClick={() => handleOrderSubsectionChange('deliveredFoodOrders')}>Fresh Food Sales</button>
          </div>
          <div className="content">
            {orderSubsection === 'deliveredOrders' && <DeliveredOrders partner={partner} />}
            {orderSubsection === 'deliveredFoodOrders' && <DeliveredFoodOrders partner={partner} />}
          </div>
        </div>
      );
      case 'logout':
        handleLogout();
        navigate('/');
        return null;
      default:
        
        return (
          <div className='coming_div'>
            <div className='grid_profile_one'>
              <Profile onSave={onSave} partnerId={partner?._id} />
            </div>

            <div className='grid_profile_two'>
              <OtherContactsSection partnerId={partner?._id} />
              <OtherServicesSection
                partnerId={partner?._id}
                onUpdateServices={onUpdateServices} 
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className='profile_wrapper'>
    {/* logo */}
    <div className="profile_profile_bar">
      <div className='profile_bar'>
        <div className="logoDiv">
          <h3 className='welcome-greet'>Welcome ,<span className='partner_welcome'>  {partner?.businessName}</span></h3>
        </div>
      
        {/* <div className="signCta_div"> */}
          <button className="profile_logOut" onClick={() => setActiveSection('logout')}>Log Out</button>
      </div>
    </div>

    <section className="profile_account_section">
      <div className="profile_content">

        <div className="categories_div">
          {dropdownOpen && (
            <div className="service_drop" ref={dropdownRef}>
              {services.length > 0 ? (
                services.map(service => (
                  <a
                    href={`#${service.toLowerCase()}`}
                    key={service}
                    onClick={() => handleSectionChange(service.toLowerCase().replace(/\s+/g, ''))} className='service_drop_link'
                  >
                    {service}
                  </a>
                ))
              ) : (
                <p>Please select services in the "Other Services" section.</p>
              )}
            </div>
          )}

          <button className="profile_category" onClick={() => setActiveSection('profile')}>Profile</button>

          <button className="profile_category service_btn" onClick={toggleDropdown}>
            Services
          </button>

          <button className="profile_category" onClick={() => setActiveSection('orders')}>Orders</button>

          <button className="profile_category" onClick={() => setActiveSection('sales')}>Sales</button>
        </div>

        {/* <div className="proile_dispay_area_div"> */}
          <section className="profile_section">
            {renderSection()}
          </section>
        {/* </div> */}

      </div>
    </section>
    </div>
  );
};

export default UserProfileDashBoard;