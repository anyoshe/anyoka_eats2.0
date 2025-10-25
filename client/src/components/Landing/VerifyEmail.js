import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import styles from './SignUpSignIn.module.css'; // reuse your existing auth styles

const VerifyEmail = () => {
  const { token } = useParams(); // extract token from the URL
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const res = await axios.get(`${config.backendUrl}/api/verify/${token}`);
        alert(res.data.message || 'Account verified successfully!');
        navigate('/sign-in'); // redirect to login after successful verification
      } catch (err) {
        alert(err.response?.data?.message || 'Verification link invalid or expired.');
        navigate('/sign-in');
      }
    };

    if (token) verifyAccount();
  }, [token, navigate]);

  return (
    <section className={styles.signUpContainer}>
      <div className={styles.signUpWrapper}>
        <h2 className={styles.signUpWrapperH2}>Verifying your email...</h2>
        <p className={styles.formDescription}>
          Please wait a moment while we confirm your account.
        </p>
      </div>
    </section>
  );
};

export default VerifyEmail;
