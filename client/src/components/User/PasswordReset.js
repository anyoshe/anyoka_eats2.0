import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config';
import styles from './Login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const PasswordReset = () => {
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
  const [accountType, setAccountType] = useState('user');

  // Map email domains to login URLs
  const emailProviders = {
    'gmail.com': 'https://mail.google.com',
    'yahoo.com': 'https://mail.yahoo.com',
    'outlook.com': 'https://outlook.live.com',
    'hotmail.com': 'https://outlook.live.com',
    'aol.com': 'https://mail.aol.com',
    // Add more providers as needed
  };

  // Get email provider login URL
  const getEmailProviderUrl = (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return emailProviders[domain] || null;
  };

  // Extract token and email from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    const urlAccountType = params.get('accountType');
    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
      setAccountType(urlAccountType || 'user');
      setIsResetRequest(false);
      setIsLinkSent(false);
    }
  }, [location.search]);

  // Handle password reset request (send email with reset link)
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${config.backendUrl}/api/auth/request-reset`, { email, accountType });
      setMessage(res.data.message);
      setIsLinkSent(true); // Show confirmation message instead of reset form
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    }
  };

  // Handle email-based password reset
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
      const res = await axios.post(`${config.backendUrl}/api/auth/reset-password`, {
        token,
        email,
        newPassword,
        accountType,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/sign-in'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  // Handle "Check Your Email" button click
  const handleCheckEmail = () => {
    const providerUrl = getEmailProviderUrl(email);
    if (providerUrl) {
      window.open(providerUrl, '_blank');
    } else {
      // Fallback: Open default mail client or prompt user
      window.location.href = 'mailto:';
    }
  };

  return (
    <div className='loginBackDiv'>
      <div className={styles.backButton} onClick={() => navigate('/sign-in')}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back to Login
      </div>

      {isLinkSent ? (
        <div className={styles.form}>
          <h2>Reset Password</h2>
          {message && <p className={styles.message}>{message}</p>}
          <p>A link has been sent to your email for password reset.</p>
          <button onClick={handleCheckEmail}>Check Your Email</button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={isResetRequest ? handleRequestReset : handleResetPassword}>
          <h2>Reset Password</h2>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.message}>{message}</p>}

          {isResetRequest ? (
            <>
              <div className={styles.field}>
                <label>Account Type:</label>
                <select value={accountType} onChange={e => setAccountType(e.target.value)}>
                  <option value="user">User</option>
                  <option value="partner">Partner</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
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
                <label>Reset Token:</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
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
            </>
          )}

          <button type="submit">{isResetRequest ? 'Send Reset Link' : 'Reset Password'}</button>

          {isResetRequest && (
            <p>
              <span
                className={styles.forgotPasswordLink}
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

export default PasswordReset;