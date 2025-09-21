import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../../config';
import styles from './DriverSignup.module.css'; // Reuse styles from DriverSignup
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const DriverPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isResetRequest, setIsResetRequest] = useState(true);
  const [isLinkSent, setIsLinkSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Map email domains to login URLs
  const emailProviders = {
    'gmail.com': 'https://mail.google.com',
    'yahoo.com': 'https://mail.yahoo.com',
    'outlook.com': 'https://outlook.live.com',
    'hotmail.com': 'https://outlook.live.com',
    'aol.com': 'https://mail.aol.com',
  };

  const getEmailProviderUrl = (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return emailProviders[domain] || null;
  };

  // Extract token + email from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
      setIsResetRequest(false);
      setIsLinkSent(false);
    }
  }, [location.search]);

  // Send reset link
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${config.backendUrl}/api/driver/request-reset`, { email });
      setMessage(res.data.message);
      setIsLinkSent(true); // Show "Check your email"
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    }
  };

  // Reset password with token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token || !email || !newPassword) {
      setError('Please provide token, email, and new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post(`${config.backendUrl}/api/driver/reset-password`, {
        token,
        email,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/driver-signup'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  // Open email provider site
  const handleCheckEmail = () => {
    const providerUrl = getEmailProviderUrl(email);
    if (providerUrl) {
      window.open(providerUrl, '_blank');
    } else {
      window.location.href = 'mailto:';
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.backButton} onClick={() => navigate('/driver-signup')}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back
      </div>

      {isLinkSent ? (
        <div className={styles.signupForm}>
          <h2 className={styles.signupTitle}>Reset Password</h2>
          {message && <p className={styles.successMessage}>{message}</p>}
          <p>A link has been sent to your email for password reset.</p>
          <button onClick={handleCheckEmail} className={styles.submitButton}>
            Check Your Email
          </button>
        </div>
      ) : (
        <form
          className={styles.signupForm}
          onSubmit={isResetRequest ? handleRequestReset : handleResetPassword}
        >
          <h2 className={styles.signupTitle}>Reset Password</h2>

          {error && <p className={styles.errorMessage}>{error}</p>}
          {message && <p className={styles.successMessage}>{message}</p>}

          {isResetRequest ? (
            <div className={styles.formGroup}>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Reset Token:</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className={styles.submitButton}>
            {isResetRequest ? 'Send Reset Link' : 'Reset Password'}
          </button>

          {isResetRequest && (
            <p>
              <span
                className={styles.toggleButton}
                onClick={() => setIsResetRequest(false)}
              >
                Already have a reset token? Enter it here
              </span>
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default DriverPasswordReset;
