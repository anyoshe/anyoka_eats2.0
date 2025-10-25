import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import config from '../../config';
import styles from './Login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const UserLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { setIsLoggedIn, setUser, redirectPath, setRedirectPath, setToken } = useContext(AuthContext);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${config.backendUrl}/api/user/login`, { identifier, password });
      const { token, role } = res.data;

      if (role !== 'user') {
        setError('Invalid credentials for user account.');
        return;
      }

      // ✅ Store user token separately
      localStorage.setItem('userToken', token);
      setToken(token);

      // Fetch user details
      const userRes = await axios.get(`${config.backendUrl}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = userRes.data;

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);

      const targetPath = redirectPath || '/';
      setRedirectPath('/');
      navigate(targetPath);

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.loginBackDiv}>
      <div className={styles.backButton} onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {loading ? <div className={styles.skeletonHeader} /> : <h2>User Login</h2>}
        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <div className={styles.skeletonField} />
        ) : (
          <div className={styles.field}>
            <label>Username / Phone Number:</label>
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
          Forgot your password? <a href="/user/reset-password">Reset it here</a>
        </p>
      </form>
    </div>
  );
};

export default UserLogin;
