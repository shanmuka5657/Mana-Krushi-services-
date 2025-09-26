



import type { Booking, Route, Profile, VideoPlayerState, Visit, ChatMessage } from "./types";
import type { ProfileFormValues } from "@/components/dashboard/profile-form";
import { getBookingsFromFirestore, saveBookingsToFirestore, getRoutesFromFirestore, saveRoutesToFirestore, addRouteToFirestore, getProfileFromFirestore, saveProfileToFirestore, getAllProfilesFromFirestore, saveSetting, getSetting as getSettingFromFirestore, onSettingChange, addVisitToFirestore, getVisitsFromFirestore, getNextRideForUserFromFirestore, updateBookingInFirestore, onBookingsUpdateFromFirestore, addRouteViewToFirestore, getRouteViewsFromFirestore, getBookingFromFirestore, onChatMessagesFromFirestore, sendChatMessageToFirestore, getRouteFromFirestore, getDoc, doc, setDoc, getDocs, collection, writeBatch } from './firebase';
import { getDatabase, ref, set } from "firebase/database";
import { getApp } from "firebase/app";
import { getCurrentFirebaseUser } from './auth';
import { perfTracker } from './perf-tracker';
import { db } from "./firebase";

const isBrowser = typeof window !== "undefined";

// --- Caching Layer ---
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = {
    profiles: new Map<string, { timestamp: number, data: Profile | null }>(),
    allProfiles: { timestamp: 0, data: [] as Profile[] },
    routes: new Map<string, { timestamp: number, data: Route[] }>(),
    bookings: new Map<string, { timestamp: number, data: Booking[] }>(),
};

const clearCache = (key?: 'profiles' | 'allProfiles' | 'routes' | 'bookings') => {
    if (key) {
        if (key === 'allProfiles') {
            cache.allProfiles = { timestamp: 0, data: [] };
        } else {
            cache[key].clear();
        }
    } else {
        cache.profiles.clear();
        cache.allProfiles = { timestamp: 0, data: [] };
        cache.routes.clear();
        cache.bookings.clear();
    }
}

// --- Location Cache ---
export const getLocationCache = async (query: string): Promise<any[] | null> => {
    if (!isBrowser || !db) return null;
    const queryKey = query.toLowerCase().trim();
    const docRef = doc(db, "location_cache", queryKey);
    perfTracker.increment({ reads: 1, writes: 0 });
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().suggestions;
    }
    return null;
};

export const setLocationCache = async (query: string, suggestions: any[]) => {
    if (!isBrowser || !db) return;
    const queryKey = query.toLowerCase().trim();
    const docRef = doc(db, "location_cache", queryKey);
    perfTracker.increment({ reads: 0, writes: 1 });
    await setDoc(docRef, { suggestions, timestamp: new Date() });
};

export const getLocationCacheContents = async (): Promise<{id: string, suggestions: any[]}[]> => {
    if (!isBrowser || !db) return [];
    try {
        const cacheCollection = collection(db, "location_cache");
        perfTracker.increment({ reads: 1, writes: 0 }); // Reading multiple docs
        const snapshot = await getDocs(cacheCollection);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            suggestions: doc.data().suggestions,
        }));
    } catch (e) {
        console.error("Error fetching location cache contents:", e);
        return [];
    }
};

export const clearLocationCache = async () => {
    if (!isBrowser || !db) return;
    try {
        const cacheCollection = collection(db, "location_cache");
        perfTracker.increment({ reads: 1, writes: 0 });
        const snapshot = await getDocs(cacheCollection);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        perfTracker.increment({ reads: 0, writes: 1 }); // Batch write
        await batch.commit();
    } catch (e) {
        console.error("Error clearing location cache:", e);
    }
};


// --- Chat ---
export const onChatMessages = (rideId: string, callback: (messages: ChatMessage[]) => void) => {
    if (!isBrowser) return () => {};
    perfTracker.increment({ reads: 1, writes: 0 }); // counts as one subscription
    return onChatMessagesFromFirestore(rideId, callback);
}

export const sendChatMessage = async (rideId: string, senderEmail: string, text: string) => {
    if (!isBrowser) return;
    perfTracker.increment({ reads: 0, writes: 1 });
    return sendChatMessageToFirestore(rideId, senderEmail, text);
};

export const getRideDetailsForChat = async (rideId: string, currentUserEmail: string) => {
    // A ride is now identified by its routeId
    const route = await getRouteFromFirestore(rideId);
    if (!route) {
        console.warn(`Chat access denied: Route with ID ${rideId} not found.`);
        return { ride: null, profiles: [] };
    }
    
    // Security check: ensure current user is part of the ride
    const isDriver = route.ownerEmail === currentUserEmail;
    
    const allBookingsForRide = await getBookings(true, {
       routeId: rideId
    });
    
    // Check if the current user is a passenger in one of the confirmed bookings for this route.
    const isPassenger = allBookingsForRide.some(
        (b) => b.clientEmail === currentUserEmail && b.status !== 'Cancelled'
    );

    if (!isDriver && !isPassenger) {
        console.warn(`User ${currentUserEmail} denied access to chat for ride ${rideId}. Not a participant.`);
        return { ride: null, profiles: [] };
    }

    // Get all participants
    const participantEmails = new Set<string>();
    participantEmails.add(route.ownerEmail);
    allBookingsForRide.forEach(b => {
        if(b.clientEmail && b.status !== 'Cancelled') participantEmails.add(b.clientEmail);
    });

    const profilePromises = Array.from(participantEmails).map(email => getProfile(email));
    const profiles = await Promise.all(profilePromises);

    return { ride: route, profiles: profiles.filter((p): p is Profile => !!p) };
};


// --- Branding ---
export const saveGlobalLogoUrl = async (url: string) => {
    if (!isBrowser) return;
    perfTracker.increment({ reads: 0, writes: 2 }); // two writes
    await saveSetting('globalLogoUrl', url);
    await saveSetting('logoCacheBuster', new Date().getTime()); // Add cache buster
};

export const getGlobalLogoUrlWithCache = async (): Promise<string | null> => {
    if (!isBrowser) return null;
    perfTracker.increment({ reads: 2, writes: 0 }); // two reads
    const url = await getSetting('globalLogoUrl');
    const cacheBuster = await getSetting('logoCacheBuster');
    return cacheBuster ? `${url}?v=${cacheBuster}` : url;
};

export const onGlobalLogoUrlChange = (callback: (url: string | null) => void) => {
    if (!isBrowser) return () => {};

    const handleLogoUpdate = async () => {
        perfTracker.increment({ reads: 2, writes: 0 });
        const url = await getSetting('globalLogoUrl');
        const cacheBuster = await getSetting('logoCacheBuster');
        if (url) {
            callback(cacheBuster ? `${url}?v=${cacheBuster}` : url);
        } else {
            callback(null);
        }
    };
    
    // Listen to both URL and cache buster changes
    const unsubUrl = onSettingChange('globalLogoUrl', handleLogoUpdate);
    const unsubCacheBuster = onSettingChange('logoCacheBuster', handleLogoUpdate);

    return () => {
        unsubUrl();
        unsubCacheBuster();
    };
};

// --- PWA ---
export const getPwaScreenshots = async (): Promise<any[] | null> => {
    if (!isBrowser) return null;
    perfTracker.increment({ reads: 1, writes: 0 });
    return await getSettingFromFirestore('pwaScreenshots');
};


// --- Visits & Views ---
const getSessionId = (): string | null => {
    if (!isBrowser) return null;

    const user = getCurrentFirebaseUser();
    if (!user || !user.email) return null;

    let sessionId = sessionStorage.getItem('session_id');
    const now = new Date().getTime();

    const lastActivity = sessionStorage.getItem('last_activity');
    if (lastActivity && now - parseInt(lastActivity, 10) > 30 * 60 * 1000) { // 30 min timeout
        sessionId = null; 
    }

    if (!sessionId) {
        sessionId = `${user.email}-${now}`;
        sessionStorage.setItem('session_id', sessionId);
    }
    
    sessionStorage.setItem('last_activity', String(now));
    return sessionId;
}

export const logVisit = async (path: string) => {
    if (!isBrowser) return;
    
    const user = getCurrentFirebaseUser();
    if (!user || !user.email) return;

    const profile = await getProfile(user.email);
    if (!profile) return;

    const sessionId = getSessionId();
    if (!sessionId) return;
    
    perfTracker.increment({ reads: 0, writes: 1 });
    await addVisitToFirestore({
        sessionId,
        userEmail: profile.email,
        userName: profile.name,
        role: profile.role || 'passenger',
        path,
    } as Omit<Visit, 'id' | 'timestamp'>);
};

export const getVisits = async (): Promise<Visit[]> => {
    if (!isBrowser) return [];
    perfTracker.increment({ reads: 1, writes: 0 });
    const visits = await getVisitsFromFirestore();
    return visits;
}

export const logRouteView = async (routeId: string) => {
    if (!isBrowser) return;

    const sessionId = getSessionId();
    if (!sessionId) return; // Don't log views for anonymous users

    perfTracker.increment({ reads: 0, writes: 1 });
    await addRouteViewToFirestore(routeId, sessionId);
}

export const getRouteViews = async (routeId: string): Promise<number> => {
    if (!isBrowser) return 0;
    perfTracker.increment({ reads: 1, writes: 0 });
    return await getRouteViewsFromFirestore(routeId);
};



// --- Settings ---
export const saveGlobalVideoUrl = async (url: string) => {
    if (!isBrowser) return;
    perfTracker.increment({ reads: 0, writes: 1 });
    await saveSetting('backgroundVideoUrl', url);
};

export const getGlobalVideoUrl = async (): Promise<string | null> => {
    if (!isBrowser) return null;
    perfTracker.increment({ reads: 1, writes: 0 });
    const url = await getSetting('backgroundVideoUrl');
    return url;
}

export const onGlobalVideoUrlChange = (callback: (url: string) => void) => {
    if (!isBrowser) return () => {};
    return onSettingChange('backgroundVideoUrl', callback);
};

export const saveGlobalVideoVisibility = async (isVisible: boolean) => {
    if (!isBrowser) return;
    perfTracker.increment({ reads: 0, writes: 1 });
    await saveSetting('isGlobalVideoPlayerVisible', isVisible);
};

export const getGlobalVideoVisibility = async (): Promise<boolean> => {
    if (!isBrowser) return true; // Default to visible
    perfTracker.increment({ reads: 1, writes: 0 });
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


// --- Bookings ---
export const getBookings = async (isAdmin = false, searchParams?: { destination?: string, date?: string, time?: string, userEmail?: string, role?: 'passenger' | 'owner' | 'admin', routeId?: string }): Promise<Booking[]> => {
    if (!isBrowser) return [];
    
    const cacheKey = JSON.stringify(searchParams || {});
    const cachedEntry = cache.bookings.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        perfTracker.increment({ reads: 0, writes: 0 });
        return cachedEntry.data;
    }
    
    try {
        perfTracker.increment({ reads: 1, writes: 0 });
        const bookings = await getBookingsFromFirestore(searchParams);
        cache.bookings.set(cacheKey, { timestamp: Date.now(), data: bookings });
        return bookings;
    } catch (error) {
        console.error("Error getting bookings:", error);
        return [];
    }
};

export const onBookingsUpdate = (callback: (bookings: Booking[]) => void, searchParams?: { userEmail?: string, role?: 'passenger' | 'owner' | 'admin' }) => {
    if (!isBrowser) return () => {};
    // Subscription counts as one initial read
    perfTracker.increment({ reads: 1, writes: 0 });
    // Real-time updates should bypass the cache to deliver fresh data.
    return onBookingsUpdateFromFirestore(callback, searchParams);
};

export const saveBookings = async (bookings: Booking[]) => {
    if (!isBrowser) return;
    clearCache('bookings');
    perfTracker.increment({ reads: 0, writes: 1 }); // Counts as one batch write
    await saveBookingsToFirestore(bookings);
};

export const getNextRideForUser = async (email: string, role: 'passenger' | 'owner'): Promise<Booking | null> => {
    if (!isBrowser) return null;
    perfTracker.increment({ reads: 1, writes: 0 });
    const ride = await getNextRideForUserFromFirestore(email, role);
    return ride;
}

export const updateBookingLocation = async (bookingId: string, location: { passengerLatitude?: number, passengerLongitude?: number, driverLatitude?: number, driverLongitude?: number }) => {
    if (!isBrowser) return;
    clearCache('bookings');
    perfTracker.increment({ reads: 0, writes: 1 });
    await updateBookingInFirestore(bookingId, location);
}


// --- Routes ---
export const getRoutes = async (isAdminOrSearch: boolean = false, searchParams?: { from?: string, to?: string, date?: string, promoted?: boolean, routeId?: string }): Promise<Route[]> => {
    if (!isBrowser) return [];

    const cacheKey = JSON.stringify(searchParams || {});
    const cachedEntry = cache.routes.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        perfTracker.increment({ reads: 0, writes: 0 });
        return cachedEntry.data;
    }
    
    try {
        perfTracker.increment({ reads: 1, writes: 0 });
        const routes = await getRoutesFromFirestore(searchParams);
        cache.routes.set(cacheKey, { timestamp: Date.now(), data: routes });
        return routes;
    } catch(e) {
        console.error("Error getting routes:", e);
        return [];
    }
};

export const saveRoutes = async (routes: Route[]) => {
    if (!isBrowser) return;
    clearCache('routes');
    perfTracker.increment({ reads: 0, writes: 1 }); // Batch write
    await saveRoutesToFirestore(routes);
};

export const addRoute = async (route: Omit<Route, 'id'>): Promise<Route> => {
    if (!isBrowser) throw new Error("This function can only be called from the browser.");
    clearCache('routes');
    perfTracker.increment({ reads: 0, writes: 1 });
    const newRoute = await addRouteToFirestore(route);
    return newRoute;
}


// --- Profile ---
export const saveProfile = async (profile: Profile) => {
    if (!isBrowser) return;
    
    const user = getCurrentFirebaseUser();
    const userEmail = profile.email || user?.email;
    if (userEmail) {
        clearCache('profiles'); // Clear specific profile
        clearCache('allProfiles'); // And all profiles list
        perfTracker.increment({ reads: 0, writes: 1 });
        await saveProfileToFirestore({ ...profile, email: userEmail });
    } else {
        console.error("Cannot save profile, no user is logged in.");
    }
};

export const getProfile = async (email?: string): Promise<Profile | null> => {
    if (!isBrowser) return null;
    
    const user = getCurrentFirebaseUser();
    const userEmail = email || user?.email;
    
    if (userEmail) {
        const cachedEntry = cache.profiles.get(userEmail);
        if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
            perfTracker.increment({ reads: 0, writes: 0 });
            return cachedEntry.data;
        }
        
        perfTracker.increment({ reads: 1, writes: 0 });
        const profile = await getProfileFromFirestore(userEmail);
        cache.profiles.set(userEmail, { timestamp: Date.now(), data: profile });
        return profile;
    }
    return null;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
    if (!isBrowser) return [];

    const cachedEntry = cache.allProfiles;
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        perfTracker.increment({ reads: 0, writes: 0 });
        return cachedEntry.data;
    }

    perfTracker.increment({ reads: 1, writes: 0 });
    const profiles = await getAllProfilesFromFirestore();
    cache.allProfiles = { timestamp: Date.now(), data: profiles };
    return profiles;
}

// Deprecated functions that relied on sessionStorage, kept for temporary compatibility
export const getCurrentUser = (): string | null => {
    if (!isBrowser) return null;
    const user = getCurrentFirebaseUser();
    return user ? user.email : null;
};
export const getCurrentUserName = (): string | null => {
    if (!isBrowser) return null;
    const user = getCurrentFirebaseUser();
    // This is a workaround to get the name, ideally it should come from the profile
    return user?.displayName || user?.email?.split('@')[0] || null;
};

export const clearCurrentUser = () => {
    if (!isBrowser) return;
    sessionStorage.removeItem('user_email');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('user_role');
    clearCache();
};
export const saveCurrentUser = (email: string, name: string, role: 'owner' | 'passenger' | 'admin') => {
    if (!isBrowser) return;
    sessionStorage.setItem('user_email', email);
    sessionStorage.setItem('user_name', name);
    sessionStorage.setItem('user_role', role);
};


// Deprecated branding functions, kept for compatibility, will be removed later.
export const getGlobalLogoUrl = async (): Promise<string | null> => {
    if (!isBrowser) return null;
    perfTracker.increment({ reads: 1, writes: 0 });
    const url = await getSetting('globalLogoUrl');
    return url;
};

// New getSetting function to be used by other parts of the app
export const getSetting = async (key: string): Promise<any> => {
    if (!isBrowser) return null;
    perfTracker.increment({ reads: 1, writes: 0 });
    return await getSettingFromFirestore(key);
}







