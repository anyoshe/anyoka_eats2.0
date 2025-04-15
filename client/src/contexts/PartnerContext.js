// import React, { createContext, useState, useEffect } from 'react';
// import config from '../config';
// import io from 'socket.io-client';

// export const PartnerContext = createContext();

// export const PartnerProvider = ({ children }) => {
//     const [partner, setPartner] = useState({
//         _id: '',
//         businessName: '',
//         businessType: '',
//         contactNumber: '',
//         email: '',
//         town: '',
//         location: '',
//         password: '',
//         profileImage: '',
//         idNumber: '',
//         businessPermit: '',
//         description: '',
//         role: 'partner',
//     });

//     const [socket, setSocket] = useState(null);

//     // Update partner details
//     const updatePartnerDetails = (updatedDetails) => {
//         setPartner(prevPartner => ({
//             ...prevPartner,
//             ...updatedDetails
//         }));
//         localStorage.setItem('partnerDetails', JSON.stringify({
//             ...partner,
//             ...updatedDetails
//         }));
//     };

//     // Initialize socket connection and handle events
//     useEffect(() => {
//         if (partner._id) {
//             const newSocket = io(config.backendUrl);
//             setSocket(newSocket);

//             newSocket.emit('registerPartner', partner._id);

//             newSocket.on('newOrder', (data) => {
//                 console.log('New order notification:', data);
//                 alert(`New Order: ${data.message}`);
//             });

//             return () => {
//                 newSocket.disconnect();
//             };
//         }
//     }, [partner._id]);

//     // Load partner data from localStorage on mount
//     useEffect(() => {
//         const storedPartner = JSON.parse(localStorage.getItem('partnerDetails'));
//         if (storedPartner) {
//             setPartner(storedPartner);
//         }
//     }, []);

//     return (
//         <PartnerContext.Provider value={{
//             partner,
//             setPartner,
//             updatePartnerDetails,
//             socket,
//         }}>
//             {children}
//         </PartnerContext.Provider>
//     );
// };




import React, { createContext, useState, useEffect } from 'react';
import config from '../config';
import io from 'socket.io-client';

export const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [socket, setSocket] = useState(null);

  // Update partner details
  const updatePartnerDetails = (updatedDetails) => {
    const newPartner = { ...partner, ...updatedDetails };
    setPartner(newPartner);
    localStorage.setItem('partnerDetails', JSON.stringify(newPartner));
  };

  // Load partner data from localStorage on mount
  useEffect(() => {
    const storedPartner = JSON.parse(localStorage.getItem('partnerDetails'));
    if (storedPartner) {
      setPartner(storedPartner);
    }
  }, []);

  // Initialize socket connection and handle events
  useEffect(() => {
    if (partner && partner._id) {
      const newSocket = io(config.backendUrl);
      setSocket(newSocket);

      newSocket.emit('registerPartner', partner._id);

      newSocket.on('newOrder', (data) => {
        console.log('New order notification:', data);
        alert(`New Order: ${data.message}`);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [partner]);

  // Logout function to clear session
  const logout = () => {
    setPartner(null);
    localStorage.removeItem('partnerDetails');
    localStorage.removeItem('authToken');
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <PartnerContext.Provider
      value={{
        partner,
        setPartner,
        updatePartnerDetails,
        socket,
        logout,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};
