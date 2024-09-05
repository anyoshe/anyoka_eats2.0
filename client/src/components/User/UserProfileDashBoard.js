import React, { useState, useRef, useEffect, useContext } from 'react';
import { PartnerContext } from '../../contexts/PartnerContext';
import './UserProfileDashBoard.css';
import Profile from './Profile';
import './Profile.css';
import OtherContactsSection from './OtherContactSection';
import OtherServicesSection from './OtherServiceSection';
import HotelRestaurantSection from './HotelRestaurantSection';
import OutsideCatering from '../User/OutsideCatering';
import ConferenceForm from '../User/ConferenceForm';
// import AddFood from "../FreshFood/AddFood";
import config from '../../config';
import FreshFoodsManagement from './FreshFoodsManagement';
import UndeliveredOrders from './UndeliveredOrders';
import DeliveredOrders from './DeliveredOrders';
import UndeliveredFoodOrders from './UndeliveredFoodOrders';
import DeliveredFoodOrders from './DeliveredFoodOrders';

const Orders = () => <div>Orders Content Here</div>;
const Sales = () => <div>Sales Content Here</div>;
const Logout = () => <div>Log Out Content Here</div>;

const UserProfileDashBoard = () => {
  const { partner } = useContext(PartnerContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [services, setServices] = useState([]); 
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    fetchServices(); // Fetch services on component mount

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/other-services/${partner?._id}`);
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

  const toggleDropdown = () => {
    setDropdownOpen(prevState => !prevState);
  };


  const handleSectionChange = (section) => {
    setActiveSection(section);
    setDropdownOpen(false);
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
          <>
            <UndeliveredOrders partner={partner} />
            <UndeliveredFoodOrders partner={partner} />
          </>
        );
      case 'sales':
        return (
          <>
            <DeliveredOrders partner={partner} />
            <DeliveredFoodOrders partner={partner} />
          </>
        );
      case 'logout':
        return <Logout />;
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