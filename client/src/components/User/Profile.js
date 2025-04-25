import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from './Profile.module.css';
import profileImg from "../../assets/images/abstract-star-burst-with-rays-flare.png";
import { PartnerContext } from '../../contexts/PartnerContext';
import axios from 'axios';
import config from '../../config';
import MapSelector from './MapSelector';



const Profile = ({ onSave }) => {
    const { partner, updatePartnerDetails } = useContext(PartnerContext);
    const [editImageMode, setEditImageMode] = useState(false);
    const [editSectionMode, setEditSectionMode] = useState(false);
    const [location, setLocation] = useState('');
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [originalTown, setOriginalTown] = useState('');
    const [originalLocation, setOriginalLocation] = useState('');
    const [mapCenter, setMapCenter] = useState({ lat: -1.286389, lng: 36.817223 }); // default Nairobi
    const [showMap, setShowMap] = useState(false);
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

    const handleInputChange = (event) => {
        const { name, value, files } = event.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
            // Update map center dynamically based on town
            if (name === 'town') {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ address: value }, (results, status) => {
                    if (status === 'OK' && results[0]?.geometry?.location) {
                        const { lat, lng } = results[0].geometry.location;
                        setMapCenter({ lat: lat(), lng: lng() });
                        setShowMap(true);
                    }
                });
            }
        }
    };


    const handleLocationSelect = (location) => {
        setFormData((prev) => ({ ...prev, location }));
    };



    const profileImageInputRef = useRef(null);
    useEffect(() => {
        if (partner?._id) {
            const fetchPartnerDetails = async () => {
                try {
                    const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}`);
                    if (response.data) {
                        updatePartnerDetails(response.data);

                        if (!editSectionMode) {
                            setFormData({
                                businessName: response.data.businessName || '',
                                contactNumber: response.data.contactNumber || '',
                                location: response.data.location || '',
                                businessType: response.data.businessType || '',
                                email: response.data.email || '',
                                idNumber: response.data.idNumber || '',
                                town: response.data.town || '',
                                description: response.data.description || '',
                                businessPermit: response.data.businessPermit || ''
                            });
                            setOriginalTown(response.data.town || '');
                            setOriginalLocation(response.data.location || '');

                            if (response.data.town) {
                                const geocoder = new window.google.maps.Geocoder();
                                geocoder.geocode({ address: response.data.town }, (results, status) => {
                                    if (status === 'OK' && results[0]?.geometry?.location) {
                                        const { lat, lng } = results[0].geometry.location;
                                        setMapCenter({ lat: lat(), lng: lng() });
                                    }
                                });
                            }
                            
                        }

                    }
                } catch (error) {
                    console.error('Error fetching partner details:', error);
                }
            };

            fetchPartnerDetails();
        }
    }, [partner?._id, updatePartnerDetails, editSectionMode]);

    const toggleEditImageMode = () => setEditImageMode(!editImageMode);
    const toggleEditSection = () => setEditSectionMode(!editSectionMode);

    const saveProfileImage = async () => {
        const file = profileImageInputRef.current.files[0];
        if (file) {
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
                } else {
                    console.error('Error uploading image:', data.message);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }

            setEditImageMode(false);
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
                            onChange={saveProfileImage}
                        />
                        <img
                            id="profileImagePreview"
                            src={partner?.profileImage ? `${config.backendUrl}${partner.profileImage.replace(/\\/g, '/')}` : profileImg}
                            alt="Profile"

                            className={styles.profileImage}
                            onClick={() => editImageMode && profileImageInputRef.current.click()}
                        />

                        <div className={styles.image_buttons}>
                            <button className={styles.edit_btn} onClick={toggleEditImageMode} title={editImageMode ? 'Cancel' : 'Edit Picture'}>
                                <i className={`fas ${editImageMode ? 'fa-times' : 'fa-edit'}`}></i>
                            </button>

                            {editImageMode && (

                                <button className={styles.save_btn} onClick={saveProfileImage} title="Save">
                                    <i className="fas fa-save"></i>
                                </button>
                            )}
                        </div>
                    </div>


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
                                                onLocationSelect={(location) => {
                                                    handleLocationSelect(location);
                                                    setShowMap(false);
                                                }}
                                                center={mapCenter} // 👈 pass the current map center
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
