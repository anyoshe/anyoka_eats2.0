import React, { useContext, useState, useEffect } from 'react';
import styles from './CustomerProfileDisplay.module.css';
import axios from 'axios';
import config from '../../config';
import { GoogleMap, Marker } from '@react-google-maps/api';
import MapSelector from '../../components/User/MapSelector';
import { AuthContext } from '../../contexts/AuthContext';

const CustomerProfileDisplay = () => {
  const { user, setUser, fetchUserProfile, loading } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [showMapPopup, setShowMapPopup] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      fetchUserProfile();
    }
  }, [user, loading, fetchUserProfile]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        names: user.names || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        town: user.town || '',
        location: user.location || '',
        savedLocations: user.savedLocations || [],
      });
    }
  }, [user]);

  const handleEditClick = () => setEditing(true);

  const handleCancelClick = () => {
    setEditing(false);
    setShowMapPopup(false);
    if (user) {
      setFormData({
        username: user.username,
        names: user.names,
        email: user.email,
        phoneNumber: user.phoneNumber,
        town: user.town,
        location: user.location,
        savedLocations: user.savedLocations
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTownChange = async (e) => {
    const town = e.target.value;
    setFormData(prev => ({ ...prev, town }));


    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(town)}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`);
      const data = await response.json();
      if (data.status === 'OK' && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setMapCenter({ lat, lng });
      }
    } catch (err) {
    }
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setFormData(prev => ({ ...prev, location: results[0].formatted_address }));
        // Close the popup after selecting location
        setShowMapPopup(false);
      } else {
        alert('Geocoder failed: ' + status);
      }
    });
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      town: location.town,
      location: location.exactLocation
    }));
    setShowMapSelector(false);
  };


  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No auth token');

      const payload = { ...formData };

      const res = await axios.put(`${config.backendUrl}/api/user/update-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ update context and localStorage immediately
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setEditing(false);
    } catch (err) {
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No profile found</p>;

  return (
    <div className={styles.profile_wrapper}>
      {showMapSelector && (
        <MapSelector
          onSelect={handleLocationSelect}
          onCancel={() => setShowMapSelector(false)}
        />
      )}

      <div className={styles.profileContent}>
        {/* Optional: Profile image container placeholder */}
        <div className={styles.profileImageContainer}>
          {/* Placeholder image or logic if applicable */}
        </div>

        <div className={styles.profileDetails}>
          <div className={styles.profileItem}>
            <strong>Username</strong>
            {editing ? (
              <input name="username" value={formData.username} onChange={handleInputChange} />
            ) : (
              <span>{formData.username}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Names</strong>
            {editing ? (
              <input name="names" value={formData.names} onChange={handleInputChange} />
            ) : (
              <span>{formData.names}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Email</strong>
            {editing ? (
              <input name="email" value={formData.email} onChange={handleInputChange} />
            ) : (
              <span>{formData.email}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Phone Number</strong>
            {editing ? (
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
            ) : (
              <span>{formData.phoneNumber}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Town</strong>
            {editing ? (
              <input name="town" value={formData.town} onChange={handleTownChange} />
            ) : (
              <span>{formData.town}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Location</strong>
            {editing ? (
              <input
                name="location"
                value={formData.location}
                readOnly
                onClick={() => {
                  // Show map popup and set center
                  setShowMapPopup(true);
                  if (formData.town) {
                    // Use existing town to center the map
                    handleTownChange({ target: { value: formData.town } });
                  } else {
                    // Default center if no town
                    setMapCenter({ lat: 0, lng: 0 });
                  }
                }}
              />
            ) : (
              <span>{formData.location}</span>
            )}
          </div>
        </div>

        <div className={styles.details_buttons}>
          {editing ? (
            <>
              <button className={styles.save_btn} onClick={handleSaveClick}>Save</button>
              <button className={styles.edit_btn} onClick={handleCancelClick}>Cancel</button>
            </>
          ) : (
            <button className={styles.edit_btn} onClick={handleEditClick}>Edit Profile</button>
          )}
        </div>
      </div>

      {/* Modern map popup overlay */}
      {editing && showMapPopup && (
        <div className={styles.mapPopupOverlay}>
          <div className={styles.mapPopupContent}>
            <div className={styles.mapPopupHeader}>
              <h3>Select Your Location</h3>
              <button 
                className={styles.mapPopupCloseBtn}
                onClick={() => setShowMapPopup(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.mapPopupContainer}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
              >
                {markerPosition && <Marker position={markerPosition} />}
              </GoogleMap>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default CustomerProfileDisplay;
