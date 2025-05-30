import React, { useEffect, useState, useContext } from 'react';
import { DriverContext } from '../../../contexts/DriverContext';
import { io } from 'socket.io-client';
import config from '../../../config';
import { playNotificationSound } from '../../utils/notifications'; 
import styles from './DriverNotification.module.css';

let socket;

const DriverNotification = ({ onView }) => {
  const { driver } = useContext(DriverContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const enableAudioPlayback = () => {
      window.__audioAllowed = true;
      document.removeEventListener('click', enableAudioPlayback);
    };
  
    document.addEventListener('click', enableAudioPlayback);
  }, []);
  

  useEffect(() => {
    
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${config.backendUrl}/api/driver-notifications/${driver._id}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
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
    <div className={styles.notificationDropdown}>
      <h4>Pickup Notifications</h4>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul>
          {notifications.map((note, index) => (
            <li key={index} className={styles.notificationItem}>
              <div>
                <strong>{note.shops?.map((shop) => shop.shopName).join(', ')}</strong> has an order ready for pickup!
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