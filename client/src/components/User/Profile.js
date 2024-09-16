import React, { useState, useEffect, useRef, useContext } from 'react';
import './Profile.css';
import profileImg from "../../assets/images/abstract-star-burst-with-rays-flare.png";
import { PartnerContext } from '../../contexts/PartnerContext';
import axios from 'axios';
import config from '../../config';

const Profile = ({ onSave }) => {
    const { partner, updatePartnerDetails } = useContext(PartnerContext);
    const [editImageMode, setEditImageMode] = useState(false);
    const [editSectionMode, setEditSectionMode] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        contactNumber: '',
        location: '',
        businessType: '',
    });

    const profileImageRef = useRef(null);
    const profileImageInputRef = useRef(null);

    useEffect(() => {
        // Fetch partner details if partner is not set or refresh the details
        if (partner?._id) {
            const fetchPartnerDetails = async () => {
                try {
                    const response = await axios.get(`${config.backendUrl}/api/partners/${partner._id}`);
                    if (response.data) {
                        updatePartnerDetails(response.data);
                        setFormData({
                            businessName: response.data.businessName || '',
                            contactNumber: response.data.contactNumber || '',
                            location: response.data.location || '',
                            businessType: response.data.businessType || '',
                        });
                    }
                } catch (error) {
                    console.error('Error fetching partner details:', error);
                }
            };

            fetchPartnerDetails();
        }
    }, [partner?._id, updatePartnerDetails]);

    const toggleEditImageMode = () => setEditImageMode(!editImageMode);
    const toggleEditSection = () => setEditSectionMode(!editSectionMode);

    const saveProfileImage = async () => {
        const file = profileImageInputRef.current.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profileImage', file);
            formData.append('partnerId', partner._id); // Append partnerId

            try {
                const response = await fetch(`${config.backendUrl}/api/upload-profile-image`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Uploaded image data:', data);
                    updatePartnerDetails({ ...partner, profileImage: data.profileImage });
                    onSave(); // Notify parent component about the change
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
            console.log('Update successful:', response.data);

            updatePartnerDetails(response.data);
            onSave(); // Notify parent component about the change
            setEditSectionMode(false);
        } catch (error) {
            console.error('Error updating partner details:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <div id="profileImageSection" className="account_details">
            {/* Profile Image Section */}
            <div className="essential_image">
                <input
                    type="file"
                    id="profileImageInput"
                    className="profile-image-input"
                    onChange={saveProfileImage}
                    ref={profileImageInputRef}
                    style={{ display: editImageMode ? 'block' : 'none' }}
                />

                <div className="profile_img_div">
                    <img
                        src={partner?.profileImage ? `${config.backendUrl}/${partner.profileImage.replace(/\\/g, '/')}` : profileImg}
                        alt="Business Profile"
                        className="account_profile_img"
                        ref={profileImageRef}
                    />
                </div>
                
                <div className='image_button'>
                    <button
                        className="editButton profilePicBtn"
                        onClick={toggleEditImageMode}
                    >
                        {editImageMode ? 'Cancel' : 'Edit Picture'}
                    </button>

                    {editImageMode && (
                        <button
                            className="saveButton profilePicBtn"
                            onClick={saveProfileImage}
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>

            {/* Essential Details Section */}
            <div className="essential_details" id="essentialDetailsSection">
                <div className="essential_grid">
                    <div className="essential_grid_content">
                        <input
                            type="text"
                            name="businessName"
                            className="content_input"
                            placeholder='Business Name:'
                            value={formData.businessName}
                            onChange={handleInputChange}
                            disabled={!editSectionMode}
                        />
                    </div>

                    <div className="essential_grid_content">
                        <input
                            type="text"
                            name="contactNumber"
                            className="content_input"
                            placeholder='Main Contact:'
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            disabled={!editSectionMode}
                        />
                    </div>

                    <div className="essential_grid_content">
                        <input
                            type="text"
                            name="location"
                            className="content_input"
                            placeholder='Main Location:'
                            value={formData.location}
                            onChange={handleInputChange}
                            disabled={!editSectionMode}
                        />
                    </div>
                    
                    <div className="essential_grid_content">
                        <input
                            type="text"
                            name="businessType"
                            className="content_input"
                            placeholder='Main Service:'
                            value={formData.businessType}
                            onChange={handleInputChange}
                            disabled={!editSectionMode}
                        />
                    </div>
                </div>

                <button
                    className="editButton editprofileButton"
                    onClick={toggleEditSection}
                >
                    {editSectionMode ? '' : 'Edit'}
                </button>

                {editSectionMode && (
                    <button
                        className="saveButton editprofileButton"
                        onClick={saveSection}
                    >
                        Save
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;
