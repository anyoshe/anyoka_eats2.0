// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../../contexts/AuthContext';
// import MapSelector from './MapSelector';
// import './SignupPage.css';
// import config from '../../config';


// const SignupPage = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     names: '',
//     email: '',
//     phoneNumber: '',
//     town: '',
//     password: '',
//     location: '',
//   });
//   const [mapCenter, setMapCenter] = useState({ lat: -1.286389, lng: 36.817223 }); // Default to Nairobi
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { setIsLoggedIn, redirectPath, setRedirectPath, setUser } = useContext(AuthContext);
//   const navigate = useNavigate();

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });

//     // Update map center dynamically based on town input
//     if (name === 'town') {
//       const geocoder = new window.google.maps.Geocoder();
//       geocoder.geocode({ address: value }, (results, status) => {
//         if (status === 'OK' && results[0]?.geometry?.location) {
//           const { lat, lng } = results[0].geometry.location;
//           setMapCenter({ lat: lat(), lng: lng() });
//         }
//       });
//     }
//   };

//   // Handle location selection from the map
//   const handleLocationSelect = (location) => {
//     setFormData({ ...formData, location });
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const response = await fetch(`${config.backendUrl}/api/auth/userSignup`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
    
//       if (response.ok) {
//         console.log('User after signup:', data.user);
//         setUser(data.user);
//         setIsLoggedIn(true);
//         localStorage.setItem('userToken', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));
//         alert('Signup successful!');
//         navigate(redirectPath || '/');
//         setRedirectPath('/');
      
      
//     } else {
//         alert(`Signup failed: ${data.message}`);
//       }
//     } catch (error) {
//       console.error('Error during signup:', error);
//       alert('An error occurred. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="signup-page">
//       <h1>Sign Up</h1>
//       <form onSubmit={handleSubmit} className="signup-form">
//         <div className="form-group">
//           <label htmlFor="username">Username</label>
//           <input
//             type="text"
//             id="username"
//             name="username"
//             value={formData.username}
//             onChange={handleInputChange}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="names">Full Name</label>
//           <input
//             type="text"
//             id="names"
//             name="names"
//             value={formData.names}
//             onChange={handleInputChange}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="email">Email</label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={formData.email}
//             onChange={handleInputChange}
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="phoneNumber">Phone Number</label>
//           <input
//             type="tel"
//             id="phoneNumber"
//             name="phoneNumber"
//             value={formData.phoneNumber}
//             onChange={handleInputChange}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="town">Town</label>
//           <input
//             type="text"
//             id="town"
//             name="town"
//             value={formData.town}
//             onChange={handleInputChange}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             value={formData.password}
//             onChange={handleInputChange}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Pin Your Location</label>
//           <MapSelector onLocationSelect={handleLocationSelect} center={mapCenter} />
//           <p>Selected Location: {formData.location || 'None'}</p>
//         </div>

//         <button type="submit" className="signup-button" disabled={isSubmitting}>
//           {isSubmitting ? 'Signing Up...' : 'Sign Up'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SignupPage;

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import MapSelector from './MapSelector';
import styles from './SignupPage.module.css'; // <-- changed import
import config from '../../config';

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
        console.log('User after signup:', data.user);
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Signup successful!');
        navigate(redirectPath || '/');
        setRedirectPath('/');
      } else {
        alert(`Signup failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles['signup-page']}>
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
          <label>Pin Your Location</label>
          <MapSelector onLocationSelect={handleLocationSelect} center={mapCenter} />
          <p>Selected Location: {formData.location || 'None'}</p>
        </div>

        <button type="submit" className={styles['signup-button']} disabled={isSubmitting}>
          {isSubmitting ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
