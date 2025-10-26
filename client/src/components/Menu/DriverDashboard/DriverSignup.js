import { useContext, useEffect, useState } from 'react';
import { DriverContext } from '../../../contexts/DriverContext';
import styles from './DriverSignup.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const DriverSignup = () => {
  const navigate = useNavigate();

  const { signupDriver, loginDriver } = useContext(DriverContext);

  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    email: '',
    password: '',
    nationalId: '',
    driverLicenseNumber: '',

  });

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e, isLoginForm = false) => {
    const targetData = isLoginForm ? setLoginData : setFormData;
    targetData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const requiredFields = ['username', 'phoneNumber', 'password', 'nationalId', 'driverLicenseNumber'];
    const missingFields = [];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        missingFields.push(field.replace(/([A-Z])/g, ' $1').toLowerCase());
      }
    }

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Additional validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
      setError('Please enter a valid phone number');
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (isLogin) {
    // 🔹 Driver Login Flow
    if (!loginData.username || !loginData.password) {
      Swal.fire({
        title: 'Missing Fields',
        text: 'Please fill in both your username and password.',
        icon: 'warning',
        confirmButtonColor: '#ff6b00',
      });
      return;
    }

    const result = await loginDriver(loginData);
    if (result.success) {
      Swal.fire({
        title: 'Welcome Back! 🚗',
        text: 'Login successful. Redirecting to your dashboard...',
        icon: 'success',
        confirmButtonColor: '#ff6b00',
      });
      setTimeout(() => {
        setSuccess('Logged in successfully!');
      }, 1500);
    } else {
      Swal.fire({
        title: 'Login Failed',
        text: result.message || 'Invalid credentials. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ff6b00',
      });
    }
  } else {
    // 🔹 Driver Signup Flow
    if (!validateForm()) return;

    try {
      const result = await signupDriver(formData);

      if (result.success) {
        await Swal.fire({
          title: 'Welcome to Anyoka Drivers! 🧡',
          html: `
            <p>Thank you for signing up, <strong>${formData.username}</strong>!</p>
            <p>We’ve sent a verification link to your email <strong>${formData.email}</strong>.</p>
            <p>Please verify your email to activate your driver account and start delivering orders. 🚗💨</p>
          `,
          icon: 'success',
          confirmButtonColor: '#ff6b00',
          confirmButtonText: 'Okay, Got It!',
        });

        // Reset form + switch to login
        setFormData({
          username: '',
          phoneNumber: '',
          email: '',
          password: '',
          nationalId: '',
          driverLicenseNumber: '',
        });
        setTimeout(() => setIsLogin(true), 500);
      } else {
        Swal.fire({
          title: 'Sign-up Failed',
          text: result.message || 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ff6b00',
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Sign-up Failed',
        text: err.response?.data?.message || 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ff6b00',
      });
    }
  }
};


  const toggleForm = () => {
    setIsLogin(!isLogin);  // Toggle between login and signup form
    setError('');
    setSuccess('');
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className={styles.signupContainer}>

      <div className={styles.backButton} onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back
      </div>

      {loading ? (
        <div className={styles.skeletonHeader} />
      ) : (
        <h1 className={styles.signupTitle}>{isLogin ? 'Driver Login' : 'Driver Signup'}</h1>
      )}

      <form onSubmit={handleSubmit} className={styles.signupForm}>
        {isLogin ? (
          <>
            {loading ? <div className={styles.skeletonField} /> : (
              <div className={styles.formGroup}>
                <label>Username / Phone Number</label>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>)}

            {loading ? <div className={styles.skeletonField} /> : (
              <div className={styles.formGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>)}
            {/* 👇 Place the forgot password link here */}
            <p className={styles.forgotPassword}>
              Forgot your password? <a href="/driver/reset-password">Reset it here</a>
            </p>
          </>
        ) : (
          ['username', 'phoneNumber', 'email', 'password', 'nationalId', 'driverLicenseNumber'].map(field => (
            loading ? <div key={field} className={styles.skeletonField} /> : (
              <div key={field} className={styles.formGroup}>
                <label>
                  {field.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  {<span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
                </label>
                <input
                  type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  // required={field !== 'email'}
                  required
                  placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                />
              </div>
            )))
        )}

        {loading ? <div className={styles.skeletonButton} /> : (
          <button type="submit" className={styles.submitButton}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
      </form>

      <div className={styles.switchForm}>
        {isLogin ? (
          <p className={styles.toggleButtonP}>
            Don't have an account?{' '}
            <button type="button" onClick={toggleForm} className={styles.toggleButton}>
              Sign Up
            </button>
          </p>
        ) : (
          <p className={styles.toggleButtonP}>
            Already have an account?{' '}
            <button type="button" onClick={toggleForm} className={styles.toggleButton}>
              Login
            </button>
          </p>
        )}
      </div>

      {/* Login Modal */}
      {showModal && (
        <div className={styles.modal}>

          <div className={styles.modalContent}>

            <span className={styles.closeModal} onClick={closeModal}>&times;</span>

            <h2>Login</h2>

            <form onSubmit={handleSubmit}>

              <div className={styles.formGroup}>

                <label>Username / Phone Number</label>

                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={(e) => handleChange(e, true)}
                  required
                />

              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Login
              </button>

              {error && <div className={styles.errorMessage}>{error}</div>}
              {success && <div className={styles.successMessage}>{success}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverSignup;
