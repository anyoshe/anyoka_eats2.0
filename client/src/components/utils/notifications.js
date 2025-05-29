// utils/notifications.js
const audio = new Audio('/sounds/new_order.mp3');
audio.preload = 'auto';

export function playNotificationSound() {
  try {
    audio.currentTime = 0;      // rewind to start
    audio.play();
  } catch (err) {
    console.error("Audio play error:", err);
  }
}

export function showBrowserNotification({ message, subOrderId }) {
  if (Notification.permission === 'granted') {
    const notification = new Notification("ANYEAT - New Order", {
      body: message,
      icon: "/my-logo.png",
      data: { url: `/partner/orders/${subOrderId}` },
    });
    notification.onclick = (e) => {
      window.open(e.target.data.url, "_blank");
    };
  } else {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showBrowserNotification({ message, subOrderId });
      }
    });
  }
}
