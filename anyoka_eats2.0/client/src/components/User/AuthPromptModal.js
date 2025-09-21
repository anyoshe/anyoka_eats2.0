import React from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPromptModal.module.css'; // CSS Module import

Modal.setAppElement('#root'); // For accessibility

const AuthPromptModal = ({ isOpen, onRequestClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onRequestClose();
    navigate('/sign-in');
  };

  const handleSignup = () => {
    onRequestClose();
    navigate('/signup');
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Authentication Required"
      className={styles.authPromptModal}
      overlayClassName={styles.authPromptOverlay}
    >
      <div className={styles.authPromptContent}>
        <h2>Please Log In or Sign Up</h2>
        <p>You need to be logged in to perform this action.</p>
        <div className={styles.authPromptButtons}>
          <button onClick={handleLogin} className={`${styles.authButton} ${styles.loginButton}`}>
            Log In
          </button>
          <button onClick={handleSignup} className={`${styles.authButton} ${styles.signupButton}`}>
            Sign Up
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AuthPromptModal;
