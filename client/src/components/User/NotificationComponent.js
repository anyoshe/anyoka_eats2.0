import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import config from "../../config";
import styles from "./NotificationComponent.module.css"; // Assuming you have a CSS module for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const socket = io(config.backendUrl); // Don't forget the correct template usage

const NotificationComponent = ({ partnerId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const audioRef = useRef(null); // for sound

  useEffect(() => {
    if (!partnerId) return;

    socket.emit("registerPartner", partnerId);

    socket.on("partnerRegistered", (message) => {
      console.log("Registration Response:", message);
    });

    socket.on("newOrder", (data) => {
      console.log('Received new order:', data);
      const newNotification = {
        id: data.orderId,
        title: `New Order: ${data.orderId}`,
        message: `Total: KES ${data.orderDetails.totalPrice}`,
        data: data,
        read: false,
        open: false,
      };

      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log("Sound error:", err));
      }

      // Add notification to panel
      setNotifications((prev) => [...prev, newNotification]);
    });

    return () => {
      socket.off("newOrder");
      socket.off("partnerRegistered");
    };
  }, [partnerId]);

  const toggleNotificationPanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const toggleExpandNotification = (index) => {
    const updated = [...notifications];
    updated[index].read = true;
    updated[index].open = !updated[index].open;
    setNotifications(updated);
  };

  const handleDeleteNotification = (index) => {
    const updated = notifications.filter((_, i) => i !== index);
    setNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: "relative" }}>
      {/* Notification sound */}
      <audio ref={audioRef} src="client/src/assets/notification.mp3" preload="auto" />

      <button onClick={toggleNotificationPanel} style={{ position: "relative" }}>
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: -5,
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "0.2em 0.5em",
              fontSize: "0.8em",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isPanelOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "40px",
            background: "white",
            border: "1px solid #ccc",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            padding: "1rem",
            zIndex: 1000,
            width: "320px",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {notifications.map((note, index) => (
                <li
                  key={note.id}
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    borderRadius: "5px",
                    background: note.read ? "#f0f0f0" : "#e6f7ff",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div onClick={() => toggleExpandNotification(index)}>
                    <strong>{note.title}</strong>
                    <p style={{ margin: "5px 0" }}>{note.message}</p>
                    {note.open && (
                      <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                        <p><strong>Customer:</strong> {note.data.customerName || "N/A"}</p>
                        <p><strong>Items:</strong></p>
                        <ul>
                          {/* {note.data.orderDetails.dishes.map((dish, i) => (
                            <li key={i}>
                              {dish.dishName} - {dish.quantity} x KES {dish.dishPrice}
                            </li> */}
                          {note.data.dishes.map((dish, i) => (
                            <li key={i}>
                              {dish.dishName} - {dish.quantity} x KES {dish.price}
                            </li>
                          ))}


                        </ul>
                        <p><strong>Delivery:</strong> {note.data.deliveryAddress || "N/A"}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteNotification(index)}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      background: "transparent",
                      border: "none",
                      color: "#999",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                    title="Delete"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;
