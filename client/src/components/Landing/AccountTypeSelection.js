import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStore, faTruck, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import styles from './AccountTypeSelection.module.css';

const AccountTypeSelection = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleAccountTypeSelect = (accountType) => {
    switch (accountType) {
      case 'customer':
        navigate('/sign-in');
        break;
      case 'vendor':
        navigate('/sign-in');
        break;
      case 'driver':
        navigate('/driver-login');
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.selectionContainer}>
      <div className={styles.backButton} onClick={() => navigate('/', { replace: true })}>
        <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back
      </div>

      <div className={styles.selectionContent}>
        {loading && (
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonSubtitle} />
            <div className={styles.skeletonCards}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineShort} />
                  <div className={styles.skeletonBtn} />
                </div>
              ))}
            </div>
          </div>
        )}
        <h1 className={styles.title}>Choose Your Account Type</h1>
        <p className={styles.subtitle}>Select the type of account you want to log into</p>

        <div className={styles.accountTypes}>
          <div className={styles.accountTypeCard}>
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faUser} className={styles.accountIcon} />
            </div>
            <h3 className={styles.accountTitle}>Customer</h3>
            <p className={styles.accountDescription}>
              I want to browse and order products from local vendors
            </p>
            <button 
              className={styles.selectButton}
              onClick={() => handleAccountTypeSelect('customer')}
            >
              Login as Customer
            </button>
            <div className={styles.signupLink}>
              <p>Don't have an account yet? <a href="/signup">Sign up here</a></p>
            </div>
          </div>

          <div className={styles.accountTypeCard}>
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faStore} className={styles.accountIcon} />
            </div>
            <h3 className={styles.accountTitle}>Vendor</h3>
            <p className={styles.accountDescription}>
              I own a business and want to sell products on the platform
            </p>
            <button 
              className={styles.selectButton}
              onClick={() => handleAccountTypeSelect('vendor')}
            >
              Login as Vendor
            </button>
            <div className={styles.signupLink}>
              <p>Don't have an account yet? <a href="/sign-up-sign-in">Sign up here</a></p>
            </div>
          </div>

          <div className={styles.accountTypeCard}>
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faTruck} className={styles.accountIcon} />
            </div>
            <h3 className={styles.accountTitle}>Driver</h3>
            <p className={styles.accountDescription}>
              I want to deliver orders and earn money
            </p>
            <button 
              className={styles.selectButton}
              onClick={() => handleAccountTypeSelect('driver')}
            >
              Login as Driver
            </button>
            <div className={styles.signupLink}>
              <p>Don't have an account yet? <a href="/driver-signup">Sign up here</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSelection;
