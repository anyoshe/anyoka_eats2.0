import React, { createContext, useState, useEffect } from 'react';
import config from '../config';
import io from 'socket.io-client';
import { playNotificationSound, showBrowserNotification } from '../components/utils/notifications';

export const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);


  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  };
  
  const markAsRead = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n === notif ? { ...n, read: true } : n))
    );
  };
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

      newSocket.emit('joinPartnerRoom', partner._id);
      console.log("Joined socket room:", partner._id);

      newSocket.on('newSubOrder', (data) => {
      console.log("🎉 Notification received!", data);
         
      // Play sound
         playNotificationSound();

         // Show browser notification
         showBrowserNotification(data);
 
         // Save notification in context
         addNotification({ ...data, read: false, timestamp: new Date().toISOString() });

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
        notifications,
        addNotification,
        markAsRead       
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};
