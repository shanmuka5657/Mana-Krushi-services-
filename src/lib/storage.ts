

import type { Booking, Route, Profile } from "./types";
import type { ProfileFormValues } from "@/components/dashboard/profile-form";
import { getBookingsFromFirestore, saveBookingsToFirestore, getRoutesFromFirestore, saveRoutesToFirestore, addRouteToFirestore, getProfileFromFirestore, saveProfileToFirestore } from './firebase';


const isBrowser = typeof window !== "undefined";

// --- Bookings ---
export const getBookings = async (): Promise<Booking[]> => {
    if (!isBrowser) return [];
    try {
        // Always fetch directly from Firestore.
        return await getBookingsFromFirestore();
    } catch (error) {
        console.error("Error getting bookings:", error);
        return [];
    }
};

export const saveBookings = async (bookings: Booking[]) => {
    if (!isBrowser) return;
    // This function now correctly points to the Firestore save function.
    await saveBookingsToFirestore(bookings);
};

// --- Routes ---
export const getRoutes = async (): Promise<Route[]> => {
    if (!isBrowser) return [];
    try {
        // Always fetch directly from Firestore.
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
    // This function now correctly points to the Firestore add function.
    return await addRouteToFirestore(route);
}


// --- Profile ---
export const saveProfile = async (profile: Profile) => {
    if (!isBrowser) return;
    const userEmail = getCurrentUser();
    if (userEmail) {
        await saveProfileToFirestore({ ...profile });
    } else {
        console.error("Cannot save profile, no user is logged in.");
    }
};

export const getProfile = async (): Promise<Profile | null> => {
    if (!isBrowser) return null;
    const userEmail = getCurrentUser();
    if (userEmail) {
        return await getProfileFromFirestore(userEmail);
    }
    return null;
};


// --- User Session (remains in sessionStorage) ---
export const saveCurrentUser = (email: string, name: string) => {
    if (!isBrowser) return;
    try {
        window.sessionStorage.setItem('currentUserEmail', email);
        window.sessionStorage.setItem('currentUserName', name);
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

export const clearCurrentUser = () => {
    if (!isBrowser) return;
    window.sessionStorage.removeItem('currentUserEmail');
    window.sessionStorage.removeItem('currentUserName');
}
