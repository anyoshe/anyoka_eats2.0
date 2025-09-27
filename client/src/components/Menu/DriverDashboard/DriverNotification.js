import React, { useEffect, useState, useContext, useRef } from 'react';
import { DriverContext } from '../../../contexts/DriverContext';
import { io } from 'socket.io-client';
import config from '../../../config';
import { playNotificationSound } from '../../utils/notifications';
import styles from './DriverNotification.module.css';

let socket;

const DriverNotification = ({ onView, onClose }) => {
  const { driver } = useContext(DriverContext);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Detect click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  // Enable audio playback only after user interaction
  useEffect(() => {
    const enableAudioPlayback = () => {
      window.__audioAllowed = true;
      document.removeEventListener('click', enableAudioPlayback);
    };
    document.addEventListener('click', enableAudioPlayback);
  }, []);

  // Fetch notifications + setup socket
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${config.backendUrl}/api/driver-notifications/${driver._id}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
      }
    };

    fetchNotifications();

    if (!driver?._id) return;

    socket = io(config.backendUrl, { transports: ['websocket'] });
    socket.emit('joinDriverRoom', driver._id);

    socket.on('newOrderAvailable', (data) => {
      if (window.__audioAllowed) {
        playNotificationSound();
      }
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [driver]);

  return (
    <div ref={dropdownRef} className={styles.notificationDropdown}>
      <h4>Pickup Notifications</h4>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul className={styles.notificationList}>
          {notifications.map((note, index) => (
            <li key={index} className={styles.notificationItem}>
              <div>
                <strong>{note.shops?.map((shop) => shop.shopName).join(', ')}</strong>{' '}
                has an order ready for pickup!
              </div>
              <div>
                <button
                  onClick={() => onView(note.orderId)}
                  className={styles.viewBtn}
                >
                  View Order
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DriverNotification;
