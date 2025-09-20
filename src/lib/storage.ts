

import type { Booking, Route, Profile, VideoPlayerState, Visit, VideoEvent } from "./types";
import type { ProfileFormValues } from "@/components/dashboard/profile-form";
import { getBookingsFromFirestore, saveBookingsToFirestore, getRoutesFromFirestore, saveRoutesToFirestore, addRouteToFirestore, getProfileFromFirestore, saveProfileToFirestore, getAllProfilesFromFirestore, saveSetting, getSetting, onSettingChange, addVisitToFirestore, getVisitsFromFirestore, addVideoEventToFirestore, getVideoEventsFromFirestore } from './firebase';
import { getDatabase, ref, set } from "firebase/database";
import { getApp } from "firebase/app";


const isBrowser = typeof window !== "undefined";

// --- Branding ---
export const saveGlobalLogoUrl = async (url: string) => {
    if (!isBrowser) return;
    await saveSetting('globalLogoUrl', url);
};

export const getGlobalLogoUrl = async (): Promise<string | null> => {
    if (!isBrowser) return null;
    return await getSetting('globalLogoUrl');
};

export const onGlobalLogoUrlChange = (callback: (url: string | null) => void) => {
    if (!isBrowser) return () => {};
    return onSettingChange('globalLogoUrl', callback);
};


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

    // For anonymous users, just increment the total visitor count once per session
    if (!getCurrentUser()) {
        if (!sessionStorage.getItem('visitor_tracked')) {
            await incrementVisitorCount();
            sessionStorage.setItem('visitor_tracked', 'true');
        }
        return;
    }

    // For logged-in users, manage session-based activity tracking
    const userEmail = getCurrentUser();
    const userName = getCurrentUserName();
    const role = getCurrentUserRole();
    
    if (!userEmail || !userName || !role) return;

    let sessionId = sessionStorage.getItem('session_id');
    const now = new Date().getTime();

    // Check for session expiry (e.g., 30 minutes of inactivity)
    const lastActivity = sessionStorage.getItem('last_activity');
    if (lastActivity && now - parseInt(lastActivity, 10) > 30 * 60 * 1000) {
        sessionId = null; // Expire session
    }

    if (!sessionId) {
        sessionId = `${userEmail}-${now}`;
        sessionStorage.setItem('session_id', sessionId);
    }
    
    sessionStorage.setItem('last_activity', String(now));

    await addVisitToFirestore({
        sessionId,
        userEmail,
        userName,
        role,
        path,
        // timestamp will be added by Firestore
    } as Omit<Visit, 'id' | 'timestamp'>);
};


export const getVisits = async (): Promise<Visit[]> => {
    if (!isBrowser) return [];
    return await getVisitsFromFirestore();
}

export const getLiveVisitorsCount = async (minutes = 5): Promise<number> => {
    if (!isBrowser) return 0;
    const allVisits = await getVisitsFromFirestore();
    const now = new Date();
    const activeSince = new Date(now.getTime() - minutes * 60 * 1000);

    const activeSessions = new Set<string>();

    for (const visit of allVisits) {
        if (visit.timestamp >= activeSince) {
            activeSessions.add(visit.sessionId);
        }
    }

    return activeSessions.size;
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

export const saveGlobalVideoVisibility = async (isVisible: boolean) => {
    if (!isBrowser) return;
    await saveSetting('isGlobalVideoPlayerVisible', isVisible);
};

export const getGlobalVideoVisibility = async (): Promise<boolean> => {
    if (!isBrowser) return true; // Default to visible
    const isVisible = await getSetting('isGlobalVideoPlayerVisible');
    return isVisible === null ? true : isVisible; // Default to true if not set
};

export const onGlobalVideoVisibilityChange = (callback: (isVisible: boolean) => void) => {
    if (!isBrowser) return () => {};
    return onSettingChange('isGlobalVideoPlayerVisible', (value) => {
        // If the value is null (not set in Firestore), default to true
        callback(value === null ? true : value);
    });
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
        window.sessionStorage.removeItem('session_id'); // Clear session on new login
        window.sessionStorage.removeItem('last_activity');
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
    window.sessionStorage.removeItem('session_id');
    window.sessionStorage.removeItem('last_activity');
};
