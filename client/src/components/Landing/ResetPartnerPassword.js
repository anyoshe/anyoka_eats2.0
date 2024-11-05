import React, { useState } from 'react';
import axios from 'axios';
// import { useLocation } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config';
import "./Reset.css"

const ResetPartnerPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const token = new URLSearchParams(location.search).get('token');

    const handlePasswordReset = async (event) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await axios.post(`${config.backendUrl}/api/reset-partner-password`, {
                token,
                newPassword,
            });
            setSuccessMessage(response.data.message);
            navigate('/sign-up-sign-in');
            setErrorMessage('');
        } catch (error) {
            console.error('Error resetting password:', error);
            setErrorMessage("An error occurred. Please try again.");
            setSuccessMessage('');
        }
    };

    return (
        <div>
            <h2>Reset Your Password</h2>
            <form onSubmit={handlePasswordReset}>
                <div>
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
    );
};

export default ResetPartnerPassword;
