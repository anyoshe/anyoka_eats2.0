import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../../config';
import styles from '../../Landing/SignUpSignIn.module.css';

const DriverVerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    let redirectTimer;

    const verifyDriverAccount = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${config.backendUrl}/api/driver/verify/${token}`);

        // ✅ Only mark success if backend confirms
        if (res.status === 200) {
          setStatus('success');
          setMessage(res.data.message || '✅ Your driver account has been verified successfully!');

          // ✅ Redirect only on success
          redirectTimer = setTimeout(() => {
            navigate('/driver-login');
          }, 2000);
        }
      } catch (err) {
        // ❌ Handle verification failure cleanly
        const errMsg = err.response?.data?.message || '❌ Verification link invalid or expired.';
        setStatus('failed');
        setMessage(errMsg);
      }
    };

    verifyDriverAccount();

    // 🧹 Cleanup redirect timer if component unmounts early
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [token, navigate]);

  return (
    <section className={styles.verifyContainer}>
      <div className={styles.verifyWrapper}>
        {status === 'verifying' && (
          <>
            <h2 className={styles.verifyTitle}>Verifying your email...</h2>
            <p className={styles.verifyMessage}>Please wait a moment while we confirm your driver account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className={styles.verifyTitle}>✅ Email Verified!</h2>
            <p className={styles.verifyMessage}>{message}</p>
            <p className={styles.verifyMessage}>Redirecting you to login...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <h2 className={styles.verifyTitle}>❌ Verification Failed</h2>
            <p className={styles.verifyMessage}>{message}</p>
          </>
        )}
      </div>
    </section>
  );
};

export default DriverVerifyEmail;
