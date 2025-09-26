
import type { Booking, Route, Profile, VideoPlayerState, Visit, ChatMessage } from "./types";
import { 
    db, 
    auth,
    collection,
    getDocs,
    doc,
    setDoc,
    query,
    where,
    writeBatch,
    documentId,
    onSnapshot,
    getDoc,
    serverTimestamp,
    addDoc,
    orderBy,
    limit,
    updateDoc,
    getCountFromServer,
    deleteDoc
} from './firebase';


import { getDatabase, ref, set } from "firebase/database";
import { getApp } from "firebase/app";
import { getCurrentFirebaseUser } from './auth';
import { perfTracker } from './perf-tracker';
import { format } from "date-fns";

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
    if (!queryKey) return null; // Do not query for empty strings
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
    if (!queryKey) return; // Do not save for empty strings
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

const getBookingsFromFirestore = async (searchParams?: { destination?: string, date?: string, time?: string, userEmail?: string, role?: 'passenger' | 'owner' | 'admin', routeId?: string }): Promise<Booking[]> => {
    if (!db) return [];
    const bookingsCollection = collection(db, "bookings");
    try {
        let q = query(bookingsCollection);

        // Server-side filtering by user if possible
        if (searchParams?.userEmail && searchParams.role && searchParams.role !== 'admin') {
            const fieldToQuery = searchParams.role === 'owner' ? 'driverEmail' : 'clientEmail';
            q = query(q, where(fieldToQuery, "==", searchParams.userEmail));
        }

        if (searchParams?.routeId) {
            q = query(q, where("routeId", "==", searchParams.routeId));
        }

        const snapshot = await getDocs(q);
        
        let bookings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                departureDate: data.departureDate?.toDate ? data.departureDate.toDate() : new Date(data.departureDate),
                returnDate: data.returnDate?.toDate ? data.returnDate.toDate() : new Date(data.returnDate),
            } as Booking;
        });
        
        // Client-side filtering for everything else
        if (searchParams?.date) {
            bookings = bookings.filter(b => format(new Date(b.departureDate), 'yyyy-MM-dd') === searchParams.date);
        }

        if (searchParams?.destination) {
            bookings = bookings.filter(b => b.destination === searchParams.destination);
        }
        
        if (searchParams?.time) {
            bookings = bookings.filter(booking => {
                 const bookingTime = new Date(booking.departureDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                 return bookingTime === searchParams.time;
            });
        }
        
        return bookings;

    } catch(e) {
        console.error("Error getting bookings from Firestore", e);
        return [];
    }
};

const onBookingsUpdateFromFirestore = (callback: (bookings: Booking[]) => void, searchParams?: { userEmail?: string, role?: 'passenger' | 'owner' | 'admin' }) => {
    if (!db) return () => {};
    const bookingsCollection = collection(db, "bookings");

    let q = query(bookingsCollection);
    
    // Apply user-specific filters if provided. This is the simplest query we can make.
    if (searchParams?.userEmail && searchParams?.role && searchParams.role !== 'admin') {
        const fieldToQuery = searchParams.role === 'owner' ? 'driverEmail' : 'clientEmail';
        q = query(q, where(fieldToQuery, "==", searchParams.userEmail));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                departureDate: data.departureDate?.toDate ? data.departureDate.toDate() : new Date(data.departureDate),
                returnDate: data.returnDate?.toDate ? data.returnDate.toDate() : new Date(data.returnDate),
            } as Booking;
        });
        
        callback(bookings);

    }, (error) => {
        console.error("Error listening to bookings updates:", error);
    });

    return unsubscribe;
};

const saveBookingsToFirestore = async (bookings: Booking[]) => {
    if (!db) return;
    const bookingsCollection = collection(db, "bookings");
    const batch = writeBatch(db);
    bookings.forEach((booking) => {
        // A valid Firestore ID is a 20-character string. Anything else is a new doc.
        const isNew = !booking.id || booking.id.length !== 20;
        const docRef = isNew ? doc(bookingsCollection) : doc(db, "bookings", booking.id);
        
        // Firestore cannot store undefined values.
        const bookingToSave = Object.fromEntries(Object.entries(booking).filter(([, v]) => v !== undefined));

        batch.set(docRef, bookingToSave, { merge: true });
    });
    await batch.commit();
};

const getNextRideForUserFromFirestore = async (email: string, role: 'passenger' | 'owner'): Promise<Booking | null> => {
    if (!db || !email) return null;
    const bookingsCollection = collection(db, "bookings");
    const routesCollection = collection(db, "routes");
    
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    
    try {
        if (role === 'owner') {
            const q = query(
                routesCollection,
                where("ownerEmail", "==", email),
                where("travelDate", ">=", startOfToday),
                orderBy("travelDate", "asc"),
            );
            const routeSnapshot = await getDocs(q);
            if (routeSnapshot.empty) return null;
            
            const ownerRoutes = routeSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    travelDate: data.travelDate.toDate(),
                } as Route;
            });

            // Additional client-side filtering for time
            const upcomingRoutes = ownerRoutes.filter(route => {
                    const [depHours, depMinutes] = route.departureTime.split(':').map(Number);
                    const departureDateTime = new Date(route.travelDate);
                    departureDateTime.setHours(depHours, depMinutes, 0, 0);
                    return departureDateTime >= now;
                })
                // The sort is already handled by `orderBy` in the query
                
            if (upcomingRoutes.length === 0) return null;
            
            const nextRoute = upcomingRoutes[0];
            
            const [depHours, depMinutes] = nextRoute.departureTime.split(':').map(Number);
            const departureDateTime = new Date(nextRoute.travelDate);
            departureDateTime.setHours(depHours, depMinutes, 0, 0);

            return {
                id: nextRoute.id,
                routeId: nextRoute.id, // Important for chat
                destination: `${nextRoute.fromLocation} to ${nextRoute.toLocation}`,
                departureDate: departureDateTime,
                driverName: nextRoute.driverName,
                vehicleNumber: nextRoute.vehicleNumber,
                status: 'Confirmed', 
            } as Booking;

        } else { // Passenger
            const q = query(
                bookingsCollection,
                where("clientEmail", "==", email),
                where("departureDate", ">=", now),
                orderBy("departureDate", "asc")
            );
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) return null;

            // Find the first non-cancelled booking
            for (const doc of snapshot.docs) {
                if (doc.data().status !== 'Cancelled') {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        departureDate: data.departureDate?.toDate ? data.departureDate.toDate() : new Date(data.departureDate),
                        returnDate: data.returnDate?.toDate ? data.returnDate.toDate() : new Date(data.returnDate),
                    } as Booking;
                }
            }
            return null; // No upcoming non-cancelled bookings found
        }

    } catch (e) {
        console.error("Error getting next ride:", e);
        return null;
    }
};

const updateBookingInFirestore = async (bookingId: string, data: Partial<Booking>) => {
    if (!db) return;
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, data);
};

const getRoutesFromFirestore = async (searchParams?: { from?: string, to?: string, date?: string, promoted?: boolean, routeId?: string, ownerEmail?: string }): Promise<Route[]> => {
    if (!db) return [];
    const routesCollection = collection(db, "routes");
    try {
        if (searchParams?.routeId) {
            const docRef = doc(db, "routes", searchParams.routeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return [{
                    ...data,
                    id: docSnap.id,
                    travelDate: data.travelDate?.toDate ? data.travelDate.toDate() : new Date(data.travelDate),
                } as Route];
            }
            return [];
        }

        let q = query(routesCollection);

        if (searchParams?.ownerEmail) {
            q = query(q, where("ownerEmail", "==", searchParams.ownerEmail));
        }
        
        if (searchParams?.promoted) {
            q = query(q, where("isPromoted", "==", true), where("travelDate", ">=", new Date()), orderBy("travelDate", "asc"), limit(5));
        } else if (searchParams?.date) {
            const searchDate = new Date(searchParams.date);
            const startOfDay = new Date(searchDate.setHours(0,0,0,0));
            const endOfDay = new Date(searchDate.setHours(23,59,59,999));
            q = query(q, where("travelDate", ">=", startOfDay), where("travelDate", "<=", endOfDay));
        } else if (!searchParams?.ownerEmail) {
            // Only apply date filter for general queries, not when filtering by owner
             q = query(q, where("travelDate", ">=", new Date(new Date().setHours(0,0,0,0))));
        }


        const snapshot = await getDocs(q);
        let routes = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                travelDate: data.travelDate?.toDate ? data.travelDate.toDate() : new Date(data.travelDate),
            } as Route;
        });
        
        // Client-side filtering for other params (if not a promoted-only query)
        if (!searchParams?.promoted) {
            if (searchParams?.to) {
                routes = routes.filter(route => route.toLocation.trim().toLowerCase() === searchParams.to?.trim().toLowerCase());
            }

            if (searchParams?.from) {
                const searchFromLower = searchParams.from.trim().toLowerCase();
                routes = routes.filter(route => 
                    route.fromLocation.trim().toLowerCase() === searchFromLower ||
                    (route as any).pickupPoints?.some((p:string) => p.trim().toLowerCase() === searchFromLower)
                );
            }
        }
        
        // Sort by date if no specific owner is being queried
        if (!searchParams?.ownerEmail) {
            routes.sort((a,b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime());
        }


        return routes;
    } catch(e) {
        console.error("Error getting routes from Firestore", e);
        return [];
    }
};

const saveRoutesToFirestore = async (routes: Route[]) => {
    if (!db) return;
    const routesCollection = collection(db, "routes");
    const batch = writeBatch(db);
    routes.forEach((route) => {
        const docRef = doc(db, "routes", route.id);
        const routeToSave = Object.fromEntries(Object.entries(route).filter(([_, v]) => v !== undefined));
        batch.set(docRef, routeToSave);
    });
    await batch.commit();
};

const addRouteToFirestore = async (route: Omit<Route, 'id'>): Promise<Route> => {
    if (!db) throw new Error("Firestore not initialized");
    const routesCollection = collection(db, "routes");
    const newDocRef = doc(routesCollection);
    const routeToSave = Object.fromEntries(Object.entries(route).filter(([_, v]) => v !== undefined));
    const newRoute = { ...routeToSave, id: newDocRef.id } as Route;
    await setDoc(newDocRef, newRoute);
    return newRoute;
}

const getProfileFromFirestore = async (email: string): Promise<Profile | null> => {
    if (!db || !email) return null;
    const profilesCollection = collection(db, "profiles");
    try {
        const q = query(profilesCollection, where(documentId(), "==", email));
        const docSnap = await getDocs(q);

        if (!docSnap.empty) {
            const doc = docSnap.docs[0];
            const data = doc.data();
            return { 
                ...data, 
                email: doc.id,
                planExpiryDate: data.planExpiryDate?.toDate ? data.planExpiryDate.toDate() : undefined
            } as Profile;
        }
    } catch(e) {
        console.error("Error getting profile", e);
    }
    return null;
}

const getAllProfilesFromFirestore = async (): Promise<Profile[]> => {
    if (!db) return [];
    const profilesCollection = collection(db, "profiles");
    try {
        const snapshot = await getDocs(profilesCollection);
        return snapshot.docs.map(doc => {
             const data = doc.data();
            return {
                ...data,
                email: doc.id,
                planExpiryDate: data.planExpiryDate?.toDate ? data.planExpiryDate.toDate() : undefined
            } as Profile
        });
    } catch(e) {
        console.error("Error getting all profiles from Firestore", e);
        return [];
    }
};

const saveProfileToFirestore = async (profile: Profile) => {
    if (!db) return;
    const docRef = doc(db, "profiles", profile.email);
    // Remove undefined values before saving to Firestore
    const profileToSave = Object.fromEntries(
        Object.entries(profile).filter(([, value]) => value !== undefined)
    );
    await setDoc(docRef, profileToSave, { merge: true });
};

const getSettingFromFirestore = async (key: string): Promise<any | null> => {
    if (!db) return null;
    try {
        const docRef = doc(db, "settings", key);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().value;
        }
        return null;
    } catch(e) {
        console.error("Error getting setting", e);
        return null;
    }
}

const onSettingChange = (key: string, callback: (value: any) => void) => {
    if (!isBrowser || !db) return () => {};
    perfTracker.increment({ reads: 1, writes: 0 }); // counts as one subscription
    const docRef = doc(db, "settings", key);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data().value);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error(`Error listening to setting "${key}":`, error);
    });
};

// --- Chat ---
const onChatMessagesFromFirestore = (rideId: string, callback: (messages: ChatMessage[]) => void) => {
    if (!db) return () => {};
    
    const q = query(collection(db, "chats", rideId, "messages"), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            } as ChatMessage;
        });
        callback(messages);
    }, (error) => {
        console.error("Error listening to chat messages:", error);
    });

    return unsubscribe;
};

const sendChatMessageToFirestore = async (rideId: string, senderEmail: string, text: string) => {
    if (!db) return;
    const messagesCol = collection(db, "chats", rideId, "messages");
    await addDoc(messagesCol, {
        senderEmail,
        text,
        timestamp: serverTimestamp(),
    });
};

const addRouteViewToFirestore = async (routeId: string, sessionId: string) => {
    if (!db) return;
    // We create a unique ID based on routeId and sessionId to prevent counting the same session multiple times.
    const viewId = `${routeId}_${sessionId}`;
    const docRef = doc(db, "routeViews", viewId);
    await setDoc(docRef, { routeId, sessionId, timestamp: serverTimestamp() }, { merge: true });
};

const getRouteViewsFromFirestore = async (routeId: string): Promise<number> => {
    if (!db) return 0;
    try {
        const q = query(collection(db, "routeViews"), where("routeId", "==", routeId));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch(e) {
        console.error("Error getting route views from Firestore", e);
        return 0;
    }
};

const addVisitToFirestore = async (visit: Omit<Visit, 'id' | 'timestamp'>) => {
    if (!db) return;
    await addDoc(collection(db, "visits"), { ...visit, timestamp: serverTimestamp() });
}

const getVisitsFromFirestore = async (): Promise<Visit[]> => {
    if (!db) return [];
    try {
        const q = query(collection(db, "visits"), orderBy("timestamp", "desc"), limit(200));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            } as Visit;
        });
    } catch(e) {
        console.error("Error getting visits from Firestore", e);
        return [];
    }
}

const saveSetting = async (key: string, value: any) => {
    if (!db) return;
    const docRef = doc(db, "settings", key);
    await setDoc(docRef, { value });
};

const getRouteFromFirestore = async (routeId: string): Promise<Route | null> => {
    if (!db || !routeId) return null;
    try {
        const docRef = doc(db, "routes", routeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                id: docSnap.id,
                travelDate: data.travelDate?.toDate ? data.travelDate.toDate() : new Date(data.travelDate),
            } as Route;
        }
        return null;
    } catch (e) {
        console.error("Error getting route from Firestore", e);
        return null;
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

export const onGlobalVideoUrlChange = (callback: (url: string | null) => void) => {
    if (!isBrowser || !db) return () => {};
    perfTracker.increment({ reads: 1, writes: 0 });
    return onSettingChange('backgroundVideoUrl', callback);
};

export const onGlobalVideoVisibilityChange = (callback: (isVisible: boolean) => void) => {
    if (!isBrowser || !db) return () => {};
    perfTracker.increment({ reads: 1, writes: 0 });
    return onSettingChange('isGlobalVideoPlayerVisible', (value) => {
        callback(value === null || value === undefined ? true : value);
    });
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
export const getRoutes = async (isAdminOrSearch: boolean = false, searchParams?: { from?: string, to?: string, date?: string, promoted?: boolean, routeId?: string, ownerEmail?: string }): Promise<Route[]> => {
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

// New getSetting function to be used by other parts of the app
export const getSetting = async (key: string): Promise<any> => {
    if (!isBrowser) return null;
    perfTracker.increment({ reads: 1, writes: 0 });
    return await getSettingFromFirestore(key);
}
