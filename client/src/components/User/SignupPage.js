import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import MapSelector from './MapSelector';
import styles from './SignupPage.module.css';
import config from '../../config';
import Swal from 'sweetalert2';


const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    names: '',
    email: '',
    phoneNumber: '',
    town: '',
    password: '',
    location: '',
  });

  const [mapCenter, setMapCenter] = useState({ lat: -1.286389, lng: 36.817223 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsLoggedIn, redirectPath, setRedirectPath, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const openMapModal = () => setIsMapModalOpen(true);
  const closeMapModal = () => setIsMapModalOpen(false);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'town') {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: value }, (results, status) => {
        if (status === 'OK' && results[0]?.geometry?.location) {
          const { lat, lng } = results[0].geometry.location;
          setMapCenter({ lat: lat(), lng: lng() });
        }
      });
    }
  };

  const handleLocationSelect = (location) => {
    setFormData({ ...formData, location });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const response = await fetch(`${config.backendUrl}/api/auth/userSignup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ Store user info
      setUser(data.user);
      setIsLoggedIn(true);
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 🎉 Warm welcome modal
      await Swal.fire({
        title: `Welcome, ${data.user.names.split(' ')[0]}! 🎉`,
        html: `
          <p>Your account has been created successfully.</p>
          <p>We've sent you a warm welcome email with helpful info and a link to our <a href="${config.frontendUrl}/data-protection-policy" target="_blank" style="color:#ff6b00;">Data Protection Policy</a>.</p>
          <p>We're so glad to have you join <strong>Anyoka Eats</strong>!</p>
        `,
        icon: 'success',
        confirmButtonColor: '#ff6b00',
        confirmButtonText: 'Let’s Go 🍽️',
      });

      // ✅ Redirect after modal
      const targetPath = redirectPath || '/';
      setRedirectPath('/');
      navigate(targetPath);
    } else {
      Swal.fire({
        title: 'Signup Failed',
        text: data.message,
        icon: 'error',
        confirmButtonColor: '#ff6b00',
      });
    }
  } catch (error) {
    Swal.fire({
      title: 'Oops!',
      text: 'An unexpected error occurred. Please try again.',
      icon: 'error',
      confirmButtonColor: '#ff6b00',
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className={styles['signup-page']}>
      <button
        type="button"
        className={styles['back-button']}
        onClick={() => navigate(-1)}
        aria-label="Go back"
        title="Go back"
      >
        ← Back
      </button>
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit} className={styles['signup-form']}>

        <div className={styles['form-group']}>
          <label htmlFor="username">Username</label>

          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="names">Full Name</label>
          <input
            type="text"
            id="names"
            name="names"
            value={formData.names}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="town">Town</label>
          <input
            type="text"
            id="town"
            name="town"
            value={formData.town}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="password">Confirmed Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles['form-group']}>
          <p className={styles.selectLocation}>Location: {formData.location || 'None'}</p>

          <button type="button" onClick={openMapModal} className={styles['edit-location-button']}>
            Pin Your Location
          </button>

        </div>

        <button type="submit" className={styles['signup-button']} disabled={isSubmitting}>
          {isSubmitting ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      {isMapModalOpen && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <button className={styles['close-button']} onClick={closeMapModal}>×</button>

            <MapSelector onLocationSelect={(loc) => {
              handleLocationSelect(loc);
              closeMapModal();
            }} center={mapCenter} />
          </div>
        </div>
      )}

    </div>
  );
};

export default SignupPage;
