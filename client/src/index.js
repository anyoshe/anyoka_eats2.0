import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';

// Remove service worker registration
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.getRegistrations().then((registrations) => {
//     for (let registration of registrations) {
//       registration
//         .unregister()
//         .then(() => {
//           console.log('Service Worker unregistered:', registration);
//         })
//         .catch((error) => {
//           console.error('Service Worker unregistration failed:', error);
//         });
//     }
//   });
// }

// ✅ Register service worker for notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('✅ Service worker registered:', reg);
    }).catch(err => {
      console.error('❌ Service worker registration failed:', err);
    });
  });
}



// Create the root and render the app wrapped with AuthProvider
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Measure performance in your app
reportWebVitals();