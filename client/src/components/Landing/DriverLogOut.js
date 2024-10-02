// import React, { useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { DriverContext } from '../../contexts/DriverContext';  // Adjust based on your context path

// function DriverLogout() {
//     const { setDriver } = useContext(DriverContext);  // Access the driver context
//     const navigate = useNavigate();

//     useEffect(() => {
//         // Logout function to remove the token and clear driver data
//         const logout = () => {
//             // Remove the auth token from localStorage
//             localStorage.removeItem('authToken');

//             // Clear the driver data from context
//             setDriver(null);

//             // Redirect to the login page
//             navigate('/');
//         };

//         logout();  // Call the logout function on component mount
//     }, [setDriver, navigate]);

//     return (
//         <div>
//             <p>Logging out...</p>
//         </div>
//     );
// }

// export default DriverLogout;
