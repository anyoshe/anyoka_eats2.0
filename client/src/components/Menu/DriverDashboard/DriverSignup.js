// import { useContext, useState } from 'react';
// import { DriverContext } from '../../../contexts/DriverContext';
// import styles from './DriverSignup.module.css';

// const DriverSignup = () => {
//   const { signupDriver } = useContext(DriverContext);

//   const [formData, setFormData] = useState({
//     username: '',
//     phoneNumber: '',
//     email: '',
//     password: '',
//     nationalId: '',
//     driverLicenseNumber: '',
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     const result = await signupDriver(formData);

//     if (result.success) {
//       setSuccess('Driver signed up successfully!');
//     } else {
//       setError(result.message || 'Signup failed');
//     }
//   };

//   return (
//     <div className={styles.signupContainer}>
//       <h1 className={styles.signupTitle}>Driver Signup</h1>
//       <form onSubmit={handleSubmit} className={styles.signupForm}>
//         {['username', 'phoneNumber', 'email', 'password', 'nationalId', 'driverLicenseNumber'].map(field => (
//           <div key={field} className={styles.formGroup}>
//             <label>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
//             <input
//               type={field.includes('password') ? 'password' : 'text'}
//               name={field}
//               value={formData[field]}
//               onChange={handleChange}
//               required={field !== 'email'} // email is optional
//             />
//           </div>
//         ))}

//         <button type="submit" className={styles.submitButton}>Sign Up</button>

//         {error && <div className={styles.errorMessage}>{error}</div>}
//         {success && <div className={styles.successMessage}>{success}</div>}
//       </form>
//     </div>
//   );
// };

// export default DriverSignup;

import { useContext, useState } from 'react';
import { DriverContext } from '../../../contexts/DriverContext';
import styles from './DriverSignup.module.css';

const DriverSignup = () => {
  const { signupDriver, loginDriver } = useContext(DriverContext);

  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    email: '',
    password: '',
    nationalId: '',
    driverLicenseNumber: '',
  });

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLogin, setIsLogin] = useState(false);  // Toggle between login and signup form
  const [showModal, setShowModal] = useState(false);  // For showing the login modal

  const handleChange = (e, isLoginForm = false) => {
    const targetData = isLoginForm ? setLoginData : setFormData;
    targetData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      const result = await loginDriver(loginData);
      if (result.success) {
        setSuccess('Logged in successfully!');
      } else {
        setError(result.message || 'Login failed');
      }
    } else {
      const result = await signupDriver(formData);
      if (result.success) {
        setSuccess('Driver signed up successfully!');
      } else {
        setError(result.message || 'Signup failed');
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);  // Toggle between login and signup form
    setError('');
    setSuccess('');
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className={styles.signupContainer}>
      <h1 className={styles.signupTitle}>{isLogin ? 'Driver Login' : 'Driver Signup'}</h1>
      <form onSubmit={handleSubmit} className={styles.signupForm}>
        {isLogin ? (
          <>
            <div className={styles.formGroup}>
              <label>Username / Phone Number</label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={(e) => handleChange(e, true)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={(e) => handleChange(e, true)}
                required
              />
            </div>
          </>
        ) : (
          ['username', 'phoneNumber', 'email', 'password', 'nationalId', 'driverLicenseNumber'].map(field => (
            <div key={field} className={styles.formGroup}>
              <label>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
              <input
                type={field.includes('password') ? 'password' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required={field !== 'email'} // email is optional
              />
            </div>
          ))
        )}

        <button type="submit" className={styles.submitButton}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
      </form>

      <div className={styles.switchForm}>
        {isLogin ? (
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={toggleForm} className={styles.toggleButton}>
              Sign Up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button type="button" onClick={toggleForm} className={styles.toggleButton}>
              Login
            </button>
          </p>
        )}
      </div>

      {/* Login Modal */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.closeModal} onClick={closeModal}>&times;</span>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Username / Phone Number</label>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={(e) => handleChange(e, true)}
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Login
              </button>

              {error && <div className={styles.errorMessage}>{error}</div>}
              {success && <div className={styles.successMessage}>{success}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverSignup;
