// import React from 'react';
// import styles from './NotificationComponent.module.css';

// const NotificationComponent = ({ notifications = [], onView }) => {
//   if (notifications.length === 0) {
//     return (
//       <div className={styles.container}>
//         <p className={styles.emptyText}>No notifications yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       <h4 className={styles.title}>Notifications</h4>
//       <ul className={styles.list}>
//         {notifications.map((notif, index) => (
//           <li
//             key={index}
//             className={`${styles.notification} ${
//               !notif.read ? styles.unread : ''
//             }`}
//           >
//             <div className={styles.message}>{notif.message}</div>
//             <div className={styles.footer}>
//               <span className={styles.time}>
//                 {new Date(notif.timestamp).toLocaleTimeString()}
//               </span>
//               {notif.url && (
//                 <button
//                   className={styles.viewBtn}
//                   onClick={() => {
//                     window.open(notif.url, '_blank');
//                     if (onView) onView(notif);
//                   }}
//                 >
//                   View
//                 </button>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default NotificationComponent;

// NotificationComponent.jsx
import React from 'react';
import styles from './NotificationComponent.module.css';

const NotificationComponent = ({ notifications = [], onView }) => {
  if (notifications.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyText}>No notifications yet.</p>
      </div>
    );
  }

  const handleClick = (notif) => {
    if (notif.orderId) {
      onView(notif.orderId);
    }
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Notifications</h4>
      <ul className={styles.list}>
        {notifications.map((notif, index) => (
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
                    e.stopPropagation(); // prevent triggering li click
                    window.open(notif.url, '_blank');
                    if (onView) onView(notif);
                  }}
                >
                  View
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationComponent;

