// import React, { useState, useEffect, useRef, useContext } from 'react';
// import styles from './Profile.module.css';
// import profileImg from "../../assets/images/abstract-star-burst-with-rays-flare.png";
// import { PartnerContext } from '../../contexts/PartnerContext';
// import axios from 'axios';
// import config from '../../config';
// import MapSelector from './MapSelector';

// // Debounce function to limit Geocoder API calls
// const debounce = (func, delay) => {
//   let timeoutId;
//   return (...args) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func(...args), delay);
//   };
// };

// const Profile = ({ onSave }) => {
//   const { partner, updatePartnerDetails } = useContext(PartnerContext);
//   const [editImageMode, setEditImageMode] = useState(false);
//   const [editSectionMode, setEditSectionMode] = useState(false);
//   const [showMap, setShowMap] = useState(false);
//   const [mapCenter, setMapCenter] = useState({ lat: -1.286389, lng: 36.817223 }); // Default Nairobi
//   const [formData, setFormData] = useState({
//     businessName: '',
//     contactNumber: '',
//     town: '',
//     location: '',
//     businessType: '',
//     email: '',
//     idNumber: '',
//     description: '',
//     businessPermit: ''
//   });
//   const profileImageInputRef = useRef(null);

//   // Fetch partner details only when partner._id changes
//   useEffect(() => {
//     if (partner?._id && !editSectionMode) {
//       const fetchPartnerDetails = async () => {
//         try {
//           console.time('fetchPartnerDetails'); // Debug: Measure fetch time
//           const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}`);
//           console.timeEnd('fetchPartnerDetails');
//           if (response.data) {
//             const data = response.data;
//             setFormData({
//               businessName: data.businessName || '',
//               contactNumber: data.contactNumber || '',
//               town: data.town || '',
//               location: data.location || '',
//               businessType: data.businessType || '',
//               email: data.email || '',
//               idNumber: data.idNumber || '',
//               description: data.description || '',
//               businessPermit: data.businessPermit || ''
//             });
//             updatePartnerDetails(data);

//             if (data.town) {
//               const geocoder = new window.google.maps.Geocoder();
//               geocoder.geocode({ address: data.town }, (results, status) => {
//                 if (status === 'OK' && results[0]?.geometry?.location) {
//                   setMapCenter({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
//                 }
//               });
//             }
//           }
//         } catch (error) {
//           console.error('Error fetching partner details:', error);
//         }
//       };
//       fetchPartnerDetails();
//     }
//   }, [partner?._id]); // Remove editSectionMode from dependencies

//   // Debounced Geocoder for town input
//   const debouncedGeocode = useRef(
//     debounce((town) => {
//       if (town) {
//         const geocoder = new window.google.maps.Geocoder();
//         geocoder.geocode({ address: town }, (results, status) => {
//           if (status === 'OK' && results[0]?.geometry?.location) {
//             setMapCenter({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
//             setShowMap(true);
//           }
//         });
//       }
//     }, 500) // 500ms debounce
//   ).current;

//   const handleInputChange = (event) => {
//     const { name, value, files } = event.target;
//     setFormData((prev) => {
//       const newFormData = { ...prev, [name]: files ? files[0] : value };
//       if (name === 'town' && value) {
//         debouncedGeocode(value);
//       }
//       return newFormData;
//     });
//   };

//   const handleLocationSelect = (location) => {
//     setFormData((prev) => ({ ...prev, location }));
//     setShowMap(false);
//   };

//   const toggleEditImageMode = () => setEditImageMode(!editImageMode);
//   const toggleEditSection = () => setEditSectionMode(!editSectionMode);

//   const saveProfileImage = async () => {
//     const file = profileImageInputRef.current?.files[0];
//     if (!file) return;

//     const imgFormData = new FormData();
//     imgFormData.append('profileImage', file);
//     imgFormData.append('partnerId', partner._id);

//     try {
//       console.time('saveProfileImage'); // Debug: Measure upload time
//       const response = await fetch(`${config.backendUrl}/api/upload-profile-image`, {
//         method: 'POST',
//         body: imgFormData,
//       });
//       const data = await response.json();
//       console.timeEnd('saveProfileImage');

//       if (response.ok) {
//         const profileImageUrl = `${config.backendUrl}${data.profileImage.replace(/\\/g, '/')}`;
//         updatePartnerDetails({ ...partner, profileImage: profileImageUrl });
//         onSave && onSave();
//         setEditImageMode(false);
//       } else {
//         console.error('Error uploading image:', data.message);
//       }
//     } catch (error) {
//       console.error('Error uploading image:', error);
//     }
//   };

//   const saveSection = async () => {
//     try {
//       console.time('saveSection'); // Debug: Measure save time
//       const response = await axios.put(`${config.backendUrl}/api/partners/${partner._id}`, formData);
//       console.timeEnd('saveSection');
//       updatePartnerDetails(response.data);
//       onSave && onSave();
//       setEditSectionMode(false);
//     } catch (error) {
//       console.error('Error updating partner details:', error);
//     }
//   };

//   return (
//     <div className={styles.profile_wrapper}>
//       <div id="profileContent" className={styles.profileContent}>
//         <div className={styles.profileDetails}>
//           <div className={styles.profileImageContainer}>
//             <input
//               type="file"
//               ref={profileImageInputRef}
//               style={{ display: 'none' }}
//               onChange={saveProfileImage}
//             />
//             <img
//               id="profileImagePreview"
//               src={partner?.profileImage ? `${config.backendUrl}${partner.profileImage.replace(/\\/g, '/')}` : profileImg}
//               alt="Profile"
//               className={styles.profileImage}
//               onClick={() => editImageMode && profileImageInputRef.current.click()}
//             />
//             <div className={styles.image_buttons}>
//               <button className={styles.edit_btn} onClick={toggleEditImageMode} title={editImageMode ? 'Cancel' : 'Edit Picture'}>
//                 <i className={`fas ${editImageMode ? 'fa-times' : 'fa-edit'}`}></i>
//               </button>
//               {editImageMode && (
//                 <button className={styles.save_btn} onClick={saveProfileImage} title="Save">
//                   <i className="fas fa-save"></i>
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className={`${styles.profileItem} ${styles.permit}`}>
//             <strong>Business Permit:</strong>
//             <a
//               id="profileBusinessPermitLink"
//               href={formData.businessPermit}
//               target="_blank"
//               rel="noopener noreferrer"
//               className={styles.permitLink}
//             >
//               View Permit
//             </a>
//           </div>

//           <div className={`${styles.profileItem} ${styles.profileItemShop}`}>
//             <strong>Shop Name:</strong>
//             {editSectionMode ? (
//               <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} />
//             ) : (
//               <span id="profileShopName">{formData.businessName}</span>
//             )}
//           </div>

//           <div className={styles.profileItem}>
//             <strong>Business Category:</strong>
//             {editSectionMode ? (
//               <input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange} />
//             ) : (
//               <span id="profileBusinessCategory">{formData.businessType}</span>
//             )}
//           </div>

//           <div className={styles.profileItem}>
//             <strong>Town or Centre:</strong>
//             {editSectionMode ? (
//               <input type="text" name="town" value={formData.town} onChange={handleInputChange} />
//             ) : (
//               <span id="profileBusinessCategory">{formData.town}</span>
//             )}
//           </div>

//           <div className={styles.profileItem}>
//             <strong>Phone Number:</strong>
//             {editSectionMode ? (
//               <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} />
//             ) : (
//               <span id="profilePhoneNumber">{formData.contactNumber}</span>
//             )}
//           </div>

//           <div className={styles.profileItem}>
//             <strong>Email:</strong>
//             {editSectionMode ? (
//               <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
//             ) : (
//               <span id="profileEmail">{formData.email}</span>
//             )}
//           </div>

//           <div className={styles.profileItem}>
//             <strong>ID Number:</strong>
//             {editSectionMode ? (
//               <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} />
//             ) : (
//               <span id="profileIdNumber">{formData.idNumber}</span>
//             )}
//           </div>

//           <div className={`${styles.profileItem} ${styles.profileLocationDiv}`}>
//             <strong>Location:</strong>
//             {editSectionMode ? (
//               <>
//                 <div className={styles.locationInputWrapper}>
//                   <input
//                     type="text"
//                     name="location"
//                     value={formData.location}
//                     readOnly
//                   />
//                   <button
//                     type="button"
//                     className={styles.edit_btn}
//                     onClick={() => setShowMap(true)}
//                     title={showMap ? 'Hide Map' : 'Edit Location'}
//                   >
//                     <i className={`fas ${showMap ? 'fa-times' : 'fa-pen'}`}></i>
//                   </button>
//                 </div>
//                 {showMap && (
//                   <div className={styles.mapModalOverlay}>
//                     <div className={styles.mapModalContent}>
//                       <button
//                         onClick={() => setShowMap(false)}
//                         className={styles.mapModalClose}
//                         title="Close Map"
//                       >
//                         &times;
//                       </button>
//                       <MapSelector
//                         onLocationSelect={handleLocationSelect}
//                         center={mapCenter}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <span id="profileLocation">{formData.location}</span>
//             )}
//           </div>

//           <div className={`${styles.profileItem} ${styles.profileDescriptionDiv}`}>
//             <strong>Description:</strong>
//             {editSectionMode ? (
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Describe your business..."
//               />
//             ) : (
//               <span id="profileDescription">{formData.description}</span>
//             )}
//           </div>
//         </div>

//         <div className={styles.details_buttons}>
//           <button
//             className={styles.edit_btn}
//             onClick={toggleEditSection}
//             title={editSectionMode ? 'Cancel' : 'Edit Details'}
//           >
//             <i className={`fas ${editSectionMode ? 'fa-times' : 'fa-pen'}`}></i>
//           </button>
//           {editSectionMode && (
//             <button className={styles.save_btn} onClick={saveSection} title="Save Changes">
//               <i className="fas fa-save"></i>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from './Profile.module.css';
import profileImg from "../../assets/images/abstract-star-burst-with-rays-flare.png";
import { PartnerContext } from '../../contexts/PartnerContext';
import axios from 'axios';
import config from '../../config';
import MapSelector from './MapSelector';

// Debounce function to limit Geocoder API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Profile = ({ onSave }) => {
  const { partner, updatePartnerDetails } = useContext(PartnerContext);
  const [editImageMode, setEditImageMode] = useState(false);
  const [editSectionMode, setEditSectionMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -1.286389, lng: 36.817223 }); // Default Nairobi

  const [previewImage, setPreviewImage] = useState(null); // 👈 new preview state
  const profileImageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    businessName: '',
    contactNumber: '',
    town: '',
    location: '',
    businessType: '',
    email: '',
    idNumber: '',
    description: '',
    businessPermit: ''
  });

  // Fetch partner details only when partner._id changes
  useEffect(() => {
    if (partner?._id && !editSectionMode) {
      const fetchPartnerDetails = async () => {
        try {
          const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}`);
          if (response.data) {
            const data = response.data;
            setFormData({
              businessName: data.businessName || '',
              contactNumber: data.contactNumber || '',
              town: data.town || '',
              location: data.location || '',
              businessType: data.businessType || '',
              email: data.email || '',
              idNumber: data.idNumber || '',
              description: data.description || '',
              businessPermit: data.businessPermit || ''
            });
            updatePartnerDetails(data);

            if (data.town) {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ address: data.town }, (results, status) => {
                if (status === 'OK' && results[0]?.geometry?.location) {
                  setMapCenter({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
                }
              });
            }
          }
        } catch (error) {
          console.error('Error fetching partner details:', error);
        }
      };
      fetchPartnerDetails();
    }
  }, [partner?._id]);

  // Debounced Geocoder for town input
  const debouncedGeocode = useRef(
    debounce((town) => {
      if (town) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: town }, (results, status) => {
          if (status === 'OK' && results[0]?.geometry?.location) {
            setMapCenter({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
            setShowMap(true);
          }
        });
      }
    }, 500)
  ).current;

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: files ? files[0] : value };
      if (name === 'town' && value) {
        debouncedGeocode(value);
      }
      return newFormData;
    });
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({ ...prev, location }));
    setShowMap(false);
  };

  const toggleEditImageMode = () => setEditImageMode(!editImageMode);
  const toggleEditSection = () => setEditSectionMode(!editSectionMode);

  // 👇 new handler: set preview when selecting image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const saveProfileImage = async () => {
    const file = profileImageInputRef.current?.files[0];
    if (!file) return;

    const imgFormData = new FormData();
    imgFormData.append('profileImage', file);
    imgFormData.append('partnerId', partner._id);

    try {
      const response = await fetch(`${config.backendUrl}/api/upload-profile-image`, {
        method: 'POST',
        body: imgFormData,
      });
      const data = await response.json();

      if (response.ok) {
        const profileImageUrl = `${config.backendUrl}${data.profileImage.replace(/\\/g, '/')}`;
        updatePartnerDetails({ ...partner, profileImage: profileImageUrl });
        onSave && onSave();
        setEditImageMode(false);
        setPreviewImage(null); // clear preview after save
      } else {
        console.error('Error uploading image:', data.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const saveSection = async () => {
    try {
      const response = await axios.put(`${config.backendUrl}/api/partners/${partner._id}`, formData);
      updatePartnerDetails(response.data);
      onSave && onSave();
      setEditSectionMode(false);
    } catch (error) {
      console.error('Error updating partner details:', error);
    }
  };

  return (
    <div className={styles.profile_wrapper}>
      <div id="profileContent" className={styles.profileContent}>
        <div className={styles.profileDetails}>
          <div className={styles.profileImageContainer}>
            <input
              type="file"
              ref={profileImageInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange} // 👈 show preview only
            />
            <img
              id="profileImagePreview"
              src={
                previewImage
                  ? previewImage
                  : partner?.profileImage
                    ? `${config.backendUrl}${partner.profileImage.replace(/\\/g, '/')}`
                    : profileImg
              }
              alt="Profile"
              className={styles.profileImage}
              onClick={() => editImageMode && profileImageInputRef.current.click()}
            />
            <div className={styles.image_buttons}>
              <button
                className={styles.edit_btn}
                onClick={toggleEditImageMode}
                title={editImageMode ? 'Cancel' : 'Edit Picture'}
              >
                <i className={`fas ${editImageMode ? 'fa-times' : 'fa-edit'}`}></i>
              </button>
              {editImageMode && (
                <button className={styles.save_btn} onClick={saveProfileImage} title="Save">
                  <i className="fas fa-save"></i>
                </button>
              )}
            </div>
          </div>

          {/* ====== Rest of profile details stay the same ====== */}
          <div className={`${styles.profileItem} ${styles.permit}`}>
            <strong>Business Permit:</strong>
            <a
              id="profileBusinessPermitLink"
              href={formData.businessPermit}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.permitLink}
            >
              View Permit
            </a>
          </div>

          <div className={`${styles.profileItem} ${styles.profileItemShop}`}>
            <strong>Shop Name:</strong>
            {editSectionMode ? (
              <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} />
            ) : (
              <span id="profileShopName">{formData.businessName}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Business Category:</strong>
            {editSectionMode ? (
              <input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange} />
            ) : (
              <span id="profileBusinessCategory">{formData.businessType}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Town or Centre:</strong>
            {editSectionMode ? (
              <input type="text" name="town" value={formData.town} onChange={handleInputChange} />
            ) : (
              <span id="profileBusinessCategory">{formData.town}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Phone Number:</strong>
            {editSectionMode ? (
              <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} />
            ) : (
              <span id="profilePhoneNumber">{formData.contactNumber}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>Email:</strong>
            {editSectionMode ? (
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
            ) : (
              <span id="profileEmail">{formData.email}</span>
            )}
          </div>

          <div className={styles.profileItem}>
            <strong>ID Number:</strong>
            {editSectionMode ? (
              <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} />
            ) : (
              <span id="profileIdNumber">{formData.idNumber}</span>
            )}
          </div>

          <div className={`${styles.profileItem} ${styles.profileLocationDiv}`}>
            <strong>Location:</strong>
            {editSectionMode ? (
              <>
                <div className={styles.locationInputWrapper}>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    readOnly
                  />
                  <button
                    type="button"
                    className={styles.edit_btn}
                    onClick={() => setShowMap(true)}
                    title={showMap ? 'Hide Map' : 'Edit Location'}
                  >
                    <i className={`fas ${showMap ? 'fa-times' : 'fa-pen'}`}></i>
                  </button>
                </div>
                {showMap && (
                  <div className={styles.mapModalOverlay}>
                    <div className={styles.mapModalContent}>
                      <button
                        onClick={() => setShowMap(false)}
                        className={styles.mapModalClose}
                        title="Close Map"
                      >
                        &times;
                      </button>
                      <MapSelector
                        onLocationSelect={handleLocationSelect}
                        center={mapCenter}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <span id="profileLocation">{formData.location}</span>
            )}
          </div>

          <div className={`${styles.profileItem} ${styles.profileDescriptionDiv}`}>
            <strong>Description:</strong>
            {editSectionMode ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your business..."
              />
            ) : (
              <span id="profileDescription">{formData.description}</span>
            )}
          </div>
        </div>

        <div className={styles.details_buttons}>
          <button
            className={styles.edit_btn}
            onClick={toggleEditSection}
            title={editSectionMode ? 'Cancel' : 'Edit Details'}
          >
            <i className={`fas ${editSectionMode ? 'fa-times' : 'fa-pen'}`}></i>
          </button>
          {editSectionMode && (
            <button className={styles.save_btn} onClick={saveSection} title="Save Changes">
              <i className="fas fa-save"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
