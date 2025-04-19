import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SignUpSignIn.module.css';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function SignUpSignIn() {
    const [formData, setFormData] = useState({
        OfficialNames: '',
        IDNumber: '',
        DriverLicenceNumber: '',
        NumberPlate: '',
        password: '',
        ConfirmPassword: '',
        loginPassword: '', // For login
    });
    const [resetEmail, setResetEmail] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // For showing/hiding password
    const [showLoginPassword, setShowLoginPassword] = useState(false); // For login password field

    const navigate = useNavigate();

    const toggleShowPassword = () => setShowPassword(prev => !prev);
    const toggleShowLoginPassword = () => setShowLoginPassword(prev => !prev);

    useEffect(() => {
        // Check if a token exists and fetch the driver data
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`${config.backendUrl}/api/driver`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                // Store the driver ID in local storage for future use
                localStorage.setItem('driverId', response.data._id);
                navigate('/DriverDashboard');
            })
            .catch(error => {
                console.error('Error fetching driver data:', error);
            });
        }
    }, [navigate]);

//     // Function to update form data on input change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmitSignUp = async (event) => {
        event.preventDefault();
        console.log('Submitting sign-up with data:', formData); // Log form data before submission
    
        try {
            const response = await axios.post(`${config.backendUrl}/api/driverSignup`, {
                OfficialNames: formData.OfficialNames,
                IDNumber: formData.IDNumber,
                DriverLicenceNumber: formData.DriverLicenceNumber,
                NumberPlate: formData.NumberPlate,
                password: formData.password,
            });
    
            console.log('Sign-up response:', response.data); // Log the response
            const driverData = response.data;
    
            // Store the driver ID in local storage for future use
            localStorage.setItem('driverId', driverData._id);  // Ensure _id is being set correctly
    
            alert("Sign up Successful, Welcome!");
            navigate('/DriverDashboard');
        } catch (error) {
            console.error('Error signing up:', error); // Log error details
            alert(error.response?.data?.message || "An unexpected error occurred. Please try again.");
        }
    };
    

    const handleSubmitSignIn = async (event) => {
        event.preventDefault();
        try {
            const loginResponse = await axios.post(`${config.backendUrl}/api/driverLogin`, {
                IDNumber: formData.IDNumber,
                password: formData.loginPassword,
            });
    
            const token = loginResponse.data.token;
            if (token) {
                localStorage.setItem('authToken', token);
                const driverResponse = await axios.get(`${config.backendUrl}/api/driver`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
    
                // Store the driver ID in local storage
                localStorage.setItem('driverId', driverResponse.data._id);
                console.log('Driver ID set in local storage:', driverResponse.data._id);
                navigate('/DriverDashboard');
            } else {
                throw new Error('Token not received');
            }
        } catch (error) {
            console.error('Error signing in:', error);
            alert("An error occurred during sign-in. Please try again.");
        }
    };
    
    // const handleForgotPasswordSubmit = async () => {
    //     try {
    //         await axios.post(`${config.backendUrl}/api/driverForgotPassword`, { email: resetEmail });
    //         alert("Password reset email sent. Please check your inbox.");
    //         setIsForgotPasswordModalOpen(false);
    //     } catch (error) {
    //         console.error('Error sending reset email:', error);
    //         alert("Error sending password reset email. Please try again.");
    //     }
    // };
    
    const handleForgotPasswordSubmit = async () => {
        try {
            await axios.post(`${config.backendUrl}/api/driverForgotPassword`, { email: resetEmail, idNumber });
            alert("Password reset email sent. Please check your inbox.");
            setIsForgotPasswordModalOpen(false);
        } catch (error) {
            console.error('Error sending reset email:', error);
            alert("Error sending password reset email. Please try again.");
        }
    };
    
    // Function to toggle the form panel
    const handleToggle = () => {
        document.getElementById('container').classList.toggle('right-panel-active');
    };

    return (
        <div className='authForm'>
            <img src="https://i.imgur.com/wcGWHvx.png" className="square" alt="" />

            <div className="container" id="container">

                {/* Sign Up Section */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSubmitSignUp}>
                        
                        <h1 className='createAccount'>Create Account</h1>

                        <div className="social-container">
                            <a href="#" className="log_social_icons"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="log_social_icons"><i className="fab fa-google-plus-g"></i></a>
                            <a href="#" className="log_social_icons"><i className="fab fa-linkedin-in"></i></a>
                        </div>

                        <span>or use your email for registration</span>

                        {/* Official Names */}
                        <div className="infield">
                            <input 
                                className='input-sign'
                                type="text"
                                placeholder="Official Names"
                                name="OfficialNames"
                                value={formData.OfficialNames}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* ID Number */}
                        <div className="infield">
                            <input
                                className='input-sign'
                                type="number"
                                placeholder="ID Number"
                                name="IDNumber"
                                value={formData.IDNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Driver Licence Number */}
                        <div className="infield">
                            <input
                                className='input-sign'
                                type="text"
                                placeholder="Driver Licence Number"
                                name="DriverLicenceNumber"
                                value={formData.DriverLicenceNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Number Plate */}
                        <div className="infield">
                            <input
                                className='input-sign'
                                type="text"
                                placeholder="Number Plate"
                                name="NumberPlate"
                                value={formData.NumberPlate}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Password */}
                        <div className="infield">
                            <input
                                className='input-sign'
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />

                            <button type="button" onClick={toggleShowPassword} className="eye-button">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="infield">
                            <input
                                className='input-sign'
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                name="ConfirmPassword"
                                value={formData.ConfirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        
                            <button type="button" onClick={toggleShowPassword} className="eye-button">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <button className='loginBtn logphone' type="submit">Sign Up</button>
                    </form>
                </div>

                {/* Sign In Section */}
                <div className="form-container sign-in-container">
                     <form onSubmit={handleSubmitSignIn}>
                        <h1 className='logIn_h1'>Log in</h1>

                        <div className="social-container">
                            <a href="#" className="log_social_icons"><i className="fab fa-facebook-f"></i></a>
                             <a href="#" className="log_social_icons"><i className="fab fa-google-plus-g"></i></a>
                            <a href="#" className="log_social_icons"><i className="fab fa-linkedin-in"></i></a>
                        </div>

                        <span>or use your account</span>

                        {/* ID Number */}
                         <div className="infield">
                            <input
                                className='input-sign'
                                type="number"
                                placeholder="ID Number"
                                name="IDNumber"
                                value={formData.IDNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="infield">
                            <input
                                className='input-sign'
                                type={showLoginPassword ? "text" : "password"}
                                placeholder="Password"
                                name="loginPassword"
                                value={formData.loginPassword}
                                onChange={handleInputChange}
                                required
                            />
                            <button type="button" onClick={toggleShowLoginPassword} className="eye-button">
                                {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                       
                        <a href="#" className="forgot" onClick={() => setIsForgotPasswordModalOpen(true)}>
                             Forgot your password?
                        </a>

                        <button className='loginBtn' type="submit">Log In</button>
                    </form>
                </div>

                {/* {isForgotPasswordModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Reset Password</h2>
                        <p>Enter your email to receive password reset instructions:</p>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                        />
                        <button onClick={handleForgotPasswordSubmit}>Submit</button>
                        <button onClick={() => setIsForgotPasswordModalOpen(false)}>Close</button>
                    </div>
                </div>
            )} */}

{isForgotPasswordModalOpen && (
            <div className="modal">
                <div className="modal-content driverReset">

                    <h2 className='driverHead'>Reset Password</h2>

                    <p className='diverMessage'>Enter your email and ID Number to receive password reset instructions:</p>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        className='diverResetInput'
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Enter your ID Number"
                        className='diverResetInput'
                        value={idNumber} // Use the IDNumber state
                        onChange={(e) => setIdNumber(e.target.value)} // Update state on change
                        required
                    />
                   <div className='driverResetButton'> 
                    <button onClick={handleForgotPasswordSubmit} className='driverResetBtn'>Submit</button>
                    <button onClick={() => setIsForgotPasswordModalOpen(false)} className='driverResetBtn'>Close</button>
                   </div>
                </div>
            </div>
        )}

                {/* Overlay Messages */}
                <div className="overlay-container" id="overlayCon">
                    <div className="overlay">

                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your Account info</p>
                            <button className="signBtn btnScaled loginBtn" onClick={handleToggle}>Log In</button>
                        </div>

                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your Account details and start journey with us</p>
                            <button id="signUpBtn" className="signBtn btnScaled loginBtn" onClick={handleToggle}>Sign Up</button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default SignUpSignIn;
