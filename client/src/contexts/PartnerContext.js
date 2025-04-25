import React, { createContext, useState, useEffect, useMemo } from 'react';
import config from '../config';
import io from 'socket.io-client';
import axios from 'axios';

import { playNotificationSound, showBrowserNotification } from '../components/utils/notifications';

export const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('partnerToken') || null);

  // useEffect(() => {
  //   const fetchMissedNotifications = async () => {
  //     try {
  //       const res = await axios.get(`${config.backendUrl}/api/notifications/unread`);
  //       res.data.forEach(notification => {
  //         addNotification(notification);
  //         playNotificationSound();
  //       });
  //     } catch (err) {
  //       console.error("Error fetching missed notifications:", err);
  //     }
  //   };
  
  //   if (partner) {
  //     fetchMissedNotifications();
  //   }
  // }, [partner]);
  
  
  
  // Fetch notifications for the logged-in partner
const fetchNotifications = async () => {
  if (!partner?._id) return;
  try {
    const res = await fetch(`${config.backendUrl}/api/partner-notifications/${partner._id}`);
    const data = await res.json();
    setNotifications(data);
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
  }
};

// Mark a notification as read
const markNotificationAsRead = async (notifId) => {
  try {
    const res = await fetch(`${config.backendUrl}/api/partner-notifications/${notifId}/read`, {
      method: 'PATCH',
    });
    const updated = await res.json();
    setNotifications((prev) =>
      prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
    );
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
  }
};

// Delete a notification
const deleteNotification = async (notifId) => {
  try {
    await fetch(`${config.backendUrl}/api/partner-notifications/${notifId}`, {
      method: 'DELETE',
    });
    setNotifications((prev) => prev.filter((n) => n._id !== notifId));
  } catch (err) {
    console.error('Failed to delete notification:', err);
  }
};

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const markAsRead = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n === notif ? { ...n, read: true } : n))
    );
  };

  const updatePartnerDetails = (updatedDetails) => {
    const newPartner = { ...partner, ...updatedDetails };
    setPartner(newPartner);
    localStorage.setItem('partnerDetails', JSON.stringify(newPartner));
  };

  useEffect(() => {
    const storedPartner = JSON.parse(localStorage.getItem('partnerDetails'));
    const storedToken = localStorage.getItem('partnerToken');
    if (storedPartner && storedToken) {
      setPartner(storedPartner);
      setToken(storedToken);
    }
  }, []);
  
  useEffect(() => {
    if (partner && partner._id) {
      fetchNotifications();
      const newSocket = io(config.backendUrl, {
        auth: {
          token, // 🛡️ Use partner token when connecting
        },
      });
      setSocket(newSocket);

      newSocket.emit('joinPartnerRoom', partner._id);
      console.log("Joined socket room:", partner._id);

      newSocket.on('newSubOrder', (data) => {
        console.log("🎉 Notification received!", data);

        playNotificationSound();
        showBrowserNotification(data);
        addNotification({ ...data, read: false, timestamp: new Date().toISOString() });
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [partner, token]);

  const logout = () => {
    setPartner(null);
    localStorage.removeItem('partnerDetails');
    localStorage.removeItem('partnerToken'); // 👈 Use the new key here
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setToken(null);

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
        markAsRead,
        markNotificationAsRead,
  deleteNotification,
  fetchNotifications,
        token, // 👈 Expose partnerToken to components if needed
        setToken,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};
