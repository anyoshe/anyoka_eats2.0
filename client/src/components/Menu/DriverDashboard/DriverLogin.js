import { useContext, useState } from 'react';
import { DriverContext } from '../../../contexts/DriverContext';
import styles from './DriverSignup.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const DriverLogin = () => {
  const navigate = useNavigate();
  const { loginDriver } = useContext(DriverContext);

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = await loginDriver(loginData);
    if (result.success) {
      setSuccess('Logged in successfully!');
      // Navigation will be handled by the DriverContext
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.backButton} onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back
      </div>

      <h1 className={styles.signupTitle}>Driver Login</h1>

      <form onSubmit={handleSubmit} className={styles.signupForm}>
        <div className={styles.formGroup}>
          <label>Username / Phone Number</label>
          <input
            type="text"
            name="username"
            value={loginData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
        </div>

        <p className={styles.forgotPassword}>
          Forgot your password? <a href="/driver/reset-password">Reset it here</a>
        </p>

        <button type="submit" className={styles.submitButton}>
          Login
        </button>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
      </form>

      <div className={styles.switchForm}>
        <p className={styles.toggleButtonP}>
          Don't have an account?{' '}
          <button 
            type="button" 
            onClick={() => navigate('/driver-signup')} 
            className={styles.toggleButton}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default DriverLogin;
