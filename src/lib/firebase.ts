

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
    enableNetwork,
    disableNetwork,
    getCountFromServer,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import type { Booking, Route, Profile, VideoPlayerState, Visit, ChatMessage } from "./types";
import { devFirebaseConfig } from "./firebase-config.dev";
import { prodFirebaseConfig } from "./firebase-config.prod";
import { format } from "date-fns";

// Your web app's Firebase configuration
const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_ENV === 'production' 
  ? prodFirebaseConfig 
  : devFirebaseConfig;


// Initialize Firebase
let app;
let db;
let auth;
let storage;


if (typeof window !== 'undefined') {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({ tabManager: undefined }) 
        });
        auth = getAuth(app);
        storage = getStorage(app);
    } catch(e) {
        console.error("Firebase initialization failed", e);
    }
}


const bookingsCollection = db ? collection(db, "bookings") : null;
const routesCollection = db ? collection(db, "routes") : null;
const profilesCollection = db ? collection(db, "profiles") : null;
const settingsCollection = db ? collection(db, "settings") : null;
const visitsCollection = db ? collection(db, "visits") : null;
const routeViewsCollection = db ? collection(db, "routeViews") : null;
const chatsCollection = db ? collection(db, "chats") : null;

// --- Chat ---
export const onChatMessagesFromFirestore = (rideId: string, callback: (messages: ChatMessage[]) => void) => {
    if (!chatsCollection) return () => {};
    
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

export const sendChatMessageToFirestore = async (rideId: string, senderEmail: string, text: string) => {
    if (!chatsCollection) return;
    const messagesCol = collection(db, "chats", rideId, "messages");
    await addDoc(messagesCol, {
        senderEmail,
        text,
        timestamp: serverTimestamp(),
    });
};


// --- Route Views ---
export const addRouteViewToFirestore = async (routeId: string, sessionId: string) => {
    if (!routeViewsCollection) return;
    // We create a unique ID based on routeId and sessionId to prevent counting the same session multiple times.
    const viewId = `${routeId}_${sessionId}`;
    const docRef = doc(db, "routeViews", viewId);
    await setDoc(docRef, { routeId, sessionId, timestamp: serverTimestamp() }, { merge: true });
};

export const getRouteViewsFromFirestore = async (routeId: string): Promise<number> => {
    if (!routeViewsCollection) return 0;
    try {
        const q = query(routeViewsCollection, where("routeId", "==", routeId));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch(e) {
        console.error("Error getting route views from Firestore", e);
        return 0;
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
export const getBookingFromFirestore = async (bookingId: string): Promise<Booking | null> => {
    if (!bookingsCollection) return null;
    try {
        const docRef = doc(db, "bookings", bookingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                id: docSnap.id,
                departureDate: data.departureDate?.toDate ? data.departureDate.toDate() : new Date(data.departureDate),
                returnDate: data.returnDate?.toDate ? data.returnDate.toDate() : new Date(data.returnDate),
            } as Booking;
        }
        return null;
    } catch(e) {
        console.error("Error getting booking from Firestore", e);
        return null;
    }
};

export const getBookingsFromFirestore = async (searchParams?: { destination?: string, date?: string, time?: string, userEmail?: string, role?: 'passenger' | 'owner' | 'admin', routeId?: string }): Promise<Booking[]> => {
    if (!bookingsCollection) return [];
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

export const onBookingsUpdateFromFirestore = (callback: (bookings: Booking[]) => void, searchParams?: { userEmail?: string, role?: 'passenger' | 'owner' | 'admin' }) => {
    if (!bookingsCollection) return () => {};

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
    if (!bookingsCollection || !routesCollection || !email) return null;
    
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

export const updateBookingInFirestore = async (bookingId: string, data: Partial<Booking>) => {
    if (!db) return;
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, data);
};


// --- Routes ---
export const getRouteFromFirestore = async (routeId: string): Promise<Route | null> => {
    if (!routesCollection || !routeId) return null;
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


export const getRoutesFromFirestore = async (searchParams?: { from?: string, to?: string, date?: string, promoted?: boolean, routeId?: string, ownerEmail?: string }): Promise<Route[]> => {
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
                    route.pickupPoints?.some(p => p.trim().toLowerCase() === searchFromLower)
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

export { app, db, auth, storage };



