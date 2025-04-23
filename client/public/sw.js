self.addEventListener("push", function (e) {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.png",
      data: { url: data.url }
    });
  });
  
  self.addEventListener("notificationclick", function (e) {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data.url));
  });
  