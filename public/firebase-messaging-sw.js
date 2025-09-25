// This file must be in the public folder.

// Scripts for Firebase
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "globetrotterhq-xx8l8",
  "appId": "1:691006742493:web:f1f5f88fda35370e8de034",
  "storageBucket": "globetrotterhq-xx8l8.firebasestorage.app",
  "apiKey": "AIzaSyDaVPZmSQXIhH-8fMtw5iEQ2ylngPS6KqU",
  "authDomain": "globetrotterhq-xx8l8.firebaseapp.com",
  "messagingSenderId": "691006742493"
};

// Initialize Firebase
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// If you want to handle push notifications when the app is in the background,
// you can do so with the onBackgroundMessage handler.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
