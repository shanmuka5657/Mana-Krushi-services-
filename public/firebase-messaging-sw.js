// Import and configure the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDaVPZmSQXIhH-8fMtw5iEQ2ylngPS6KqU",
  authDomain: "globetrotterhq-xx8l8.firebaseapp.com",
  projectId: "globetrotterhq-xx8l8",
  storageBucket: "globetrotterhq-xx8l8.firebasestorage.app",
  messagingSenderId: "691006742493",
  appId: "1:691006742493:web:f1f5f88fda35370e8de034"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
