import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext';
import MapSelector from '../User/MapSelector';
import styles from './SignUpSignIn.module.css';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const StoreSignUpForm = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    profileImage: null,
    contactNumber: '',
    email: '',
    idNumber: '',
    businessPermit: null,
    town: '',
    location: '',
    password: '',
    loginPassword: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -1.286389, lng: 36.817223 }); // Default to Nairobi
  const { setPartner,setToken } = useContext(PartnerContext);
  const navigate = useNavigate();




  useEffect(() => {
    const token = localStorage.getItem('partnerToken');
    if (token) {
      axios.get(`${config.backendUrl}/api/partner`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          const partnerData = response.data;
          setPartner(partnerData);
          navigate(partnerData.role === 'admin' ? '/superuserdashboard' : '/dashboard');
        })
        .catch((error) => {
          console.error('Error fetching partner data:', error);
        });
    }
  }, [navigate, setPartner]);



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

  const handleSubmitSignUp = async (event) => {
    event.preventDefault();

    try {
      const role = formData.email === 'anyokaeats@gmail.com' ? 'admin' : 'partner';

      const data = new FormData();
      data.append('businessName', formData.businessName);
      data.append('businessType', formData.businessType);
      data.append('contactNumber', formData.contactNumber);
      data.append('email', formData.email);
      data.append('idNumber', formData.idNumber);
      data.append('town', formData.town);
      data.append('location', formData.location);
      data.append('password', formData.password);
      data.append('role', role);


      if (formData.businessPermit) data.append('businessPermit', formData.businessPermit);
      if (formData.profileImage) data.append('profileImage', formData.profileImage);
      const response = await axios.post(`${config.backendUrl}/api/signup`, data);

      const { token, partner } = response.data;
      setPartner(partner);
      setToken(token);
      
       // Store partner token and details in localStorage
    localStorage.setItem('partnerToken', token);
    localStorage.setItem('partnerDetails', JSON.stringify(partner));


      alert('Sign up Successful, Welcome!');
      navigate(partner.role === 'admin' ? '/superuserdashboard' : '/dashboard');
    } catch (error) {
      console.error("Sign up error:", error);
      alert(
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "An unexpected error occurred."
      );
    }
  }

  return (
    <section className={styles.signUpContainer}>
      <div className={styles.signUpWrapper}>
        <h2 className={styles.signUpWrapperH2}>Create Store Account</h2>

        <form onSubmit={handleSubmitSignUp} className={styles.formSignUp}>
          <div className={styles.formGroup}>
            <label htmlFor="businessName" className={styles.formSighUpLables}>
              Business Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              required
              value={formData.businessName}
              onChange={handleInputChange}
              className={styles.formSighUpInputs}
              
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="businessType" className={styles.formSighUpLables}>
              Business Type <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="businessType"
              name="businessType"
              required
              value={formData.businessType}
              onChange={handleInputChange}
              className={styles.formSighUpInputs}
              
            />
          </div>


          <div className={styles.formGroup}>
            <label htmlFor="profileImage">Profile Image</label>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contactNumber" className={styles.formSighUpLables}>
              Phone Number <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              required
              value={formData.contactNumber}
              onChange={handleInputChange}
              className={styles.formSighUpInputs}
           
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formSighUpLables}>Email (optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.formSighUpInputs}
             
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="idNumber" className={styles.formSighUpLables}>
              Identification Number <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              required
              value={formData.idNumber}
              onChange={handleInputChange}
              className={styles.formSighUpInputs}
            />
          </div>

          
          <div className={styles.formGroup}>
            <label htmlFor="businessPermit" className={styles.formSighUpLables}>Business Permit Certificate</label>
            <input
              type="file"
              id="businessPermit"
              name="businessPermit"
              onChange={handleInputChange}
              className={`${styles.formSighUpInputs} ${styles.businessPermitO}`}
            />
          </div>



          <div className={styles.formGroup}>
            <label htmlFor="town" className={styles.formSighUpLables}>
              Town or Centre <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="town"
              name="town"
              required
              value={formData.town}
              onChange={handleInputChange}
              className={styles.formSighUpInputs}
              
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.formSighUpLables}>Location</label>

            <div className={styles.inputWithIcon}>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                readOnly
                className={styles.formSighUpInputs}
                placeholder="Click pin or enter town to drop pin"
                required
              />
              <FaMapMarkerAlt
                className={styles.locationIcon}
                onClick={() => setShowMap(true)}
                title="Pin location on map"
              />
            </div>

            {showMap && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                  <button
                    onClick={() => setShowMap(false)}
                    className={styles.closeModal}
                  >
                    ✕
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
          </div>



          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formSighUpLables}>
              Password <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWithIcon}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.formSighUpInputs}
              />
              {showPassword ? (
                <FaEyeSlash
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(false)}
                  title="Hide password"
                />
              ) : (
                <FaEye
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(true)}
                  title="Show password"
                />
              )}
            </div>
          </div>


          <button type="submit" className={styles.submitBtn}>Sign Up</button>
        </form>


      </div>
    </section>
  );
};

export default StoreSignUpForm;
