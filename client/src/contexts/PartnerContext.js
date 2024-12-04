// import React, { createContext, useState, useEffect } from 'react';
// import config from '../config';

// export const PartnerContext = createContext();

// export const PartnerProvider = ({ children }) => {
//     const [partner, setPartner] = useState({
//         businessName: '',
//         businessType: '',
//         contactNumber: '',
//         email: '',
//         location: '',
//         userName: '',
//     });
//     const [contact, setContact] = useState({
//         email: ['', '', '', ''],
//         phoneNumbers: ['', '', '', ''],
//         faxNumbers: ['', '', '', '']
//     });

//     const updatePartnerDetails = (updatedDetails) => {
//         setPartner(prevPartner => ({
//             ...prevPartner,
//             ...updatedDetails
//         }));
//     };
//     const updateContactDetails = async (updatedContact) => {
//         try {
//             const formattedContact = {
//                 email: (updatedContact.email || []).map(email => email.trim()),           // Ensure it's an array
//                 phoneNumbers: (updatedContact.phoneNumbers || []).map(phone => phone.trim()), // Ensure it's an array
//                 faxNumbers: (updatedContact.faxNumbers || []).map(fax => fax.trim())        // Ensure it's an array
//             };
    
//             const response = await fetch(`${config.backendUrl}/api/contacts/${partner._id}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formattedContact),
//             });
    
//             if (!response.ok) {
//                 throw new Error('Failed to update contact details');
//             }
    
//             const updatedContactFromServer = await response.json();
//             setContact(updatedContactFromServer);
//         } catch (error) {
//             console.error('Error updating contact:', error);
//         }
//     };
    
    
//     useEffect(() => {
//         const storedPartner = JSON.parse(localStorage.getItem('partnerDetails'));
//         if (storedPartner) {
//           setPartner(storedPartner);
//         }
//         const storedContact = JSON.parse(localStorage.getItem('contactDetails'));
//         if (storedContact) {
//           setContact(storedContact);
//         }
//     }, []);

//     return (
//         <PartnerContext.Provider value={{ partner, setPartner, contact, setContact, updatePartnerDetails, updateContactDetails }}>
//             {children}
//         </PartnerContext.Provider>
//     );
// };

import React, { createContext, useState, useEffect } from 'react';
import config from '../config'; // Ensure config has `backendUrl`
import io from 'socket.io-client';

export const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
    const [partner, setPartner] = useState({
        businessName: '',
        businessType: '',
        contactNumber: '',
        email: '',
        location: '',
        userName: '',
    });

    const [contact, setContact] = useState({
        email: ['', '', '', ''],
        phoneNumbers: ['', '', '', ''],
        faxNumbers: ['', '', '', '']
    });

    const [socket, setSocket] = useState(null);

    // Update partner details
    const updatePartnerDetails = (updatedDetails) => {
        setPartner(prevPartner => ({
            ...prevPartner,
            ...updatedDetails
        }));
    };

    // Update contact details
    const updateContactDetails = async (updatedContact) => {
        try {
            const formattedContact = {
                email: (updatedContact.email || []).map(email => email.trim()),           // Ensure it's an array
                phoneNumbers: (updatedContact.phoneNumbers || []).map(phone => phone.trim()), // Ensure it's an array
                faxNumbers: (updatedContact.faxNumbers || []).map(fax => fax.trim())        // Ensure it's an array
            };

            const response = await fetch(`${config.backendUrl}/api/contacts/${partner._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedContact),
            });

            if (!response.ok) {
                throw new Error('Failed to update contact details');
            }

            const updatedContactFromServer = await response.json();
            setContact(updatedContactFromServer);
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    // Initialize socket connection and handle events
    useEffect(() => {
        if (partner._id) { // Ensure partner is logged in
            const newSocket = io(config.backendUrl); // Connect to backend URL
            setSocket(newSocket);

            // Register partner ID with the socket server
            newSocket.emit('registerPartner', partner._id);

            // Listen for real-time order notifications
            newSocket.on('newOrder', (data) => {
                console.log('New order notification:', data);
                alert(`New Order: ${data.message}`); // Replace with toast if preferred
            });

            // Clean up the socket connection on unmount
            return () => {
                newSocket.disconnect();
            };
        }
    }, [partner._id]);

    // Save and load partner data from localStorage
    useEffect(() => {
        const storedPartner = JSON.parse(localStorage.getItem('partnerDetails'));
        if (storedPartner) {
            setPartner(storedPartner);
        }
        const storedContact = JSON.parse(localStorage.getItem('contactDetails'));
        if (storedContact) {
            setContact(storedContact);
        }
    }, []);

    return (
        <PartnerContext.Provider value={{
            partner,
            setPartner,
            contact,
            setContact,
            updatePartnerDetails,
            updateContactDetails,
            socket, // Expose socket if needed elsewhere
        }}>
            {children}
        </PartnerContext.Provider>
    );
};
