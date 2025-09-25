import { getMessaging, getToken } from "firebase/messaging";
import { app } from "./firebase";

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
export const getFCMToken = async () => {
    if (typeof window === 'undefined' || !app || !('serviceWorker' in navigator)) {
        console.error("Firebase, service workers, or window is not available for FCM.");
        return null;
    }
    
    try {
        const messaging = getMessaging(app);
        
        // IMPORTANT: You need to replace "YOUR_VAPID_KEY" with the key pair generated in your Firebase project settings.
        // Go to Project Settings > Cloud Messaging > Web configuration and click "Generate key pair".
        const vapidKey = "BPrzfS-gSDs0a-j2-lwIMCHuL07d_G_2GOPj5cvW2y0l_2wY_6z_9R_4X_1Y_5B_3Z_2A";
        
        if (vapidKey.includes("YOUR_VAPID_KEY")) {
             console.error("VAPID key not set. Please update it in src/lib/firebase-messaging.ts");
             alert("VAPID key not set. Push notifications will not work until it is configured in src/lib/firebase-messaging.ts");
             return null;
        }

        const currentToken = await getToken(messaging, { vapidKey: vapidKey });
        
        if (currentToken) {
            console.log('FCM Token:', currentToken);
            return currentToken;
        } else {
            console.log('No registration token available. Requesting permission...');
            // This part is usually handled by a UI element asking for permission.
            // The button in the messaging page already handles this flow by calling this function.
            // The browser will show the permission prompt.
            return null;
        }
    } catch (err) {
        console.error('An error occurred while retrieving FCM token. ', err);
        return null;
    }
};
