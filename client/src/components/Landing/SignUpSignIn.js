import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext';
import MapSelector from '../User/MapSelector';
import styles from './SignUpSignIn.module.css';
import { FaMapMarkerAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

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
  });

  const [showMap, setShowMap] = useState(false);
  const [showLocationChoice, setShowLocationChoice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -1.286389, lng: 36.817223 }); // Nairobi default
  const townDebounceRef = useRef(null);
  const { setPartner, setToken } = useContext(PartnerContext);
  const navigate = useNavigate();

  // 🔹 Helper: Geocode a town name to lat/lng
  const geocodeTown = (townName) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) return reject('Google Maps API not available');
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: townName }, (results, status) => {
        if (status === 'OK' && results[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          reject('Geocoding failed');
        }
      });
    });
  };

  // 🔹 When town changes, geocode and open map
  useEffect(() => {
    const town = formData.town.trim();
    if (!town) return;
    clearTimeout(townDebounceRef.current);
    townDebounceRef.current = setTimeout(async () => {
      try {
        const coords = await geocodeTown(town);
        setMapCenter(coords);
      } catch (err) {
        console.warn('Town geocoding failed:', err);
      }
    }, 800);
    return () => clearTimeout(townDebounceRef.current);
  }, [formData.town]);

  // 🔹 Check for logged-in partner
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
      .catch(() => {});
    }
  }, [navigate, setPartner]);

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  // 🔹 Auto detect location using browser geolocation
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCenter({ lat, lng });

        // Reverse geocode to get human-readable address
        if (window.google?.maps) {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat, lng };
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const address = results[0].formatted_address;
              handleLocationSelect(address);
            } else {
              handleLocationSelect(`${lat}, ${lng}`);
            }
          });
        } else {
          handleLocationSelect(`${lat}, ${lng}`);
        }
        setShowLocationChoice(false);
      },
      () => alert('Unable to retrieve your location.')
    );
  };

  const handleManualPin = async () => {
    if (formData.town.trim()) {
      try {
        const coords = await geocodeTown(formData.town.trim());
        setMapCenter(coords);
      } catch {
        console.warn('Could not geocode town.');
      }
    }
    setShowLocationChoice(false);
    setShowMap(true);
  };

  const handleSubmitSignUp = async (event) => {
    event.preventDefault();

    // Manual validation
  if (!formData.location || formData.location.trim() === '') {
    alert('Please drop a pin or select a location before submitting.');
    return; // stop submission
  }
    try {
      const role = formData.email === 'anyokaeats@gmail.com' ? 'admin' : 'partner';

      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => val && data.append(key, val));
      data.append('role', role);

      const response = await axios.post(`${config.backendUrl}/api/signup`, data);
      const { token, partner } = response.data;

      setPartner(partner);
      setToken(token);
      localStorage.setItem('partnerToken', token);
      localStorage.setItem('partnerDetails', JSON.stringify(partner));

      // alert('Sign up successful! Welcome!');
      // navigate(partner.role === 'admin' ? '/superuserdashboard' : '/dashboard');
      alert('Sign up successful! Please check your email to verify your account before logging in.');
      navigate('/sign-in');

    } catch (error) {
      alert(error.response?.data?.message || 'Sign up failed. Try again.');
    }
  };

  return (
    <section className={styles.signUpContainer}>
      <div className={styles.backButton} onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back
      </div>

      <div className={styles.signUpWrapper}>
        <h2 className={styles.signUpWrapperH2}>Create Store Account</h2>

        <form onSubmit={handleSubmitSignUp} className={styles.formSignUp}>
          {/* 🏢 Business Info */}
          <div className={styles.formGroup}>
            <label>Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              required
              className={styles.formSighUpInputs}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Business Type *</label>
            <input
              type="text"
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              required
              className={styles.formSighUpInputs}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Profile Image</label>
            <input type="file" name="profileImage" onChange={handleInputChange} />
          </div>

          <div className={styles.formGroup}>
            <label>Phone Number *</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              required
              className={styles.formSighUpInputs}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={styles.formSighUpInputs}
            />
          </div>

          <div className={styles.formGroup}>
            <label>ID Number *</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              required
              className={styles.formSighUpInputs}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Business Permit</label>
            <input type="file" name="businessPermit" onChange={handleInputChange} />
          </div>

          {/* 🗺️ Location Section */}
          <div className={styles.formGroup}>
            <label>Town or Centre *</label>
            <input
              type="text"
              name="town"
              value={formData.town}
              onChange={handleInputChange}
              required
              className={styles.formSighUpInputs}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Location *</label>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                name="location"
                value={formData.location}
                readOnly
                placeholder="Click pin or enter town to drop pin"
                onClick={() => setShowLocationChoice(true)}
                required
                className={styles.formSighUpInputs}
              />
              <FaMapMarkerAlt
                className={styles.locationIcon}
                onClick={() => setShowLocationChoice(true)}
              />
            </div>
          </div>

          {/* 🔹 Location Choice Modal */}
          {showLocationChoice && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3>Select how to set your location</h3>
                <button onClick={handleAutoLocate} className={styles.choiceBtn}>
                  📍 Auto-detect my location
                </button>
                <button onClick={handleManualPin} className={styles.choiceBtn}>
                  🗺️ Manually pin location
                </button>
                <button onClick={() => setShowLocationChoice(false)} className={styles.closeModal}>
                  x 
                </button>
              </div>
            </div>
          )}

          {/* 🔹 Map Modal */}
          {showMap && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <button onClick={() => setShowMap(false)} className={styles.closeModal}>
                  ✕
                </button>
                <MapSelector
                  center={mapCenter}
                  onLocationSelect={(location) => {
                    handleLocationSelect(location);
                    setShowMap(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* 🔑 Password */}
          <div className={styles.formGroup}>
            <label>Password *</label>
            <div className={styles.inputWithIcon}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={styles.formSighUpInputs}
              />
              {showPassword ? (
                <FaEyeSlash onClick={() => setShowPassword(false)} className={styles.eyeIcon} />
              ) : (
                <FaEye onClick={() => setShowPassword(true)} className={styles.eyeIcon} />
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
