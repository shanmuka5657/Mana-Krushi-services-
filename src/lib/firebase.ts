
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, query, where, writeBatch, documentId, enableIndexedDbPersistence, terminate, onSnapshot, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import type { Booking, Route, Profile, VideoPlayerState } from "./types";
import { devFirebaseConfig } from "./firebase-config.dev";
import { prodFirebaseConfig } from "./firebase-config.prod";

// Your web app's Firebase configuration
const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_ENV === 'production' 
  ? prodFirebaseConfig 
  : devFirebaseConfig;


// Initialize Firebase
let app;
let db;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a time.
            console.warn('Firebase persistence failed: multiple tabs open.');
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
             console.warn('Firebase persistence not available in this browser.');
        }
    });
} catch(e) {
    console.error("Firebase initialization failed", e);
}


const bookingsCollection = db ? collection(db, "bookings") : null;
const routesCollection = db ? collection(db, "routes") : null;
const profilesCollection = db ? collection(db, "profiles") : null;
const settingsCollection = db ? collection(db, "settings") : null;


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
        if (doc.exists()) {
            callback(doc.data().value);
        }
    });
    return unsubscribe;
};

// --- Bookings ---
export const getBookingsFromFirestore = async (): Promise<Booking[]> => {
    if (!bookingsCollection) return [];
    try {
        const snapshot = await getDocs(bookingsCollection);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                // Firestore timestamps need to be converted to JS Dates
                departureDate: data.departureDate?.toDate ? data.departureDate.toDate() : new Date(data.departureDate),
                returnDate: data.returnDate?.toDate ? data.returnDate.toDate() : new Date(data.returnDate),
            } as Booking;
        });
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
        const bookingToSave = Object.fromEntries(Object.entries(booking).filter(([_, v]) => v !== undefined));

        batch.set(docRef, bookingToSave, { merge: true });
    });
    await batch.commit();
};


// --- Routes ---
export const getRoutesFromFirestore = async (): Promise<Route[]> => {
    if (!routesCollection) return [];
     try {
        const snapshot = await getDocs(routesCollection);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                travelDate: data.travelDate?.toDate ? data.travelDate.toDate() : new Date(data.travelDate),
            } as Route;
        });
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
