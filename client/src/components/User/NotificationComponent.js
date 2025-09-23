import React, { useContext, useEffect, useRef } from 'react';
import styles from './NotificationComponent.module.css';
import { PartnerContext } from '../../contexts/PartnerContext';

const NotificationComponent = ({ onView, onClose }) => {
  const { notifications, markNotificationAsRead, deleteNotification } = useContext(PartnerContext);
  const containerRef = useRef(null);

  // Close on click-away
  useEffect(() => {
    const handleClickAway = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [onClose]);

   // Ensure it's an array no matter what
   const notifs = Array.isArray(notifications) ? notifications : [];

   if (notifs.length === 0) {
     return (
      <div className={styles.container} ref={containerRef}>
         <p className={styles.emptyText}>No notifications yet.</p>
       </div>
     );
   }

   const handleClick = (notif) => {
    if (onView) {
      const id = notif.subOrderId || notif.orderId;
      const isSubOrder = !!notif.subOrderId;
      onView(id, isSubOrder);
    }
    markNotificationAsRead(notif._id);
  };
  
  return (
    <div className={styles.container} ref={containerRef}>
      <h4 className={styles.title}>Notifications</h4>
      <ul className={styles.list}>
      {notifs.map((notif, index) => (
          <li
          key={index}
          onClick={() => handleClick(notif)}
          className={`${styles.notification} ${!notif.read ? styles.unread : ''}`}
        >
            <div className={styles.message}>{notif.message}</div>
            <div className={styles.footer}>
              <span className={styles.time}>
                {new Date(notif.timestamp).toLocaleTimeString()}
              </span>

              {notif.url && (
                <button
                  className={styles.viewBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    const id = notif.subOrderId || notif.orderId;
                    const isSubOrder = !!notif.subOrderId;
                    onView(id, isSubOrder);
                  }}
                  
                >
                  View
                </button>
              )}
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif._id);
                  }}
                >
                  {/* 🗑 */}
                  <i class="fas fa-trash"></i> 
                </button>
                <button
                  className={styles.viewOnlyBtn}
                  onClick={(e) => { e.stopPropagation(); }}
                  disabled
                >
                  View
                </button>
              </div>
            {/* </div> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationComponent;
