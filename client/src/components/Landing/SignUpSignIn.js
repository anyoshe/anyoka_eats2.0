import React, { useState, useContext } from 'react';
import axios from 'axios';
import './SignUpSignIn.css';
import { useNavigate } from 'react-router-dom';
import { PartnerContext } from '../../contexts/PartnerContext';
import config from '../../config';


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

    const navigate = useNavigate();
    const { setPartner } = useContext(PartnerContext);

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
            
            console.log('Sign Up now Response:', response);
            // Directly use the response data as the partner data
            const partnerData = response.data;
            setPartner(partnerData);
            // alert("Sign up Successful, Welcome!");
            navigate('/dashboard');
        } catch (error) {
            console.error('Error signing up:', error);
            if (error.response && error.response.status === 400) {
                alert(error.response.data);
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
        }
    };

    // Function to handle sign-in submission
    const handleSubmitSignIn = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${config.backendUrl}/api/login`, {
                contactNumber: formData.contactNumber,
                password: formData.loginPassword,
            });
            console.log('Log in Response now:', response);
            // Set the partner context with the response data
            // Extract the partner data from the response
            const partnerData = response.data;

             // Update the partner state with the extracted data
            setPartner(partnerData);
            // setPartner(response.data.partner);
            // alert("Log in Successful, Welcome back!");
            navigate('/dashboard');
        } catch (error) {
            console.error('Error signing in:', error);
            alert("Incorrect Credentials!");
        }
    };

    // Function to toggle the form panel
    const handleToggle = () => {
        document.getElementById('container').classList.toggle('right-panel-active');
    };

    return (
        <div className='authForm'>
            <span className="big-circle">
                <span className="inner-circle"></span>
            </span>

            <img src="https://i.imgur.com/wcGWHvx.png" className="square" alt="" />

            <div className="container" id="container">

                {/* Sign Up Section */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSubmitSignUp}>
                        <h1>Create Account</h1>

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
                                placeholder="Business Name"
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
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <button className='loginBtn' type="submit">Sign Up</button>
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
                                placeholder="Business Name"
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
                                type="password"
                                placeholder="Password"
                                name="loginPassword"
                                value={formData.loginPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <a href="#" className="forgot">Forgot your password ?</a>

                        <button className='loginBtn' type="submit">Log In</button>
                    </form>
                </div>

                {/* Overlay Messages */}
                <div className="overlay-container" id="overlayCon">
                    <div className="overlay">

                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p  className='sign-message'>To keep connected with us please login with your Account info</p>
                            <button className="signBtn btnScaled loginBtn" onClick={handleToggle}>Log In</button>
                        </div>

                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p className='sign-message'>Enter your Account details and start journey with us</p>
                            <button id="signUpBtn" className="signBtn btnScaled loginBtn" onClick={handleToggle}>Sign Up</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUpSignIn;
