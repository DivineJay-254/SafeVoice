// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyAZVQ05Xa438wy8HuySmEJbah0xQIfOsgY",
  authDomain: "safevoice-6df0c.firebaseapp.com",
  projectId: "safevoice-6df0c",
  storageBucket: "safevoice-6df0c.firebasestorage.app",
  messagingSenderId: "1049963845626",
  appId: "1:1049963845626:web:40e7b3ed4d5799825e3643",
  measurementId: "G-PH93FQ9TFS"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});