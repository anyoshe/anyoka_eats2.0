// import { useState, useContext, useCallback } from 'react';
// import { DriverContext } from '../../../contexts/DriverContext';
// import MapSelector from '../../User/MapSelector';
// import { GoogleMap, Marker } from '@react-google-maps/api'; // <-- Add Marker import
// import styles from './ProfileSetupPage.module.css';
// import config from '../../../config';
// import { useNavigate } from 'react-router-dom';


// const ProfileSetupPage = () => {
//   const { driver, setDriver } = useContext(DriverContext); 
//   const navigate = useNavigate();

//   const [vehicle, setVehicle] = useState({
//     make: '',
//     model: '',
//     plateNumber: '',
//     type: '',
//     color: '',
//   });

//   const [emergencyContact, setEmergencyContact] = useState({
//     name: '',
//     phoneNumber: '',
//     relationship: '',
//   });

//   const [profilePhotoFile, setProfilePhotoFile] = useState(null);
//   const [currentLocation, setCurrentLocation] = useState({
//     town: '',
//     location: '',
//   });

//   const [mapCenter, setMapCenter] = useState(null);
//   const [markerPosition, setMarkerPosition] = useState(null); 
//   const [errors, setErrors] = useState({});
//   const [uploading, setUploading] = useState(false);

//   const token = localStorage.getItem('driverToken');
//   console.log(token);

//   const validateInputs = () => {
//     const newErrors = {};

//     if (!vehicle.make) newErrors.make = "Vehicle make is required.";
//     if (!vehicle.model) newErrors.model = "Vehicle model is required.";
//     if (!vehicle.plateNumber || !/^[A-Z0-9-]+$/.test(vehicle.plateNumber)) {
//       newErrors.plateNumber = "Valid plate number is required (only capital letters, numbers, dashes).";
//     }
//     if (!vehicle.type) newErrors.type = "Vehicle type is required.";
//     if (!vehicle.color) newErrors.color = "Vehicle color is required.";

//     if (!emergencyContact.name) newErrors.emergencyName = "Emergency contact name is required.";
//     if (!emergencyContact.phoneNumber || !/^\+?[0-9]{7,15}$/.test(emergencyContact.phoneNumber)) {
//       newErrors.emergencyPhone = "Valid emergency phone number is required.";
//     }
//     if (!emergencyContact.relationship) newErrors.relationship = "Relationship is required.";

//     if (!currentLocation.town) newErrors.town = "Town is required.";
//     if (!currentLocation.location) newErrors.location = "Exact location is required.";

//     if (!profilePhotoFile) newErrors.photo = "Profile photo is required.";

//     setErrors(newErrors);
//     console.log(newErrors); 
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleTownChange = async (e) => {
//     const town = e.target.value;
//     setCurrentLocation({ ...currentLocation, town, location: '' });

//     if (town.trim() !== '') {
//       const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(town)}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`);
//       const data = await response.json();
//       if (data.status === 'OK' && data.results[0]) {
//         const { lat, lng } = data.results[0].geometry.location;
//         setMapCenter({ lat, lng });
//       }
//     }
//   };

//   const handleLocationSelect = (selectedLocation) => {
//     setCurrentLocation(prev => ({ ...prev, location: selectedLocation }));
//   };


//   const handleMapClick = (event) => {
//     const lat = event.latLng.lat();
//     const lng = event.latLng.lng();
//     setMarkerPosition({ lat, lng }); // Update marker position
  
//     const geocoder = new window.google.maps.Geocoder();
//     const latlng = { lat, lng };
  
//     geocoder.geocode({ location: latlng }, (results, status) => {
//       if (status === 'OK') {
//         if (results[0]) {
//           // Retain the town value entered by the user, but update the location field
//           const townName = currentLocation.town;  // Keep the town entered by the user
//           const location = results[0].formatted_address;  // Update location with formatted address
  
//           setCurrentLocation({ 
//             town: townName,  // Keep the town the user entered
//             location: location // Update the location with the geocoded address
//           });
//         }
//       } else {
//         window.alert('Geocoder failed due to: ' + status);
//       }
//     });
//   };
  
//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   console.log("Submit button clicked");

//   if (!validateInputs()) return;

//   setUploading(true);

//   const formData = new FormData();

//   // Append vehicle details
//   formData.append('vehicleDetails', JSON.stringify(vehicle));
//   formData.append('emergencyContact', JSON.stringify(emergencyContact));
//   formData.append('currentLocation', JSON.stringify(currentLocation));
//   formData.append('profileCompleted', true);

//   // Append profile photo if selected
//   if (profilePhotoFile) {
//     formData.append('profileImage', profilePhotoFile);
//   }

//   try {
//     console.log("Submitting form data...");
//     // Make the PUT request with multipart form data
//     const res = await fetch(`${config.backendUrl}/api/driver/update-profile`, {
//       method: 'PUT',
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     if (!res.ok) {
//       throw new Error('Failed to update profile');
//     }

//     const updatedDriver = await res.json();
//     setDriver(updatedDriver); 
//     navigate('/driver/dashboard');
//   } catch (err) {
//     console.error('Update failed', err);
//   } finally {
//     setUploading(false); // Ensure uploading state is reset after completion
//   }
// };

//   return (
//     <div className={styles.profileSetupContainer}>
//       <h2>Complete Your Profile</h2>
//       <form onSubmit={handleSubmit} encType="multipart/form-data">

//         {/* Profile Photo Upload */}
//         <div className={styles.formGroup}>
//           <label>Profile Photo</label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => setProfilePhotoFile(e.target.files[0])}
//           />
//           {errors.photo && <p className={styles.errorMessage}>{errors.photo}</p>}
//         </div>

//         {/* Vehicle Details */}
//         <h3>Vehicle Details</h3>
//         {['make', 'model', 'plateNumber', 'type', 'color'].map((field) => (
//           <div key={field} className={styles.formGroup}>
//             <input
//               type="text"
//               placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
//               value={vehicle[field]}
//               onChange={(e) => setVehicle({ ...vehicle, [field]: e.target.value })}
//             />
//             {errors[field] && <p className={styles.errorMessage}>{errors[field]}</p>}
//           </div>
//         ))}

//         {/* Emergency Contact */}
//         <h3>Emergency Contact</h3>
//         {['name', 'phoneNumber', 'relationship'].map((field) => (
//           <div key={field} className={styles.formGroup}>
//             <input
//               type="text"
//               placeholder={field === 'phoneNumber' ? 'Phone Number' : field.charAt(0).toUpperCase() + field.slice(1)}
//               value={emergencyContact[field]}
//               onChange={(e) => setEmergencyContact({ ...emergencyContact, [field]: e.target.value })}
//             />
//             {errors[`emergency${field.charAt(0).toUpperCase() + field.slice(1)}`] && (
//               <p className={styles.errorMessage}>{errors[`emergency${field.charAt(0).toUpperCase() + field.slice(1)}`]}</p>
//             )}
//           </div>
//         ))}

//         {/* Current Location */}
//         <h3>Current Location</h3>

//         {/* Town Input */}
//         <div className={styles.formGroup}>
//           <input
//             type="text"
//             placeholder="Town"
//             value={currentLocation.town}
//             onChange={handleTownChange}
//           />
//           {errors.town && <p className={styles.errorMessage}>{errors.town}</p>}
//         </div>

//         {/* Map Selector with Marker */}
//         {mapCenter && (
//           <div className={styles.mapContainer}>
//             <GoogleMap
//               mapContainerStyle={{ width: '100%', height: '400px' }}
//               center={mapCenter}
//               zoom={15}
//               onClick={handleMapClick}
//             >
//               {markerPosition && (
//                 <Marker position={markerPosition} />
//               )}
//             </GoogleMap>
//           </div>
//         )}

//         {/* Selected Location Display */}
//         {currentLocation.location && (
//           <p className={styles.selectedLocation}>
//             Selected Location: {currentLocation.location}
//           </p>
//         )}
//         {errors.location && <p className={styles.errorMessage}>{errors.location}</p>}

//         <button type="submit" className={styles.submitButton} disabled={uploading}>
//           {uploading ? "Uploading..." : "Save Profile"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ProfileSetupPage;


import { useState, useContext } from 'react';
import { DriverContext } from '../../../contexts/DriverContext';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import config from '../../../config';
import styles from './ProfileSetupPage.module.css';

const ProfileSetupPage = () => {
  const { setDriver } = useContext(DriverContext);
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    plateNumber: '',
    type: '',
    color: '',
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phoneNumber: '',
    relationship: '',
  });

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  const [currentLocation, setCurrentLocation] = useState({
    town: '',
    location: '',
  });

  const [mapCenter, setMapCenter] = useState({ lat: -1.2921, lng: 36.8219 }); // default Nairobi
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);

  const [uploading, setUploading] = useState(false);
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
        setCurrentLocation({
          town: currentLocation.town,
          location: results[0].formatted_address,
        });
        setMapVisible(false); // close popup after choosing location
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      console.error('Update failed', err);
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
          <img src={profilePhotoPreview} alt="Profile Preview" className={styles.photoPreview} />
        ) : (
          <div className={styles.photoPlaceholder}>No Photo</div>
        )}
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Vehicle Details */}
        <h3>Vehicle Details</h3>
        <div className={styles.gridTwo}>
          <input type="text" placeholder="Make" value={vehicle.make} onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })} />
          <input type="text" placeholder="Model" value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} />
          <input type="text" placeholder="Plate Number" value={vehicle.plateNumber} onChange={(e) => setVehicle({ ...vehicle, plateNumber: e.target.value })} />
          <input type="text" placeholder="Type" value={vehicle.type} onChange={(e) => setVehicle({ ...vehicle, type: e.target.value })} />
          <input type="text" placeholder="Color" value={vehicle.color} onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })} />
        </div>

        {/* Emergency Contact */}
        <h3>Emergency Contact</h3>
        <div className={styles.gridTwo}>
          <input type="text" placeholder="Name" value={emergencyContact.name} onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })} />
          <input type="text" placeholder="Phone Number" value={emergencyContact.phoneNumber} onChange={(e) => setEmergencyContact({ ...emergencyContact, phoneNumber: e.target.value })} />
          <input type="text" placeholder="Relationship" value={emergencyContact.relationship} onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })} />
        </div>

        {/* Location Section */}
        <h3>Current Location</h3>
        <input
          type="text"
          placeholder="Town"
          value={currentLocation.town}
          onClick={() => setMapVisible(true)}
          onChange={(e) => setCurrentLocation({ ...currentLocation, town: e.target.value })}
          readOnly
        />

        {currentLocation.location && <p className={styles.selectedLocation}>Selected Location: {currentLocation.location}</p>}

        {/* Map Modal */}
        {mapVisible && (
          <div className={styles.mapOverlay}>
            <div className={styles.mapModal}>
              <button type="button" className={styles.closeMapBtn} onClick={() => setMapVisible(false)}>✕</button>
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
          <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>Back</button>
          <button type="submit" className={styles.submitButton} disabled={uploading}>
            {uploading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetupPage;
