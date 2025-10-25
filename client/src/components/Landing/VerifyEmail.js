import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import styles from './SignUpSignIn.module.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    let redirectTimer;

    const verifyAccount = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${config.backendUrl}/api/verify/${token}`);

        // 🟢 Only mark as success if server confirms it
        if (res.status === 200) {
          setStatus('success');
          setMessage(res.data.message || '✅ Your account has been verified successfully!');

          // redirect only on success
          redirectTimer = setTimeout(() => {
            navigate('/sign-in');
          }, 2000);
        }
      } catch (err) {
        // 🟥 Only mark as failed when the backend *explicitly* rejects it
        const errMsg = err.response?.data?.message || '❌ Verification link invalid or expired.';
        setStatus('failed');
        setMessage(errMsg);
      }
    };

    verifyAccount();

    // cleanup timer if component unmounts
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [token, navigate]);

  return (
    <section className={styles.signUpContainer}>
      <div className={styles.signUpWrapper}>
        {status === 'verifying' && (
          <>
            <h2 className={styles.signUpWrapperH2}>Verifying your email...</h2>
            <p className={styles.formDescription}>Please wait a moment while we confirm your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className={styles.signUpWrapperH2}>✅ Email Verified!</h2>
            <p className={styles.formDescription}>{message}</p>
            <p className={styles.formDescription}>Redirecting you to login...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <h2 className={styles.signUpWrapperH2}>❌ Verification Failed</h2>
            <p className={styles.formDescription}>{message}</p>
          </>
        )}
      </div>
    </section>
  );
};

export default VerifyEmail;
