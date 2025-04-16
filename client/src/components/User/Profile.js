import React, { useState, useEffect, useRef, useContext } from 'react';
import './Profile.css';
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

     
    const handleLocationSelect = (plusCode) => {
        setLocation(plusCode);
      };
    
      const toggleMapVisibility = () => {
        setIsMapVisible((prev) => !prev);
      };
      
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

    const profileImageInputRef = useRef(null);
    useEffect(() => {
        if (partner?._id) {
            const fetchPartnerDetails = async () => {
                try {
                    const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}`);
                    if (response.data) {
                        updatePartnerDetails(response.data);

                        // Only reset formData if NOT in edit mode
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="profile_wrapper">
            <div id="profileContent" className="tab-content active">
                {/* <h2 className="ProfileH2">Your Profile</h2> */}

                <div className="profile-details">
                    <div className="profile-image-container">
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
                            className="profile-image"
                            onClick={() => editImageMode && profileImageInputRef.current.click()}
                        />
                       <div className="image_buttons">
                            <button className="edit_btn" onClick={toggleEditImageMode} title={editImageMode ? 'Cancel' : 'Edit Picture'}>
                                <i className={`fas ${editImageMode ? 'fa-times' : 'fa-edit'}`}></i>
                            </button>

                            {editImageMode && (
                                <button className="save_btn" onClick={saveProfileImage} title="Save">
                                <i className="fas fa-save"></i>
                                </button>
                            )}
                        </div>


                    </div>

                    <div className="profile-item permit">
                        <strong>Business Permit:</strong>
                        <a
                            id="profileBusinessPermitLink"
                            href={formData.businessPermit}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-link"
                        >
                            View Permit
                        </a>
                    </div>

                    <div className="profile-item profileItemShop">
                        <strong>Shop Name:</strong>
                        {editSectionMode ? (
                            <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} />
                        ) : (
                            <span id="profileShopName">{formData.businessName}</span>
                        )}
                    </div>

                    <div className="profile-item">
                        <strong>Business Category:</strong>
                        {editSectionMode ? (
                            <input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange} />
                        ) : (
                            <span id="profileBusinessCategory">{formData.businessType}</span>
                        )}
                    </div>

                    <div className="profile-item">
                        <strong>Town or Centre:</strong>
                        {editSectionMode ? (
                            <input type="text" name="town" value={formData.town} onChange={handleInputChange} />
                        ) : (
                            <span id="profileBusinessCategory">{formData.town}</span>
                        )}
                    </div>

                    <div className="profile-item">
                        <strong>Phone Number:</strong>
                        {editSectionMode ? (
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} />
                        ) : (
                            <span id="profilePhoneNumber">{formData.contactNumber}</span>
                        )}
                    </div>

                    <div className="profile-item">
                        <strong>Email:</strong>
                        {editSectionMode ? (
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        ) : (
                            <span id="profileEmail">{formData.email}</span>
                        )}
                    </div>

                    <div className="profile-item">
                        <strong>ID Number:</strong>
                        {editSectionMode ? (
                            <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} />
                        ) : (
                            <span id="profileIdNumber">{formData.idNumber}</span>
                        )}
                    </div>

                    <div className="profile-item">
                        <strong>Location:</strong>
                        {editSectionMode ? (
                            <>
                            <div className="locationInputWrapper">
                                <input
                                type="text"
                                name="location"
                                value={formData.location}
                                readOnly
                                />
                                <button
                                type="button"
                                className="edit_btn"
                                onClick={toggleMapVisibility}
                                title={isMapVisible ? 'Hide Map' : 'Edit Location'}
                                >
                                <i className={`fas ${isMapVisible ? 'fa-times' : 'fa-pen'}`}></i>
                                </button>
                            </div>

                            {isMapVisible && (
                                <MapSelector
                                onLocationSelect={(plusCode) =>
                                    setFormData((prev) => ({ ...prev, location: plusCode }))
                                }
                                />
                            )}
                            </>
                        ) : (
                            <span id="profileLocation">{formData.location}</span>
                        )}
                    </div>

                    <div className="profile-item profileDescriptionDiv">
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

                <div className="details_buttons">
                    <button
                        className="edit_btn"
                        onClick={toggleEditSection}
                        title={editSectionMode ? 'Cancel' : 'Edit Details'}
                    >
                        <i className={`fas ${editSectionMode ? 'fa-times' : 'fa-pen'}`}></i>
                    </button>

                    {editSectionMode && (
                        <button className="save_btn" onClick={saveSection} title="Save Changes">
                        <i className="fas fa-save"></i>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;
