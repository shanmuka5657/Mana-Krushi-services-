

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    setDoc, 
    query, 
    where, 
    writeBatch, 
    documentId, 
    terminate, 
    onSnapshot, 
    deleteDoc, 
    getDoc, 
    serverTimestamp, 
    addDoc, 
    orderBy,
    initializeFirestore,
    persistentLocalCache,
    limit,
    updateDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { Booking, Route, Profile, VideoPlayerState, Visit, VideoEvent } from "./types";
import { devFirebaseConfig } from "./firebase-config.dev";
import { prodFirebaseConfig } from "./firebase-config.prod";

// Your web app's Firebase configuration
const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_ENV === 'production' 
  ? prodFirebaseConfig 
  : devFirebaseConfig;


// Initialize Firebase
let app;
let db;
let storage;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({})
    });
    storage = getStorage(app);
} catch(e) {
    console.error("Firebase initialization failed", e);
}


const bookingsCollection = db ? collection(db, "bookings") : null;
const routesCollection = db ? collection(db, "routes") : null;
const profilesCollection = db ? collection(db, "profiles") : null;
const settingsCollection = db ? collection(db, "settings") : null;
const visitsCollection = db ? collection(db, "visits") : null;
const videoEventsCollection = db ? collection(db, "video_events") : null;


// --- Video Events ---
export const addVideoEventToFirestore = async (event: Omit<VideoEvent, 'id'>) => {
    if (!videoEventsCollection) return;
    await addDoc(videoEventsCollection, { ...event, timestamp: serverTimestamp() });
};

export const getVideoEventsFromFirestore = async (): Promise<VideoEvent[]> => {
    if (!videoEventsCollection) return [];
    try {
        const q = query(videoEventsCollection, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            } as VideoEvent;
        });
    } catch(e) {
        console.error("Error getting video events from Firestore", e);
        return [];
    }
};


// --- Visits ---
export const addVisitToFirestore = async (visit: Omit<Visit, 'id' | 'timestamp'>) => {
    if (!visitsCollection) return;
    await addDoc(visitsCollection, { ...visit, timestamp: serverTimestamp() });
}

export const getVisitsFromFirestore = async (): Promise<Visit[]> => {
    if (!visitsCollection) return [];
    try {
        const q = query(visitsCollection, orderBy("timestamp", "desc"), limit(200));
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


// --- Settings ---
export const saveSetting = async (key: string, value: any) => {
    if (!settingsCollection || !db) return;
    const docRef = doc(db, "settings", key);
    await setDoc(docRef, { value });
};

export const getSetting = async (key: string): Promise<any | null> => {
    if (!settingsCollection || !db) return null;
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

export const onSettingChange = (key: string, callback: (value: any) => void) => {
    if (!settingsCollection || !db) return () => {};
    const docRef = doc(db, "settings", key);
    const unsubscribe = onSnapshot(docRef, (doc) => {
        // Don't trigger callback on initial load if doc doesn't exist
        if (doc.exists()) {
            callback(doc.data().value);
        } else {
            callback(null); // Or a default value
        }
    });
    return unsubscribe;
};

// --- Bookings ---
export const getBookingsFromFirestore = async (searchParams?: { destination?: string, date?: string, time?: string, userEmail?: string, role?: 'passenger' | 'owner' | 'admin' }): Promise<Booking[]> => {
    if (!bookingsCollection) return [];
    try {
        let q = query(bookingsCollection);

        if (searchParams?.date) {
            const searchDate = new Date(searchParams.date);
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
            q = query(q, where("departureDate", ">=", startOfDay), where("departureDate", "<=", endOfDay));
        }

        // If user specific, filter by user email
        if (searchParams?.userEmail && searchParams?.role) {
            if (searchParams.role === 'passenger') {
                q = query(q, where("clientEmail", "==", searchParams.userEmail));
            } else if (searchParams.role === 'owner') {
                q = query(q, where("driverEmail", "==", searchParams.userEmail));
            }
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

export const saveBookingsToFirestore = async (bookings: Booking[]) => {
    if (!bookingsCollection || !db) return;
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

export const getNextRideForUserFromFirestore = async (email: string, role: 'passenger' | 'owner'): Promise<Booking | null> => {
    if (!bookingsCollection) return null;
    try {
        const now = new Date();
        const fieldToQuery = role === 'owner' ? 'driverEmail' : 'clientEmail';

        // Simplified query to fetch all bookings for the user.
        // This avoids needing a composite index.
        const q = query(
            bookingsCollection,
            where(fieldToQuery, "==", email)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const userBookings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                departureDate: data.departureDate?.toDate ? data.departureDate.toDate() : new Date(data.departureDate),
                returnDate: data.returnDate?.toDate ? data.returnDate.toDate() : new Date(data.returnDate),
            } as Booking;
        });

        // Filter and sort in-memory. This is efficient enough for a single user's bookings.
        const upcomingConfirmedRides = userBookings
            .filter(b => b.status === 'Confirmed' && new Date(b.departureDate) > now)
            .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

        return upcomingConfirmedRides[0] || null;

    } catch (e) {
        console.error("Error getting next ride:", e);
        return null;
    }
};

export const updateBookingInFirestore = async (bookingId: string, data: Partial<Booking>) => {
    if (!db) return;
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, data);
};


// --- Routes ---
export const getRoutesFromFirestore = async (searchParams?: { from?: string, to?: string, date?: string, promoted?: boolean, routeId?: string }): Promise<Route[]> => {
    if (!routesCollection) return [];
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

        // Date filter is the most selective, apply it first if present.
        if (searchParams?.date) {
             const searchDate = new Date(searchParams.date);
             const startOfDay = new Date(searchDate.setHours(0,0,0,0));
             const endOfDay = new Date(searchDate.setHours(23,59,59,999));
            q = query(q, where("travelDate", ">=", startOfDay), where("travelDate", "<=", endOfDay));
        }

        if (searchParams?.promoted) {
            q = query(q, where("isPromoted", "==", true), where("travelDate", ">=", new Date()));
        }

        if (searchParams?.promoted) {
             q = query(q, orderBy("travelDate", "asc"), limit(5));
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
                    route.pickupPoints?.some(p => p.trim().toLowerCase() === searchFromLower)
                );
            }
        }


        return routes;
    } catch(e) {
        console.error("Error getting routes from Firestore", e);
        return [];
    }
};

export const saveRoutesToFirestore = async (routes: Route[]) => {
    if (!routesCollection || !db) return;
    const batch = writeBatch(db);
    routes.forEach((route) => {
        const docRef = doc(db, "routes", route.id);
        const routeToSave = Object.fromEntries(Object.entries(route).filter(([_, v]) => v !== undefined));
        batch.set(docRef, routeToSave);
    });
    await batch.commit();
};

export const addRouteToFirestore = async (route: Omit<Route, 'id'>): Promise<Route> => {
    if (!routesCollection) throw new Error("Firestore not initialized");
    const newDocRef = doc(routesCollection);
    const routeToSave = Object.fromEntries(Object.entries(route).filter(([_, v]) => v !== undefined));
    const newRoute = { ...routeToSave, id: newDocRef.id } as Route;
    await setDoc(newDocRef, newRoute);
    return newRoute;
}


// --- Profile ---
export const getProfileFromFirestore = async (email: string): Promise<Profile | null> => {
    if (!profilesCollection || !email) return null;
    try {
        const docRef = doc(db, "profiles", email);
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

export const getAllProfilesFromFirestore = async (): Promise<Profile[]> => {
    if (!profilesCollection) return [];
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

export const saveProfileToFirestore = async (profile: Profile) => {
    if (!profilesCollection || !db) return;
    const docRef = doc(db, "profiles", profile.email);
    // Remove undefined values before saving to Firestore
    const profileToSave = Object.fromEntries(
        Object.entries(profile).filter(([, value]) => value !== undefined)
    );
    await setDoc(docRef, profileToSave, { merge: true });
};

export { storage };
