import { getMessaging, getToken } from "firebase/messaging";
import { app } from "./firebase";

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
export const getFCMToken = async () => {
    if (typeof window === 'undefined' || !app) {
        return null;
    }

    try {
        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY_HERE' });
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                return currentToken;
            } else {
                console.log('No registration token available. Request permission to generate one.');
                return null;
            }
        } else {
            console.log('Unable to get permission to notify.');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
        return null;
    }
};
