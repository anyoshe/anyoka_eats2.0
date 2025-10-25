import { useState, useContext, useEffect } from 'react';
import { DriverContext } from '../../../contexts/DriverContext';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import config from '../../../config';
import styles from './ProfileSetupPage.module.css';

const ProfileSetupPage = () => {
  const { driver, setDriver } = useContext(DriverContext);
  const navigate = useNavigate();

  // ✅ Detect if this is the first profile setup
  const isFirstUpdate = !driver?.profileCompleted;

  const [vehicle, setVehicle] = useState(driver?.vehicleDetails || {
    make: '',
    model: '',
    plateNumber: '',
    type: '',
    color: '',
  });

  const [emergencyContact, setEmergencyContact] = useState(driver?.emergencyContact || {
    name: '',
    phoneNumber: '',
    relationship: '',
  });

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(driver?.profilePhotoUrl || null);

  const [currentLocation, setCurrentLocation] = useState(driver?.currentLocation || {
    town: '',
    location: '',
  });

  const [mapCenter, setMapCenter] = useState({ lat: -1.2921, lng: 36.8219 });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('driverToken');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfilePhotoFile(file);
    if (file) setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setCurrentLocation((prev) => ({
          ...prev,
          location: results[0].formatted_address,
        }));
        setMapVisible(false);
      }
    });
  };

  // ✅ Validation function for first-time setup
  const validateProfile = () => {
    if (!isFirstUpdate) return true; // allow partial updates later

    const missing = [];

    // Vehicle checks
    Object.entries(vehicle).forEach(([key, value]) => {
      if (!value.trim()) missing.push(`Vehicle ${key}`);
    });

    // Emergency contact checks
    Object.entries(emergencyContact).forEach(([key, value]) => {
      if (!value.trim()) missing.push(`Emergency contact ${key}`);
    });

    // Location checks
    if (!currentLocation.town.trim()) missing.push('Town');
    if (!currentLocation.location.trim()) missing.push('Pinned location');

    // Photo check
    if (!profilePhotoFile && !profilePhotoPreview) missing.push('Profile photo');

    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError(''); // clear any previous errors
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const geocoder = new window.google.maps.Geocoder();
        const latLng = { lat: latitude, lng: longitude };

        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;

            // Try to extract town/city name from the results
            let townName = '';
            const components = results[0].address_components;
            for (const comp of components) {
              if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
                townName = comp.long_name;
                break;
              }
            }

            setCurrentLocation({
              town: townName || currentLocation.town,
              location: address,
            });
            setMarkerPosition(latLng);
            setMapCenter(latLng);
          } else {
            setError('Unable to detect location. Try manual pinning.');
          }
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Location detection failed. Please enable GPS or use manual pinning.');
      }
    );
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🚫 Stop submission if validation fails
    if (!validateProfile()) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('vehicleDetails', JSON.stringify(vehicle));
    formData.append('emergencyContact', JSON.stringify(emergencyContact));
    formData.append('currentLocation', JSON.stringify(currentLocation));
    formData.append('profileCompleted', true);
    if (profilePhotoFile) formData.append('profileImage', profilePhotoFile);

    try {
      const res = await fetch(`${config.backendUrl}/api/driver/update-profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const updatedDriver = await res.json();
      setDriver(updatedDriver);
      navigate('/driver/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.profileSetupContainer}>
      <h2>Complete Your Profile</h2>

      {/* Profile Photo */}
      <div className={styles.photoSection}>
        {profilePhotoPreview ? (
          <img
            src={profilePhotoPreview}
            alt="Profile Preview"
            className={styles.photoPreview}
          />
        ) : (
          <div className={styles.photoPlaceholder}>No Photo</div>
        )}
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>

      {/* 🚨 Error display */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Vehicle Details */}
        <h3>Vehicle Details</h3>
        <div className={styles.gridTwo}>
          <input
            type="text"
            placeholder="Make"
            value={vehicle.make}
            onChange={(e) =>
              setVehicle({ ...vehicle, make: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Model"
            value={vehicle.model}
            onChange={(e) =>
              setVehicle({ ...vehicle, model: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Plate Number"
            value={vehicle.plateNumber}
            onChange={(e) =>
              setVehicle({ ...vehicle, plateNumber: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Type"
            value={vehicle.type}
            onChange={(e) =>
              setVehicle({ ...vehicle, type: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Color"
            value={vehicle.color}
            onChange={(e) =>
              setVehicle({ ...vehicle, color: e.target.value })
            }
          />
        </div>

        {/* Emergency Contact */}
        <h3>Emergency Contact</h3>
        <div className={styles.gridTwo}>
          <input
            type="text"
            placeholder="Name"
            value={emergencyContact.name}
            onChange={(e) =>
              setEmergencyContact({ ...emergencyContact, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={emergencyContact.phoneNumber}
            onChange={(e) =>
              setEmergencyContact({
                ...emergencyContact,
                phoneNumber: e.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="Relationship"
            value={emergencyContact.relationship}
            onChange={(e) =>
              setEmergencyContact({
                ...emergencyContact,
                relationship: e.target.value,
              })
            }
          />
        </div>

        {/* Location Section */}
        <h3>Current Location</h3>
        <input
          type="text"
          placeholder="Town"
          value={currentLocation.town}
          onChange={(e) =>
            setCurrentLocation({ ...currentLocation, town: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Click to pin location"
          value={currentLocation.location}
          readOnly
          className={styles.readOnlyInput}
          onClick={async () => {
            if (currentLocation.town.trim()) {
              try {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode(
                  { address: currentLocation.town },
                  (results, status) => {
                    if (status === 'OK' && results[0]) {
                      setMapCenter(results[0].geometry.location.toJSON());
                    } else {
                      setMapCenter({ lat: -1.2921, lng: 36.8219 });
                    }
                    setMapVisible(true);
                  }
                );
              } catch (err) {
                setMapCenter({ lat: -1.2921, lng: 36.8219 });
                setMapVisible(true);
              }
            } else {
              setMapCenter({ lat: -1.2921, lng: 36.8219 });
              setMapVisible(true);
            }
          }}
        />
        <div className={styles.locationOptions}>
          <button
            type="button"
            className={styles.locationButton}
            onClick={handleAutoDetectLocation}
          >
            📍 Auto-Detect My Location
          </button>

          <button
            type="button"
            className={styles.locationButton}
            onClick={() => {
              if (currentLocation.town.trim()) {
                // Same geocode logic as before
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode(
                  { address: currentLocation.town },
                  (results, status) => {
                    if (status === 'OK' && results[0]) {
                      setMapCenter(results[0].geometry.location.toJSON());
                    } else {
                      setMapCenter({ lat: -1.2921, lng: 36.8219 });
                    }
                    setMapVisible(true);
                  }
                );
              } else {
                setMapCenter({ lat: -1.2921, lng: 36.8219 });
                setMapVisible(true);
              }
            }}
          >
            🗺️ Pin Location Manually
          </button>
        </div>


        {/* Map Modal */}
        {mapVisible && (
          <div className={styles.mapOverlay}>
            <div className={styles.mapModal}>
              <button
                type="button"
                className={styles.closeMapBtn}
                onClick={() => setMapVisible(false)}
              >
                ✕
              </button>
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
        )}

        {/* Buttons */}
        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={uploading}
          >
            {uploading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetupPage;
