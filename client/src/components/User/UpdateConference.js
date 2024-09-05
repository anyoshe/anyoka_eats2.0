import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const UpdateConference = ({ venueName }) => {
  const [conference, setConference] = useState({
    venueName: '',
    address: '',
    gpsCoordinates: '',
    seatingCapacity: '',
    layoutOptions: '',
    roomDimensions: '',
    avEquipment: '',
    cateringServices: '',
    wiFiAccess: '',
    airConditioning: '',
    parkingFacilities: '',
    accessibility: '',
    pricingStructure: '',
    bookingAvailability: '',
    paymentOptions: '',
    contactPerson: '',
    phoneNumber: '',
    emailAddress: '',
    venueImages: null,
    videoTours: null,
    floorPlans: null,
    eventPlanningAssistance: '',
    decorationServices: '',
    transportServices: '',
    securityServices: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConference = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/conference?venueName=${encodeURIComponent(venueName)}`);
        setConference(response.data);
      } catch (err) {
        setError('Failed to fetch conference');
      } finally {
        setLoading(false);
      }
    };

    fetchConference();
  }, [venueName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConference((prevConference) => ({ ...prevConference, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setConference((prevConference) => ({ ...prevConference, [name]: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in conference) {
      if (conference[key] instanceof FileList) {
        Array.from(conference[key]).forEach(file => formData.append(key, file));
      } else {
        formData.append(key, conference[key]);
      }
    }

    try {
      await axios.put(`${config.backendUrl}/api/venue/${encodeURIComponent(venueName)}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Conference updated successfully');
    } catch (err) {
      setError('Failed to update conference');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!conference) return null;

  return (
    <div className="update-conference">
      <h1>Update Conference</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Venue Name:</label>
          <input type="text" name="venueName" value={conference.venueName} onChange={handleChange} />
        </div>
        <div>
          <label>Address:</label>
          <input type="text" name="address" value={conference.address} onChange={handleChange} />
        </div>
        <div>
          <label>GPS Coordinates:</label>
          <input type="text" name="gpsCoordinates" value={conference.gpsCoordinates} onChange={handleChange} />
        </div>
        <div>
          <label>Seating Capacity:</label>
          <input type="number" name="seatingCapacity" value={conference.seatingCapacity} onChange={handleChange} />
        </div>
        <div>
          <label>Layout Options:</label>
          <input type="text" name="layoutOptions" value={conference.layoutOptions} onChange={handleChange} />
        </div>
        <div>
          <label>Room Dimensions:</label>
          <input type="text" name="roomDimensions" value={conference.roomDimensions} onChange={handleChange} />
        </div>
        <div>
          <label>AV Equipment:</label>
          <input type="text" name="avEquipment" value={conference.avEquipment} onChange={handleChange} />
        </div>
        <div>
          <label>Catering Services:</label>
          <input type="text" name="cateringServices" value={conference.cateringServices} onChange={handleChange} />
        </div>
        <div>
          <label>WiFi Access:</label>
          <input type="text" name="wiFiAccess" value={conference.wiFiAccess} onChange={handleChange} />
        </div>
        <div>
          <label>Air Conditioning:</label>
          <input type="text" name="airConditioning" value={conference.airConditioning} onChange={handleChange} />
        </div>
        <div>
          <label>Parking Facilities:</label>
          <input type="text" name="parkingFacilities" value={conference.parkingFacilities} onChange={handleChange} />
        </div>
        <div>
          <label>Accessibility:</label>
          <input type="text" name="accessibility" value={conference.accessibility} onChange={handleChange} />
        </div>
        <div>
          <label>Pricing Structure:</label>
          <input type="text" name="pricingStructure" value={conference.pricingStructure} onChange={handleChange} />
        </div>
        <div>
          <label>Booking Availability:</label>
          <input type="text" name="bookingAvailability" value={conference.bookingAvailability} onChange={handleChange} />
        </div>
        <div>
          <label>Payment Options:</label>
          <input type="text" name="paymentOptions" value={conference.paymentOptions} onChange={handleChange} />
        </div>
        <div>
          <label>Contact Person:</label>
          <input type="text" name="contactPerson" value={conference.contactPerson} onChange={handleChange} />
        </div>
        <div>
          <label>Phone Number:</label>
          <input type="text" name="phoneNumber" value={conference.phoneNumber} onChange={handleChange} />
        </div>
        <div>
          <label>Email Address:</label>
          <input type="email" name="emailAddress" value={conference.emailAddress} onChange={handleChange} />
        </div>
        <div>
          <label>Venue Images:</label>
          <input type="file" name="venueImages" multiple onChange={handleFileChange} />
        </div>
        <div>
          <label>Video Tours:</label>
          <input type="file" name="videoTours" multiple onChange={handleFileChange} />
        </div>
        <div>
          <label>Floor Plans:</label>
          <input type="file" name="floorPlans" multiple onChange={handleFileChange} />
        </div>
        <div>
          <label>Event Planning Assistance:</label>
          <input type="text" name="eventPlanningAssistance" value={conference.eventPlanningAssistance} onChange={handleChange} />
        </div>
        <div>
          <label>Decoration Services:</label>
          <input type="text" name="decorationServices" value={conference.decorationServices} onChange={handleChange} />
        </div>
        <div>
          <label>Transport Services:</label>
          <input type="text" name="transportServices" value={conference.transportServices} onChange={handleChange} />
        </div>
        <div>
          <label>Security Services:</label>
          <input type="text" name="securityServices" value={conference.securityServices} onChange={handleChange} />
        </div>
        <button type="submit">Update Conference</button>
      </form>
    </div>
  );
};

export default UpdateConference;
