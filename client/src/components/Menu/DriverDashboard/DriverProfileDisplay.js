import React, { useContext, useState, useEffect } from 'react';
import { DriverContext } from '../../../contexts/DriverContext';
import MapSelector from '../../../components/User/MapSelector'; 
import styles from './DriverProfileDisplay.module.css';
import axios from 'axios';
import config from '../../../config';
import { GoogleMap, Marker } from '@react-google-maps/api';


const DriverProfileDisplay = () => {
  const { driver, fetchDriverProfile, loading } = useContext(DriverContext);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);


  // Fetch driver profile if not available in context
  useEffect(() => {
    if (!driver && !loading) {
      fetchDriverProfile();  // Fetch if the driver details are not available
    }
  }, [driver, loading, fetchDriverProfile]);

  // Load driver profile into formData when available
  useEffect(() => {
    if (driver) {
      setFormData({
        username: driver.username || '',
        email: driver.email || '',
        phoneNumber: driver.phoneNumber || '',
        nationalId: driver.nationalId || '',
        driverLicenseNumber: driver.driverLicenseNumber || '',
        profilePhotoUrl: driver.profilePhotoUrl || '',
        profileCompleted: driver.profileCompleted || false,
        verificationStatus: driver.verificationStatus || 'Pending',
        status: driver.status || 'Available',
        createdAt: driver.createdAt || '',
        updatedAt: driver.updatedAt || '',
        currentLocation: driver.currentLocation || { town: '', location: '' },
        emergencyContact: driver.emergencyContact || { name: '', phoneNumber: '', relationship: '' },
        vehicleDetails: driver.vehicleDetails || { make: '', model: '', plateNumber: '', type: '', color: '' },
      });
      // console.log(formData); 
    }
  }, [driver]);

  useEffect(() => {
    console.log('formData has been updated:', formData);
  }, [formData]);

  if (loading) return <p>Loading driver profile...</p>;
  if (!driver) return <p>No driver profile available</p>;

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCancelClick = () => {
    setEditing(false);
    setNewProfilePhoto(null);
    setFormData({
      ...driver,
      vehicleDetails: { ...driver.vehicleDetails },
      emergencyContact: { ...driver.emergencyContact }
    });
  };

  const handleTownChange = async (e) => {
    const town = e.target.value;
    setFormData(prev => ({
      ...prev,
      currentLocation: { ...prev.currentLocation, town }
    }));


    // If the map is already showing, update center dynamically
    if (showMapSelector || (editing && mapCenter)) {
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(town)}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`);
        const data = await response.json();
        if (data.status === 'OK' && data.results[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          setMapCenter({ lat, lng });
        } else {
          console.warn('Could not find location for updated town');
        }
      } catch (error) {
        console.error('Failed to update map center dynamically:', error);
      }
    }
  };

  const handleLocationInputClick = async () => {
    if (!formData.currentLocation.town.trim()) {
      alert('Please enter a town first');
      return;
    }

    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.currentLocation.town)}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`);
      const data = await response.json();
      if (data.status === 'OK' && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setMapCenter({ lat, lng });
        setShowMapSelector(true);
      } else {
        alert('Could not find location for town');
      }
    } catch (error) {
      console.error('Failed to fetch map center:', error);
    }
  };



  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          setFormData(prev => ({
            ...prev,
            currentLocation: {
              town: prev.currentLocation.town,
              location: results[0].formatted_address
            }
          }));
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    setNewProfilePhoto(e.target.files[0]);
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      currentLocation: {
        town: location.town,
        location: location.exactLocation
      }
    }));
    setShowMapSelector(false);
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('driverToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const payload = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        nationalId: formData.nationalId,
        driverLicenseNumber: formData.driverLicenseNumber,
        vehicleDetails: formData.vehicleDetails,
        emergencyContact: formData.emergencyContact,
        currentLocation: formData.currentLocation,
      };

      const data = new FormData();
      data.append('formData', JSON.stringify(payload));  // 👈 send full formData JSON
      if (newProfilePhoto) {
        data.append('profileImage', newProfilePhoto);
      }

      await axios.put(`${config.backendUrl}/api/driver/updates-profile`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setEditing(false);
      setNewProfilePhoto(null);
      await fetchDriverProfile(); // Refresh profile
    } catch (error) {
      console.error('Failed to save driver profile:', error);
    }
  };



  return (
    <div className={styles.profile_wrapper}>

      {/* Map Selector */}
      {showMapSelector && (
        <MapSelector
          onSelect={handleLocationSelect}
          onCancel={() => setShowMapSelector(false)}
        />
      )}

      {editing && mapCenter && (
        <div className={styles.mapContainer}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '400px' }}
            center={mapCenter}
            zoom={15}
            onClick={handleMapClick}
          >
            {markerPosition && <Marker position={markerPosition} />}
          </GoogleMap>
        </div>
      )}
      <div className={styles.profileContent}>

        {/* Profile Image */}
        <div className={styles.profileImageContainer}>
          <img
            src={newProfilePhoto ? URL.createObjectURL(newProfilePhoto) : `${config.backendUrl}${formData.profilePhotoUrl}`}
            alt="Profile"
            className={styles.profileImage}
          />
          {editing && (
            <div className={styles.image_buttons}>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className={styles.profileDetails}>
          {/* Basic Fields */}
          <div className={styles.profileItem}>
            <strong>Username</strong>
            {editing ? (
              <input name="username" value={formData.username} onChange={handleInputChange} />
            ) : (
              <span>{formData.username}</span>
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
            <strong>National ID</strong>
            {editing ? (
              <input name="nationalId" value={formData.nationalId} onChange={handleInputChange} />
            ) : (
              <span>{formData.nationalId}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Driver License</strong>
            {editing ? (
              <input name="driverLicenseNumber" value={formData.driverLicenseNumber} onChange={handleInputChange} />
            ) : (
              <span>{formData.driverLicenseNumber}</span>
            )}
          </div>

          {/* Vehicle Section */}
          {formData.vehicleDetails && (
            <>
              <div className={styles.profileItem}>
                <strong>Vehicle Make</strong>
                {editing ? (
                  <input
                    name="vehicleDetails.make"
                    value={formData.vehicleDetails?.make || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vehicleDetails: { ...prev.vehicleDetails, make: e.target.value }
                    }))}
                  />
                ) : (
                  <span>{formData.vehicleDetails.make}</span>
                )}
              </div>

              <div className={styles.profileItem}>
                <strong>Vehicle Model</strong>
                {editing ? (
                  <input
                    name="vehicleDetails.model"
                    value={formData.vehicleDetails?.model || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vehicleDetails: { ...prev.vehicleDetails, model: e.target.value }
                    }))}
                  />
                ) : (
                  <span>{formData.vehicleDetails.model}</span>
                )}
              </div>

              <div className={styles.profileItem}>
                <strong>Plate Number</strong>
                {editing ? (
                  <input
                    name="vehicleDetails.plateNumber"
                    value={formData.vehicleDetails?.plateNumber || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vehicleDetails: { ...prev.vehicleDetails, plateNumber: e.target.value }
                    }))}
                  />
                ) : (
                  <span>{formData.vehicleDetails.plateNumber}</span>
                )}
              </div>
            </>
          )}

          {/* Town Field */}
          <div className={styles.profileItem}>
            <strong>Town</strong>
            {editing ? (
              <input
                name="town"
                value={formData.currentLocation.town || ''}
                onChange={handleTownChange}
              />
            ) : (
              <span>{formData.currentLocation?.town}</span>
            )}
          </div>

          {/* Location Field */}
          <div className={styles.profileItem}>
            <strong>Location</strong>
            {editing ? (
              <input
                name="location"
                value={formData.currentLocation.location || ''}
                readOnly
                onClick={handleLocationInputClick}
              />
            ) : (
              <span>{formData.currentLocation?.location}</span>
            )}
          </div>


          {/* Emergency Contact */}
          {formData.emergencyContact && (
            <>
              <div className={styles.profileItem}>
                <strong>Emergency Name</strong>
                {editing ? (
                  <input
                    name="emergencyContact.name"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                  />
                ) : (
                  <span>{formData.emergencyContact.name}</span>
                )}
              </div>

              <div className={styles.profileItem}>
                <strong>Emergency Phone</strong>
                {editing ? (
                  <input
                    name="emergencyContact.phoneNumber"
                    value={formData.emergencyContact?.phoneNumber || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, phoneNumber: e.target.value }
                    }))}
                  />
                ) : (
                  <span>{formData.emergencyContact.phoneNumber}</span>
                )}
              </div>

              <div className={styles.profileItem}>
                <strong>Relationship</strong>
                {editing ? (
                  <input
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact?.relationship || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                    }))}
                  />
                ) : (
                  <span>{formData.emergencyContact.relationship}</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
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
    </div>
  );
};

export default DriverProfileDisplay;

