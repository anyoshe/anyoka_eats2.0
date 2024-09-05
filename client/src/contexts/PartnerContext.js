import React, { createContext, useState, useEffect } from 'react';
import config from '../config';

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

    const updatePartnerDetails = (updatedDetails) => {
        setPartner(prevPartner => ({
            ...prevPartner,
            ...updatedDetails
        }));
    };

    const updateContactDetails = async (updatedContact) => {
        try {
            const formattedContact = {
                email: updatedContact.email.map(email => email.trim()),
                phoneNumbers: updatedContact.phoneNumbers.map(phone => phone.trim()),
                faxNumbers: updatedContact.faxNumbers.map(fax => fax.trim())
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
        <PartnerContext.Provider value={{ partner, setPartner, contact, setContact, updatePartnerDetails, updateContactDetails }}>
            {children}
        </PartnerContext.Provider>
    );
};




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
//         restaurants: [],
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
//                 email: updatedContact.email.map(email => email.trim()),
//                 phoneNumbers: updatedContact.phoneNumbers.map(phone => phone.trim()),
//                 faxNumbers: updatedContact.faxNumbers.map(fax => fax.trim())
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
//          // Fetch partner restaurants on mount
//          fetchPartnerRestaurants();
//         }, []);
    
//         const fetchPartnerRestaurants = async () => {
            
//             console.log('Fetching partner restaurants:', `${config.backendUrl}/api/partners/${partner._id}/restaurants`);
//             try {
//               const response = await fetch(`${config.backendUrl}/api/partners/${partner._id}/restaurants`);
             
//               console.log('Response status:', response.status);
//               if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//               }
//               const data = await response.json();
//               console.log('Received data:', data);
//               if (data.errors) {
//                 throw new Error(data.errors.join('\n'));
//               }
//               setPartner(prevPartner => ({
//                 ...prevPartner,
//                 restaurants: data
//               }));
//             } catch (error) {
//               console.error('Error fetching partner restaurants:', error);
//               // Instead of setting an empty array, log the error
//               console.log('Error fetching partner restaurants:', error.message);
//               console.log('Error details:', error.message);
//             }
//           };
          



//     return (
//         <PartnerContext.Provider value={{ partner, setPartner, contact, setContact, updatePartnerDetails, updateContactDetails }}>
//             {children}
//         </PartnerContext.Provider>
//     );
// };