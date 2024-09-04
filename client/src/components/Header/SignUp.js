import React, { useState, useEffect } from 'react';
import config from '../../config';
import './LoginSignUp.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthComponent = ({ showModal, toggleModal }) => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = localStorage.getItem('token');
        return token !== null;
    });

    useEffect(() => {
        // Show modal if the user is not authenticated
        if (!isAuthenticated) {
            toggleModal(true);
        }
    }, [isAuthenticated, toggleModal]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const names = isSignUp ? document.getElementById('names').value.trim() : undefined;
        const email = isSignUp ? document.getElementById('email').value.trim() : undefined;
        const phoneNumber = isSignUp ? document.getElementById('phoneNumber').value.trim() : undefined;
        const password = document.getElementById('password').value.trim();
        const confirmPassword = isSignUp ? document.getElementById('confirm-password').value.trim() : undefined;

        if (isSignUp && password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const body = { username, password };
        if (isSignUp) {
            body.names = names;
            body.email = email;
            body.phoneNumber = phoneNumber;
            body.confirmPassword = confirmPassword;
        }

        const endpoint = isSignUp ? `${config.backendUrl}/api/auth/signup` : `${config.backendUrl}/api/auth/login`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();

            if (data.success) {
                alert('Authentication successful');
                if (!isSignUp) {
                    localStorage.setItem('token', data.token);
                    setIsAuthenticated(true);
                    toggleModal(false); // Close the modal
                    navigate('/'); // Navigate to the landing page
                } else {
                    toggleModal(false); // Close the modal on successful signup
                }
            } else {
                alert('Authentication failed: ' + data.message);
            }
        } catch (error) {
            alert('An error occurred: ' + error.message);
        }
    };

    const toggleAuthMode = (event) => {
        event.preventDefault();
        setIsSignUp(!isSignUp);
    };

    return (
        <div>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={toggleModal}>&times;</span>
                        <form id="auth-form" onSubmit={handleSubmit}>
                            <h2 id="auth-title">{isSignUp ? 'Sign Up' : 'Log In'}</h2>
                            <div className="form-group">
                                <label htmlFor="username">Username:</label>
                                <input type="text" id="username" name="username" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password:</label>
                                <input type="password" id="password" name="password" required />
                            </div>
                            {isSignUp && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="names">Full Name:</label>
                                        <input type="text" id="names" name="names" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email:</label>
                                        <input type="email" id="email" name="email" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phoneNumber">Phone Number:</label>
                                        <input type="tel" id="phoneNumber" name="phoneNumber" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="confirm-password">Confirm Password:</label>
                                        <input type="password" id="confirm-password" name="confirm-password" />
                                    </div>
                                </>
                            )}
                            <div className="form-group">
                                <button type="submit" id="auth-submit">{isSignUp ? 'Sign Up' : 'Log In'}</button>
                            </div>
                            <div className="form-group">
                                <button type="button" id="google-login">Login with Google</button>
                                <button type="button" id="facebook-login">Login with Facebook</button>
                                <button type="button" id="tiktok-login">Login with TikTok</button>
                            </div>
                            <p id="toggle-message">Don't have an account? <a href="#" id="toggle-link" onClick={toggleAuthMode}>{isSignUp ? 'Log In' : 'Sign Up'}</a></p>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthComponent;


