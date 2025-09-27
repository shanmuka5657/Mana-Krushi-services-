
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getFirestore, 
    initializeFirestore,
    persistentLocalCache,
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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: undefined }) 
});

const auth = getAuth(app);
const storage = getStorage(app);


export { 
    app, 
    db, 
    auth, 
    storage,
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
};
