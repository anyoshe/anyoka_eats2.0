import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { PartnerContext } from '../../contexts/PartnerContext';
import config from '../../config';
import styles from './Login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const PartnerLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { setToken } = useContext(AuthContext);
  const { setPartner, updatePartnerDetails } = useContext(PartnerContext);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);


const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const res = await axios.post(`${config.backendUrl}/api/partner/login`, { identifier, password });
    const { token, role } = res.data;

    if (role !== 'partner') {
      setError('Invalid credentials for partner account.');
      return;
    }

    // ✅ Store token securely
    localStorage.setItem('partnerToken', token);
    setToken(token);

    // ✅ Fetch partner details
    const partnerRes = await axios.get(`${config.backendUrl}/api/partner`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const partnerData = partnerRes.data;

    localStorage.setItem('partnerDetails', JSON.stringify(partnerData));
    setPartner(partnerData);
    updatePartnerDetails(partnerData);

    // 🎉 Warm business welcome
    await Swal.fire({
      title: `Welcome back, ${partnerData.businessName}! 🧡`,
      html: `
        <p>We're glad to have your business back on <strong>Anyoka</strong>.</p>
        <p>Check your dashboard for the latest orders, insights, and updates.</p>
        <p>Let’s grow together and keep customers happy!</p>
      `,
      icon: 'success',
      confirmButtonColor: '#ff6b00',
      confirmButtonText: 'Go to Dashboard 🚀',
    });

    // ✅ Navigate to dashboard or admin panel
    navigate(partnerData.role === 'admin' ? '/superuserdashboard' : '/dashboard');

  } catch (err) {
    Swal.fire({
      title: 'Login Failed',
      text: err.response?.data?.message || 'Please check your credentials and try again.',
      icon: 'error',
      confirmButtonColor: '#ff6b00',
    });
  }
};


  return (
    <div className={styles.loginBackDiv}>
      <div className={styles.backButton} onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {loading ? <div className={styles.skeletonHeader} /> : <h2>Partner Login</h2>}
        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <div className={styles.skeletonField} />
        ) : (
          <div className={styles.field}>
            <label>Business Name / Phone Number:</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
        )}

        {loading ? (
          <div className={styles.skeletonField} />
        ) : (
          <div className={styles.field}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        {loading ? (
          <div className={styles.skeletonButton} />
        ) : (
          <button type="submit">Login</button>
        )}

        <p className={styles.forgotPassword}>
          Forgot your password? <a href="/partner/reset-password">Reset it here</a>
        </p>
      </form>
    </div>
  );
};

export default PartnerLogin;
