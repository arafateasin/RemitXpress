// Firebase Messaging Service Worker
/* eslint-disable no-undef, no-restricted-globals */
/* global importScripts, firebase, clients */

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
try {
  firebase.initializeApp({
    apiKey: "AIzaSyCh55YtpFUAlF4WcuOmFUhbTC1vgKI6VRU",
    authDomain: "remitxpress-41f49.firebaseapp.com",
    projectId: "remitxpress-41f49",
    storageBucket: "remitxpress-41f49.firebasestorage.app",
    messagingSenderId: "589588653662",
    appId: "1:589588653662:web:382f525a71be0e77b2f6cf",
    measurementId: "G-FCQFFX2KCF",
  });

  // Retrieve an instance of Firebase Messaging so that it can handle background
  // messages.
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log(
      "[firebase-messaging-sw.js] Received background message ",
      payload
    );

    const notificationTitle =
      payload.notification?.title || "RemitXpress Notification";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new notification",
      icon: "/favicon.ico", // Use existing favicon as icon
      badge: "/favicon.ico", // Use existing favicon as badge
      tag: "remitxpress-notification",
      requireInteraction: true,
      data: payload.data || {}, // Include custom data
      actions: [
        {
          action: "view",
          title: "View Details",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.error("Error initializing Firebase in service worker:", error);
}

// Handle notification click events
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  // Handle different actions
  if (event.action === "view") {
    // Open the app and navigate to transaction history
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            // Focus existing window and navigate
            client.focus();
            return client.navigate("/transactions");
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow("/transactions");
        }
      })
    );
  } else if (event.action === "dismiss") {
    // Just close the notification
    console.log("Notification dismissed");
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
    );
  }
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("[firebase-messaging-sw.js] Service worker activated");
  event.waitUntil(self.clients.claim());
});

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("[firebase-messaging-sw.js] Service worker installed");
  self.skipWaiting();
});
