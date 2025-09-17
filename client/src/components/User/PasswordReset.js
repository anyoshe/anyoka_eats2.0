import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import styles from './Login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // const [token, setToken] = useState('');
  // const [isResetRequest, setIsResetRequest] = useState(true);
  const navigate = useNavigate();

  // Handle immediate password reset
  const handleImmediateReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post(`${config.backendUrl}/api/auth/reset-password-immediate`, {
        email,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  /*
  // Handle password reset request (send email with reset link)
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${config.backendUrl}/api/auth/request-reset`, { email });
      setMessage(res.data.message);
      setIsResetRequest(false); // Switch to reset form after successful request
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    }
  };

  // Handle email-based password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post(`${config.backendUrl}/api/auth/reset-password`, {
        token,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };
  */

  return (
    <div className='loginBackDiv'>
      <div className={styles.backButton} onClick={() => navigate('/sign-in')}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back to Login
      </div>

      <form className={styles.form} onSubmit={handleImmediateReset}>
        <h2>Reset Password</h2>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.field}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label>Confirm New Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Reset Password</button>

        {/*
        <p>
          Prefer to reset via email?{' '}
          <span
            className={styles.forgotPasswordLink}
            onClick={() => setIsResetRequest(true)}
          >
            Send reset link
          </span>
        </p>
        */}
      </form>
    </div>
  );
};

export default PasswordReset;