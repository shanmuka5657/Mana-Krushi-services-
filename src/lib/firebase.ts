
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
import { devFirebaseConfig } from "./firebase-config.dev";
import { prodFirebaseConfig } from "./firebase-config.prod";

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

export { app, db, auth, storage };
