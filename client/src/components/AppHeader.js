import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AppHeader.module.css';
import { AuthContext } from '../contexts/AuthContext';

const AppHeader = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        <button className={styles.logoButton} onClick={() => navigate('/')} aria-label="Go to home">
          <span className={styles.logoDot} />
          <span className={styles.logoText}>Anyoka Eats</span>
        </button>

        <nav className={styles.nav} aria-label="Primary">
          <Link to="/menu" className={styles.navLink}>Browse</Link>
          <Link to="/offers" className={styles.navLink}>Offers</Link>
          <Link to="/featured" className={styles.navLink}>Featured</Link>
          {isLoggedIn ? (
            <Link to="/dashboard" className={styles.cta}>Account</Link>
          ) : (
            <Link to="/sign-in" className={styles.cta}>Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;


