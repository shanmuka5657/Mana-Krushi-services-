
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, query, where, writeBatch, documentId, enableIndexedDbPersistence, terminate } from "firebase/firestore";
import type { Booking, Route, Profile } from "./types";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "globetrotterhq-xx8l8",
  "appId": "1:691006742493:web:f1f5f88fda35370e8de034",
  "storageBucket": "globetrotterhq-xx8l8.firebasestorage.app",
  "apiKey": "AIzaSyDaVPZmSQXIhH-8fMtw5iEQ2ylngPS6KqU",
  "authDomain": "globetrotterhq-xx8l8.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "691006742493"
};

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
        batch.set(docRef, route);
    });
    await batch.commit();
};

export const addRouteToFirestore = async (route: Omit<Route, 'id'>): Promise<Route> => {
    if (!routesCollection) throw new Error("Firestore not initialized");
    const newDocRef = doc(routesCollection);
    const newRoute = { ...route, id: newDocRef.id };
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
            return { ...doc.data(), email: doc.id } as Profile;
        }
    } catch(e) {
        console.error("Error getting profile", e);
    }
    return null;
}

export const saveProfileToFirestore = async (profile: Profile) => {
    if (!profilesCollection || !db) return;
    const docRef = doc(db, "profiles", profile.email);
    await setDoc(docRef, profile, { merge: true });
}
