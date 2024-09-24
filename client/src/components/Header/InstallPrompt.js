// import React, { useEffect, useState } from 'react';

// const InstallPrompt = () => {
//   const [deferredPrompt, setDeferredPrompt] = useState(null);
//   const [showInstallButton, setShowInstallButton] = useState(false);

//   useEffect(() => {
//     // Check for first-time visitors
//     if (!localStorage.getItem('hasVisited')) {
//       localStorage.setItem('hasVisited', 'true');
//     }

//     // Event listener for beforeinstallprompt
//     const handleBeforeInstallPrompt = (e) => {
//       e.preventDefault();
//       setDeferredPrompt(e);
//       setShowInstallButton(true);
//     };

//     window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

//     // Cleanup event listener on unmount
//     return () => {
//       window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
//     };
//   }, []);

//   const handleInstallClick = async () => {
//     if (deferredPrompt) {
//       deferredPrompt.prompt();
//       const choiceResult = await deferredPrompt.userChoice;
//       if (choiceResult.outcome === 'accepted') {
//         console.log('User accepted the install prompt');
//       } else {
//         console.log('User dismissed the install prompt');
//       }
//       setDeferredPrompt(null);
//       setShowInstallButton(false);
//     }
//   };

//   return (
//     <>
//       {showInstallButton && (
//         <button onClick={handleInstallClick} className='dishAddToCart dishcontent'>
//           Install App
//         </button>
//       )}
//     </>
//   );
// };

// export default InstallPrompt;

import React, { useEffect, useState } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    if (isInstalled) {
      console.log('App is already installed');
      return; // Exit early if the app is installed
    }

    // Event listener for beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <>
      {showInstallButton && (
        <button onClick={handleInstallClick} className='dishAddToCart dishcontent'>
          Install App
        </button>
      )}
    </>
  );
};

export default InstallPrompt;
