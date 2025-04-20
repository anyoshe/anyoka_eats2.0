// components/AuthPromptModal.js
import React from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import './AuthPromptModal.css'; // Ensure this CSS file is created for styling

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
      className="auth-prompt-modal"
      overlayClassName="auth-prompt-overlay"
    >
      <div className="auth-prompt-content">
        <h2>Please Log In or Sign Up</h2>
        <p>You need to be logged in to perform this action.</p>
        <div className="auth-prompt-buttons">
          <button onClick={handleLogin} className="auth-button login-button">
            Log In
          </button>
          <button onClick={handleSignup} className="auth-button signup-button">
            Sign Up
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AuthPromptModal;
