import { getMessaging, getToken } from "firebase/messaging";
import { app } from "./firebase";

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
export const getFCMToken = async () => {
    if (typeof window === 'undefined' || !app) {
        return null;
    }
    console.warn("Push notifications are currently disabled as PWA features have been removed.");
    return null;
};
