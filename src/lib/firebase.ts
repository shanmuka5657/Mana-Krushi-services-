
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, query, where, writeBatch, documentId } from "firebase/firestore";
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const bookingsCollection = collection(db, "bookings");
const routesCollection = collection(db, "routes");
const profilesCollection = collection(db, "profiles");

// --- Bookings ---
export const getBookingsFromFirestore = async (): Promise<Booking[]> => {
    const snapshot = await getDocs(bookingsCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            departureDate: data.departureDate.toDate(),
            returnDate: data.returnDate.toDate(),
        } as Booking;
    });
};

export const saveBookingsToFirestore = async (bookings: Booking[]) => {
    const batch = writeBatch(db);
    bookings.forEach((booking) => {
        const docRef = doc(db, "bookings", booking.id);
        batch.set(docRef, booking);
    });
    await batch.commit();
};


// --- Routes ---
export const getRoutesFromFirestore = async (): Promise<Route[]> => {
    const snapshot = await getDocs(routesCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            travelDate: data.travelDate.toDate(),
        } as Route;
    });
};

export const saveRoutesToFirestore = async (routes: Route[]) => {
    const batch = writeBatch(db);
    routes.forEach((route) => {
        const docRef = doc(db, "routes", route.id);
        batch.set(docRef, route);
    });
    await batch.commit();
};

export const addRouteToFirestore = async (route: Omit<Route, 'id'>): Promise<Route> => {
    const newDocRef = doc(collection(db, "routes"));
    const newRoute = { ...route, id: newDocRef.id };
    await setDoc(newDocRef, newRoute);
    return newRoute;
}


// --- Profile ---
export const getProfileFromFirestore = async (email: string): Promise<Profile | null> => {
    if (!email) return null;
    const docRef = doc(db, "profiles", email);
    const docSnap = await getDocs(query(profilesCollection, where(documentId(), "==", email)));
    if (!docSnap.empty) {
        const doc = docSnap.docs[0];
        return { ...doc.data(), email: doc.id } as Profile;
    }
    return null;
}

export const saveProfileToFirestore = async (profile: Profile) => {
    const docRef = doc(db, "profiles", profile.email);
    await setDoc(docRef, profile);
}
