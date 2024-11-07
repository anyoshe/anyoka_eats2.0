import React, { useState, useEffect } from 'react';
import './Profile.css'; 
import config from '../../config';

const OtherServicesSection = ({ partnerId, onUpdateServices }) => {
  const [editMode, setEditMode] = useState(false);
  const [services, setServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([
    'Restaurant',
    'Outside Catering',
    'Special Order',
    'Conferencing & Meeting',
    'Fresh Foods',
  ]);

  // Load persisted edit mode state from localStorage
  useEffect(() => {
    const savedEditMode = localStorage.getItem('editMode');
    if (savedEditMode !== null) {
      setEditMode(JSON.parse(savedEditMode));
    }
  }, []);

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/api/other-services/${partnerId}`);
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

    fetchServices();
  }, [partnerId]);

  // Persist the edit mode state in localStorage
  const toggleEditSection = () => {
    const newEditMode = !editMode;
    setEditMode(newEditMode);
    localStorage.setItem('editMode', JSON.stringify(newEditMode));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setServices([...services, name]);
    } else {
      setServices(services.filter(service => service !== name));
    }
  };

  const saveSection = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/other-services/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ services }),
      });

      if (!response.ok) {
        throw new Error('Failed to save services');
      }

      const data = await response.json();
      setServices(data.otherServices?.services || []);
      setEditMode(false);
      localStorage.setItem('editMode', JSON.stringify(false)); // Save edit mode state

      // Dynamically update the dropdown in the parent component
      if (typeof onUpdateServices === 'function') {
        onUpdateServices(data.otherServices?.services || []);
      } else {
        console.error('onUpdateServices is not a function');
      }
    } catch (error) {
      console.error('Error updating services:', error);
    }
  };

  return (
    <div className="account_details radioDivDiv" id="otherServicesSection">
      <h3 className="other_services_div other_titles">OTHER SERVICES OFFERED</h3>
      <div className="other_services_list">
        {availableServices.map(service => (
          <div className="radio_btn_div" key={service}>
            <input
              type="checkbox"
              name={service}
              id={`${service.replace(/\s+/g, '')}Checkbox`}
              className="other_service_radio"
              disabled={!editMode}
              checked={services.includes(service)}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={`${service.replace(/\s+/g, '')}Checkbox`} className="other_service_labels">
              {service}
            </label>
          </div>
        ))}
      </div>
      <button
        className="editButton radioDivBtn"
        onClick={toggleEditSection}
        style={{ display: editMode ? 'none' : 'inline-block' }}
      >
        Edit
      </button>
      <button
        className="saveButton radioDivBtn"
        style={{ display: editMode ? 'inline-block' : 'none' }}
        onClick={saveSection}
      >
        Save
      </button>
    </div>
  );
};

export default OtherServicesSection;
