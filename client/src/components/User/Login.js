import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { PartnerContext } from '../../contexts/PartnerContext';
import config from '../../config';
import styles from './Login.module.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { setIsLoggedIn, setUser, redirectPath } = useContext(AuthContext);
  const { setPartner, updatePartnerDetails } = useContext(PartnerContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${config.backendUrl}/api/login`, { identifier, password });
      const { token, role } = res.data;

      // Store token
      localStorage.setItem('authToken', token);

      if (role === 'user') {
        // Fetch user details
        const userRes = await axios.get(`${config.backendUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = userRes.data;
        console.log('✅ User data from /me:', userData);
        // Save to localStorage and AuthContext
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        setIsLoggedIn(true);

        // Navigate to previous or home page
        navigate(redirectPath || '/');

      } else if (role === 'partner') {
        // Fetch partner details
        const partnerRes = await axios.get(`${config.backendUrl}/api/partner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const partnerData = partnerRes.data;
        console.log('✅ Partner data from /me:', partnerData);
        // Store and set in PartnerContext
        localStorage.setItem('partnerDetails', JSON.stringify(partnerData));
        setPartner(partnerData);
        updatePartnerDetails(partnerData); // Ensures context stays synced

        // Redirect partner appropriately
        navigate(partnerData.role === 'admin' ? '/superuserdashboard' : '/dashboard');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
  
    <form className={styles.form} onSubmit={handleSubmit}>
  <h2>Login</h2>
  {error && <p className={styles.error}>{error}</p>}
  
  <div className={styles.field}>
    <label>Username / Phone / Business Name:</label>
    <input
      type="text"
      value={identifier}
      onChange={(e) => setIdentifier(e.target.value)}
      required
    />
  </div>
  
  <div className={styles.field}>
    <label>Password:</label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
  </div>
  
  <button type="submit">Login</button>
</form>
  );
};

export default Login;
