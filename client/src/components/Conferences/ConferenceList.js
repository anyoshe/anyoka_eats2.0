import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const ConferenceList = () => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/conferences`);
        setConferences(response.data);
      } catch (err) {
        setError('Failed to fetch conferences');
      } finally {
        setLoading(false);
      }
    };

    fetchConferences();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="conference-list">
      <h1>Conferences</h1>
      {conferences.map(conference => (
        <div key={conference._id} className="conference-card">
          <h2>{conference.venueName}</h2>
          <p><strong>Address:</strong> {conference.address}</p>
          <p><strong>Seating Capacity:</strong> {conference.seatingCapacity}</p>
          <p><strong>Price:</strong> {conference.pricingStructure}</p>
          <p><strong>Contact Person:</strong> {conference.contactPerson}</p>
          <p><strong>Phone Number:</strong> {conference.phoneNumber}</p>
          <p><strong>Email Address:</strong> {conference.emailAddress}</p>
          {/* Add more fields as necessary */}
          <div className="images">
            {conference.venueImagesUrl && conference.venueImagesUrl.map((image, index) => (
              <img key={index} src={`${config.backendUrl}/${image}`} alt="Venue" />
            ))}
          </div>
          <div className="floorplans">
            {conference.floorPlansUrl && conference.floorPlansUrl.map((image, index) => (
              <img key={index} src={`${config.backendUrl}/${image}`} alt="Floor Plan" />
            ))}
          </div>
          <div className="videos">
            {conference.videoToursUrl && conference.videoToursUrl.map((video, index) => (
              <video key={index} controls>
                <source src={`${config.backendUrl}/${video}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConferenceList;
