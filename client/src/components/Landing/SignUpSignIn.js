import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import './SignUpSignIn.css';
import { useNavigate } from 'react-router-dom';
import { PartnerContext } from '../../contexts/PartnerContext';
import config from '../../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function SignUpSignIn() {
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        contactNumber: '',
        email: '',
        location: '',
        password: '',
        userName: '', // For login
        loginPassword: '', // For login
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const navigate = useNavigate();
    const { setPartner } = useContext(PartnerContext);

    useEffect(() => {
        // Check if a token exists and fetch the partner data
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`${config.backendUrl}/api/partner`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    setPartner(response.data);
                    navigate('/dashboard');
                })
                .catch(error => {
                    console.error('Error fetching partner data:', error);
                });
        }
    }, [navigate, setPartner]);

    // Function to update form data on input change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    // Function to handle sign-up submission
    const handleSubmitSignUp = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${config.backendUrl}/api/signup`, {
                businessName: formData.businessName,
                businessType: formData.businessType,
                contactNumber: formData.contactNumber,
                email: formData.email,
                location: formData.location,
                password: formData.password,
            });

            const partnerData = response.data;
            setPartner(partnerData);
            alert("Sign up Successful, Welcome!");
            navigate('/dashboard');
        } catch (error) {
            console.error('Error signing up:', error);
            alert(error.response?.data || "An unexpected error occurred. Please try again.");
        }
    };

    // Function to handle sign-in submission
    const handleSubmitSignIn = async (event) => {
        event.preventDefault();
        try {
            const loginResponse = await axios.post(`${config.backendUrl}/api/login`, {
                contactNumber: formData.contactNumber,
                password: formData.loginPassword,
            });

            const token = loginResponse.data.token;
            if (token) {
                localStorage.setItem('authToken', token);

                const partnerResponse = await axios.get(`${config.backendUrl}/api/partner`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setPartner(partnerResponse.data);
                navigate('/dashboard');
            } else {
                throw new Error('Token not received');
            }
        } catch (error) {
            console.error('Error signing in:', error);
            alert("An error occurred during sign-in. Please try again.");
        }
    };

    // Function to handle password recovery
    const handlePasswordRecovery = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${config.backendUrl}/api/recover-password`, {
                email: formData.email,
                contactNumber: formData.contactNumber,
            });

            alert("Password recovery link sent to your email!");
            setModalVisible(false);
        } catch (error) {
            console.error('Error in password recovery:', error);
            alert("An error occurred. Please try again.");
        }
    };

    // Function to toggle the form panel
    const handleToggle = () => {
        document.getElementById('container').classList.toggle('right-panel-active');
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleLoginPasswordVisibility = () => setShowLoginPassword(!showLoginPassword);

    return (
        <div className='authForm'>
            <img src="https://i.imgur.com/wcGWHvx.png" className="square" alt="" />

            <div className="container" id="container">

                {/* Sign Up Section */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSubmitSignUp}>
                        <h1 className='createAccount'>Create Account</h1>

                        <div className="social-container">
                            <a href="#" className="log_social_icons" ><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="log_social_icons"><i className="fab fa-google-plus-g"></i></a>
                            <a href="#" className="log_social_icons"><i className="fab fa-linkedin-in"></i></a>
                        </div>

                        <span>or use your email for registration</span>

                        <div className="infield">
                            <input
                                className='input-sign'
                                type="text"
                                placeholder="User Name"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="infield">
                            <input
                                className='input-sign'
                                type="text"
                                placeholder="Type (Hotel, Conference space, Catering e.t.c)"
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="infield">
                            <input
                                className='input-sign'
                                type="text"
                                placeholder="Contact Number"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="infield">
                            <input
                                className='input-sign'
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="infield">
                            <input
                                className='input-sign'
                                type="text"
                                placeholder="Business Location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

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
                        </div>
                            <span onClick={togglePasswordVisibility} id='signBlockEye'>
                                {showPassword ? <i class="fas fa-eye-slash"></i>
                                : <i class="fas fa-eye"></i>
                            }
                            </span>

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

                        <div className="infield">
                            <input
                                className='input-sign'
                                type="text"
                                placeholder="User Name"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="infield">
                            <input
                                className='input-sign'
                                type="text"
                                placeholder="Contact Number"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

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
                        </div>  
                            <span onClick={toggleLoginPasswordVisibility}>
                                {showLoginPassword ? <i class="fas fa-eye-slash" id='blockSee'></i>
                                : <i class="fas fa-eye"></i>}
                            </span>

                        <a href="#" className="forgot" onClick={() => setModalVisible(true)}>Forgot your password?</a>

                        <button className='loginBtn' type="submit">Log In</button>
                    </form>
                </div>

                {/* Overlay Messages */}
                <div className="overlay-container" id="overlayCon">
                    <div className="overlay">

                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>

                            <button className="signBtn btnScaled loginBtn" onClick={handleToggle}>Log In</button>
                            
                        </div>

                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start your journey with us</p>
                            <button id="signUpBtn" className="signBtn btnScaled loginBtn" onClick={handleToggle}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Recovery Modal */}
            {modalVisible && (
                <div className="modal">
                    <div className="modal-content patnerRecovery">
                        <span className="close" id='forgetClose' onClick={() => setModalVisible(false)}>&times;</span>

                        <h2 id='forgetHeading' >Password Recovery</h2>

                        <form onSubmit={handlePasswordRecovery}>
                            <input
                                className='input-sign'
                                type="email"
                                id='forgetEmail'
                                placeholder="Enter your email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                className='input-sign'
                                type="text"
                                 id='forgetNumber'
                                placeholder="Enter your contact number"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                required
                            />
                            <button className='loginBtn' type="submit">Send Recovery Link</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignUpSignIn;
