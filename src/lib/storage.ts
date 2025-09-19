
import type { Booking, Route, Profile, VideoPlayerState, Visit, VideoEvent } from "./types";
import type { ProfileFormValues } from "@/components/dashboard/profile-form";
import { getBookingsFromFirestore, saveBookingsToFirestore, getRoutesFromFirestore, saveRoutesToFirestore, addRouteToFirestore, getProfileFromFirestore, saveProfileToFirestore, getAllProfilesFromFirestore, saveSetting, getSetting, onSettingChange, addVisitToFirestore, getVisitsFromFirestore, addVideoEventToFirestore, getVideoEventsFromFirestore } from './firebase';
import { getDatabase, ref, set } from "firebase/database";
import { getApp } from "firebase/app";


const isBrowser = typeof window !== "undefined";

// --- Video Events ---
export const logVideoUnmute = async (videoUrl: string) => {
    if (!isBrowser) return;
    const userEmail = getCurrentUser();
    const userName = getCurrentUserName();
    const role = getCurrentUserRole();
    
    if (userEmail && userName && role) {
        await addVideoEventToFirestore({
            userEmail,
            userName,
            role,
            eventType: 'unmute',
            videoUrl,
            // timestamp will be added by Firestore
        } as Omit<VideoEvent, 'id' | 'timestamp'>);
    }
};

export const getVideoEvents = async (): Promise<VideoEvent[]> => {
    if (!isBrowser) return [];
    return await getVideoEventsFromFirestore();
}

// --- Visits ---
export const logVisit = async (path: string) => {
    if (!isBrowser) return;
    const userEmail = getCurrentUser();
    const userName = getCurrentUserName();
    const role = getCurrentUserRole();

    // Log anonymous visitor count
    if (!sessionStorage.getItem('visitor_tracked')) {
        await incrementVisitorCount();
        sessionStorage.setItem('visitor_tracked', 'true');
    }
    
    // Log visit for logged-in users
    if (userEmail && userName && role && !sessionStorage.getItem('visit_logged')) {
        await addVisitToFirestore({
            userEmail,
            userName,
            role,
            path,
            // timestamp will be added by Firestore
        } as Omit<Visit, 'id' | 'timestamp'>);
        sessionStorage.setItem('visit_logged', 'true');
    }
}

export const getVisits = async (): Promise<Visit[]> => {
    if (!isBrowser) return [];
    return await getVisitsFromFirestore();
}

// --- Settings ---
export const saveGlobalVideoUrl = async (url: string) => {
    if (!isBrowser) return;
    await saveSetting('backgroundVideoUrl', url);
}

export const getGlobalVideoUrl = async (): Promise<string | null> => {
    if (!isBrowser) return null;
    return await getSetting('backgroundVideoUrl');
}

export const onGlobalVideoUrlChange = (callback: (url: string) => void) => {
    if (!isBrowser) return () => {};
    return onSettingChange('backgroundVideoUrl', callback);
};

export const getVisitorCount = async (): Promise<number> => {
    if (!isBrowser) return 0;
    const count = await getSetting('visitorCount');
    return typeof count === 'number' ? count : 0;
};

export const incrementVisitorCount = async () => {
    if (!isBrowser) return;
    const currentCount = await getVisitorCount();
    await saveSetting('visitorCount', currentCount + 1);
};

// --- Bookings ---
export const getBookings = async (isAdmin = false): Promise<Booking[]> => {
    if (!isBrowser) return [];
    try {
        // Fetches all if admin, otherwise Firestore rules will filter.
        return await getBookingsFromFirestore();
    } catch (error) {
        console.error("Error getting bookings:", error);
        return [];
    }
};

export const saveBookings = async (bookings: Booking[]) => {
    if (!isBrowser) return;
    await saveBookingsToFirestore(bookings);
};

// --- Routes ---
export const getRoutes = async (isAdmin = false): Promise<Route[]> => {
    if (!isBrowser) return [];
    try {
       // Fetches all if admin, otherwise Firestore rules will filter.
        return await getRoutesFromFirestore();
    } catch(e) {
        console.error("Error getting routes:", e);
        return [];
    }
};

export const saveRoutes = async (routes: Route[]) => {
    if (!isBrowser) return;
    await saveRoutesToFirestore(routes);
};

export const addRoute = async (route: Omit<Route, 'id'>): Promise<Route> => {
    if (!isBrowser) throw new Error("This function can only be called from the browser.");
    return await addRouteToFirestore(route);
}


// --- Profile ---
export const saveProfile = async (profile: Profile) => {
    if (!isBrowser) return;
    const userEmail = profile.email || getCurrentUser(); // Use profile email if available, fallback to session
    if (userEmail) {
        await saveProfileToFirestore({ ...profile, email: userEmail });
    } else {
        console.error("Cannot save profile, no user is logged in.");
    }
};

export const getProfile = async (email?: string): Promise<Profile | null> => {
    if (!isBrowser) return null;
    const userEmail = email || getCurrentUser();
    if (userEmail) {
        return await getProfileFromFirestore(userEmail);
    }
    return null;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
    if (!isBrowser) return [];
    // This function needs to be public to allow fetching driver avatars.
    // Security should be handled by Firestore rules if sensitive data is involved.
    return await getAllProfilesFromFirestore();
}


// --- User Session (remains in sessionStorage) ---
export const saveCurrentUser = (email: string, name: string, role: 'owner' | 'passenger' | 'admin') => {
    if (!isBrowser) return;
    try {
        window.sessionStorage.setItem('currentUserEmail', email);
        window.sessionStorage.setItem('currentUserName', name);
        window.sessionStorage.setItem('currentUserRole', role);
    } catch (error) {
        console.error("Failed to save current user to sessionStorage", error);
    }
}

export const getCurrentUser = (): string | null => {
    if (!isBrowser) return null;
    return window.sessionStorage.getItem('currentUserEmail');
}

export const getCurrentUserName = (): string | null => {
    if (!isBrowser) return null;
    return window.sessionStorage.getItem('currentUserName');
}

export const getCurrentUserRole = (): string | null => {
    if (!isBrowser) return null;
    return window.sessionStorage.getItem('currentUserRole');
}

export const clearCurrentUser = () => {
    if (!isBrowser) return;
    window.sessionStorage.removeItem('currentUserEmail');
    window.sessionStorage.removeItem('currentUserName');
    window.sessionStorage.removeItem('currentUserRole');
};
