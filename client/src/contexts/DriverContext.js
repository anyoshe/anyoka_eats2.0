import React, { createContext, useState, useEffect } from 'react';
import config from '../config';

export const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
    // State for driver details
    const [driver, setDriver] = useState({
        OfficialNames: '',
        IDNumber: '',
        DriverLicenceNumber: '',
        NumberPlate: '',
        phoneNumber: '',
    });

    // State for contact details (emails, phone numbers, etc.)
    const [contact, setContact] = useState({
        email: ['', '', '', ''],
        phoneNumbers: ['', '', '', ''],
        faxNumbers: ['', '', '', '']
    });

    // Function to update driver details
    const updateDriverDetails = (updatedDetails) => {
        setDriver(prevDriver => ({
            ...prevDriver,
            ...updatedDetails
        }));
    };

    // Function to update contact details
    const updateContactDetails = async (updatedContact) => {
        try {
            const formattedContact = {
                email: (updatedContact.email || []).map(email => email.trim()), // Ensure it's an array
                phoneNumbers: (updatedContact.phoneNumbers || []).map(phone => phone.trim()), // Ensure it's an array
                faxNumbers: (updatedContact.faxNumbers || []).map(fax => fax.trim()) // Ensure it's an array
            };

            const response = await fetch(`${config.backendUrl}/api/contacts/${driver.IDNumber}`, {
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

    // Fetch driver details from localStorage on initial load
    useEffect(() => {
        const storedDriver = JSON.parse(localStorage.getItem('driverDetails'));
        if (storedDriver) {
            setDriver(storedDriver);
        }

        const storedContact = JSON.parse(localStorage.getItem('contactDetails'));
        if (storedContact) {
            setContact(storedContact);
        }
    }, []);

    return (
        <DriverContext.Provider value={{ driver, setDriver, contact, setContact, updateDriverDetails, updateContactDetails }}>
            {children}
        </DriverContext.Provider>
    );
};
