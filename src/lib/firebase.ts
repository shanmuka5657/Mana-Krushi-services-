
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, query, where, writeBatch, documentId, enableIndexedDbPersistence, terminate } from "firebase/firestore";
import type { Booking, Route, Profile } from "./types";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
};

export const saveBookingsToFirestore = async (bookings: Booking[]) => {
    if (!bookingsCollection) return;
    const batch = writeBatch(db);
    bookings.forEach((booking) => {
        // Create a new doc ref if id is not a valid firestore id, otherwise use existing.
        const docRef = booking.id.startsWith('#') ? doc(bookingsCollection) : doc(db, "bookings", booking.id);
        const bookingToSave = { ...booking, id: docRef.id };
        batch.set(docRef, bookingToSave);
    });
    await batch.commit();
};


// --- Routes ---
export const getRoutesFromFirestore = async (): Promise<Route[]> => {
    if (!routesCollection) return [];
    const snapshot = await getDocs(routesCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            travelDate: data.travelDate?.toDate ? data.travelDate.toDate() : new Date(data.travelDate),
        } as Route;
    });
};

export const saveRoutesToFirestore = async (routes: Route[]) => {
    if (!routesCollection) return;
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
    if (!profilesCollection) return;
    const docRef = doc(db, "profiles", profile.email);
    await setDoc(docRef, profile, { merge: true });
}
