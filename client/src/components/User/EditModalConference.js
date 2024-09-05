import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import config from '../../config';
import axios from 'axios';

const EditModalConference = ({ show, handleClose, conference, handleFileChange, fetchConferences }) => {
  const [formData, setFormData] = useState({
    venueName: '',
    address: '',
    gpsCoordinates: '',
    seatingCapacity: '',
    layoutOptions: '',
    pricingStructure: '',
    contactPerson: '',
    phoneNumber: '',
    emailAddress: ''
  });

  const [files, setFiles] = useState({
    venueImages: [],
    videoTours: [],
    floorPlans: []
  });

  useEffect(() => {
    if (conference) {
      setFormData(prevData => ({
        ...prevData,
        venueName: conference.venueName || '',
        address: conference.address || '',
        gpsCoordinates: conference.gpsCoordinates || '',
        seatingCapacity: conference.seatingCapacity || '',
        layoutOptions: conference.layoutOptions || '',
        pricingStructure: conference.pricingStructure || '',
        contactPerson: conference.contactPerson || '',
        phoneNumber: conference.phoneNumber || '',
        emailAddress: conference.emailAddress || ''
      }));
    }
  }, [conference]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
  
    // Append form data
    for (const key in formData) {
      data.append(key, formData[key]);
    }
  
    // Append files
    for (const key in files) {
      for (let i = 0; i < files[key].length; i++) {
        data.append(key, files[key][i]);
      }
    }
  
    try {
      const response = await axios.put(`${config.backendUrl}/api/conferences/${conference._id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Success:', response.data);
      handleClose();
      // setShowModal(false);
      fetchConferences();
    } catch (error) {
      console.error('Error editing conference:', error);
    }
  };
  

  return (
    <div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Conference</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <form onSubmit={(e) => e.preventDefault()}> */}
          <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <input type="text" name="venueName" placeholder="Venue Name" value={formData.venueName} onChange={handleInputChange} required className='conference-inputs' />

            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required className='conference-inputs' />

            <input type="text" name="gpsCoordinates" placeholder="GPS Coordinates" value={formData.gpsCoordinates} onChange={handleInputChange} className='conference-inputs' />

            <input type="number" name="seatingCapacity" placeholder="Seating Capacity" value={formData.seatingCapacity} onChange={handleInputChange} required className='conference-inputs' />

            <input type="text" name="pricingStructure" placeholder="Pricing Structure" value={formData.pricingStructure} onChange={handleInputChange} required className='conference-inputs' />
               
            <input type="text" name="contactPerson" placeholder="Contact Person" value={formData.contactPerson} onChange={handleInputChange} required className='conference-inputs' />

            <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} required className='conference-inputs' />

            <input type="email" name="emailAddress" placeholder="Email Address" value={formData.emailAddress} onChange={handleInputChange} required className='conference-inputs' />

            {/* Checkbox inputs */}
            {['avEquipment', 'cateringServices', 'wiFiAccess', 'airConditioning', 'parkingFacilities', 'bookingAvailability', 'eventPlanningAssistance', 'decorationServices', 'transportServices','securityServices'].map((service) => (
              <div key={service}>
                <label htmlFor={service}>{service.replace(/([A-Z])/g,'$1').trim()}</label>
                <div>
                  <input type="checkbox" id={`yes-${service}`} name={service} checked={formData[service] === 'yes'} />
                  <label htmlFor={`yes-${service}`}>Yes</label>
                </div>
                <div>
                  <input type="checkbox" id={`no-${service}`} name={service} checked={formData[service] === 'no'} />
                  <label htmlFor={`no-${service}`}>No</label>
                </div>
              </div>
            ))}

            <select name="layoutOptions" value={formData.layoutOptions} onChange={handleInputChange}>
              <option value="">Layout Option</option>
              <option value="theatre">Theatre</option>
              <option value="classroom">Classroom</option>
              <option value="boardroom">Boardroom</option>
              <option value="roundtable">Round Table</option>
            </select>

            <select name="paymentOptions" value={formData.paymentOptions} onChange={handleInputChange} required>
              <option value="">Payment Option</option>
              <option value="creditCard">Credit Card</option>
              <option value="debitCard">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bankTransfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>

            <input type="file" name="venueImages" multiple onChange={handleFileChange} />
            <input type="file" name="videoTours" multiple onChange={handleFileChange} />
            <input type="file" name="floorPlans" multiple onChange={handleFileChange} />

            <Button type="submit" className='conference_submit_btn'>Save Changes</Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditModalConference;
