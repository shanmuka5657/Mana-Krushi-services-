

import type { Booking, Route, Profile } from "./types";
import type { ProfileFormValues } from "@/components/dashboard/profile-form";
import { getBookingsFromFirestore, saveBookingsToFirestore, getRoutesFromFirestore, saveRoutesToFirestore, addRouteToFirestore, getProfileFromFirestore, saveProfileToFirestore, getAllProfilesFromFirestore } from './firebase';


const isBrowser = typeof window !== "undefined";

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
}
