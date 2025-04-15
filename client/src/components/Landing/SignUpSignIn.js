import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext';
import MapSelector from '../User/MapSelector';

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

  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);


  const navigate = useNavigate();
  const { setPartner } = useContext(PartnerContext);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
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

  // useEffect(() => {
  //   const token = localStorage.getItem('authToken');
  //   if (token) {
  //     axios
  //       .get(`${config.backendUrl}/api/partner`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       })
  //       .then((response) => {
  //         const partnerData = response.data;
  //         setPartner(partnerData);
  //         navigate(partnerData.role === 'admin' ? '/superuserdashboard' : '/dashboard');
  //       })
  //       .catch((error) => {
  //         console.error('Error fetching partner data:', error);
  //         // Optional: Remove invalid token
  //         localStorage.removeItem('authToken');
  //       });
  //   }
  // }, [navigate, setPartner]);
  
  const handleLocationSelect = (location) => {
    setFormData((prev) => ({ ...prev, location }));
  };
  

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

      const response = await axios.post(`${config.backendUrl}/api/signup`, data);

      const partnerData = response.data;
      setPartner(partnerData);
      alert('Sign up Successful, Welcome!');
      navigate(partnerData.role === 'admin' ? '/superuserdashboard' : '/dashboard');
    } catch (error) {
      console.error("Sign up error:", error);
      alert(
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "An unexpected error occurred."
      );
    }
  }

  const handleSubmitSignIn = async (event) => {
    event.preventDefault();
    try {
      const loginResponse = await axios.post(`${config.backendUrl}/api/login`, {
        contactNumber: formData.contactNumber,
        password: formData.loginPassword,
      });

      const { token, role } = loginResponse.data;
      if (token) {
        localStorage.setItem('authToken', token);

        const partnerResponse = await axios.get(`${config.backendUrl}/api/partner`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const partnerData = partnerResponse.data;
        setPartner(partnerData);
        navigate(role === 'admin' ? '/superuserdashboard' : '/dashboard');
      } else {
        throw new Error('Token not received');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during sign-in. Please try again.');
    }
  };

  return (
    <section className="signUpContainer">
      <div className="signUpWrapper">
        <h2>Create Your Store Account</h2>

        <form onSubmit={handleSubmitSignUp}>
          <div className="form-group">
            <label htmlFor="businessName">
              Business Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              required
              value={formData.businessName}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessType">
              Business Type <span className="required">*</span>
            </label>
            <input
              type="text"
              id="businessType"
              name="businessType"
              required
              value={formData.businessType}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profileImage">Profile Image</label>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactNumber">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              required
              value={formData.contactNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="idNumber">
              Identification Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              required
              value={formData.idNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="town">
              Town or Centre <span className="required">*</span>
            </label>
            <input
              type="text"
              id="town"
              name="town"
              required
              value={formData.town}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessPermit">Business Permit Certificate</label>
            <input
              type="file"
              id="businessPermit"
              name="businessPermit"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              readOnly
              required
            />
            <button type="button" onClick={() => setShowMap((prev) => !prev)}>
              {showMap ? 'Hide Map' : 'Pin Location on Map'}
            </button>
            {showMap && (
              <div style={{ marginTop: '10px' }}>
                <MapSelector onLocationSelect={handleLocationSelect} />
              </div>
            )}
          </div>


          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" className="submitBtn">Sign Up</button>
        </form>

        <h3>Already have an account? Sign In below</h3>
        <form onSubmit={handleSubmitSignIn}>
          <div className="form-group">
            <label htmlFor="loginPhone">Phone Number</label>
            <input
              type="tel"
              id="loginPhone"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword">Password</label>
            <input
              type={showLoginPassword ? 'text' : 'password'}
              id="loginPassword"
              name="loginPassword"
              value={formData.loginPassword}
              onChange={handleInputChange}
            />
            <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}>
              {showLoginPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" className="submitBtn">Sign In</button>
        </form>
      </div>
    </section>
  );
};

export default StoreSignUpForm;
