import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config';

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const [token, setToken] = useState('');
    const [formData, setFormData] = useState({ idNumber: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        // Extract token from the query string
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError('Invalid or missing reset token.');
        }
    }, [location.search]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await axios.post(`${config.backendUrl}/api/reset-password`, {
                token,
                idNumber: formData.idNumber, // Include ID number in the request
                newPassword: formData.password,
            });
            alert('Password has been successfully reset');
            navigate('/driverCreateAccount');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="reset-password-form">
            <h2>Reset Password</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="ID Number"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="password"
                    placeholder="New Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
}

export default ResetPassword;
