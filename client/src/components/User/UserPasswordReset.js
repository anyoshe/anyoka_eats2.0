import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config';
import styles from './Login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const UserPasswordReset = () => {
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

  // Step 1: Request reset link for user
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${config.backendUrl}/api/user/request-reset`, { email });
      setMessage(res.data.message);
      setIsLinkSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    }
  };

  // Step 2: Reset password using token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post(`${config.backendUrl}/api/user/reset-password`, {
        token,
        email,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/user/sign-in', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  const handleCheckEmail = () => {
    const providerUrl = getEmailProviderUrl(email);
    if (providerUrl) window.open(providerUrl, '_blank');
    else window.location.href = 'mailto:';
  };

  return (
    <div className={styles.loginBackDiv}>
      <div className={styles.backButton} onClick={() => navigate('/user/sign-in', { replace: true })}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back to Login
      </div>

      {isLinkSent ? (
        <div className={styles.form}>
          <h2>Reset Password</h2>
          {message && <p className={styles.message}>{message}</p>}
          <p>A reset link has been sent to your email.</p>
          <button onClick={handleCheckEmail}>Check Your Email</button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={isResetRequest ? handleRequestReset : handleResetPassword}>
          <h2>User Password Reset</h2>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.message}>{message}</p>}

          {isResetRequest ? (
            <div className={styles.field}>
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
              <div className={styles.field}>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label>Reset Token:</label>
                <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required />
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
                <label>Confirm Password:</label>
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
              <span className={styles.forgotPasswordLink} onClick={() => setIsResetRequest(false)}>
                Already have a reset token? Enter it here
              </span>
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default UserPasswordReset;
