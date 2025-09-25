
// Import the Firebase app and messaging libraries
// Note: This is a simplified import for service workers.
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js");

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "globetrotterhq-xx8l8",
  "appId": "1:691006742493:web:f1f5f88fda35370e8de034",
  "storageBucket": "globetrotterhq-xx8l8.firebasestorage.app",
  "apiKey": "AIzaSyDaVPZmSQXIhH-8fMtw5iEQ2ylngPS6KqU",
  "authDomain": "globetrotterhq-xx8l8.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "691006742493"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
