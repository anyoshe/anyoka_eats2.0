import React, { createContext, useState, useEffect, useRef, useMemo } from 'react';
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
  const notifiedIds = useRef(new Set());
  const audioEnabledRef = useRef(false); 


  useEffect(() => {
  const enableAudioPlayback = () => {
    audioEnabledRef.current = true;
    document.removeEventListener('click', enableAudioPlayback);
  };
  document.addEventListener('click', enableAudioPlayback);

  try {
    const storedPartnerRaw = localStorage.getItem('partnerDetails');
    const storedToken = localStorage.getItem('partnerToken');

    if (storedPartnerRaw && storedPartnerRaw !== 'undefined') {
      const storedPartner = JSON.parse(storedPartnerRaw);
      if (storedPartner && storedToken) {
        setPartner(storedPartner);
        setToken(storedToken);
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored partner details:', err);
    localStorage.removeItem('partnerDetails');
  }
}, []);



  useEffect(() => {
    if (partner && partner._id) {
      const timeout = setTimeout(() => {
        fetchNotifications();
      }, 1000); // 1 second delay to wait for click
  
      const newSocket = io(config.backendUrl, {
        auth: { token },
      });
  
      setSocket(newSocket);
  
      newSocket.emit('joinPartnerRoom', partner._id);
  
      newSocket.on('newSubOrder', (data) => {
        if (audioEnabledRef.current) {
          playNotificationSound();
        }
        showBrowserNotification(data);
        addNotification({ ...data, read: false, timestamp: new Date().toISOString() });
      });
  
      return () => {
        clearTimeout(timeout);
        newSocket.disconnect();
      };
    }
  }, [partner, token]);
  
  
  const fetchNotifications = async () => {
    if (!partner?._id) return;
  
    try {
      const res = await fetch(`${config.backendUrl}/api/partner-notifications/${partner._id}`);
      const data = await res.json();
  
      const now = new Date();
  
      const normalized = data.map((n) => {
        const timestamp = new Date(n.timestamp);
        const isRead = n.read ?? n.isRead ?? false;
        const isRecent = now - timestamp < 4 * 60 * 60 * 1000; // 4 hours
        const isNew = !isRead && isRecent && !notifiedIds.current.has(n._id);
  
        if (isNew) {
          if (audioEnabledRef.current) {
            playNotificationSound();
          }
          showBrowserNotification(n);
          notifiedIds.current.add(n._id);
        }
  
        return {
          ...n,
          read: isRead,
        };
      });
  
      setNotifications(normalized);
    } catch (err) {
    }
  };
  
  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);


  // Mark a notification as read
  const markNotificationAsRead = async (notifId) => {
    try {
      const res = await fetch(`${config.backendUrl}/api/partner-notifications/${notifId}/read`, {
        method: 'PATCH',
      });
      const updated = await res.json();

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notifId ? { ...n, read: true } : n
        )
      );
      
    } catch (err) {
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
    }
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
        unreadCount,
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
