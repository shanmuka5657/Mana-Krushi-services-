

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    type User
} from "firebase/auth";
import { auth } from './firebase';
import { saveProfile, getProfile } from './storage';
import type { Profile } from './types';

export const signUpWithEmail = async (name: string, email: string, password: string, mobile: string, role: 'owner' | 'passenger', referralCode?: string) => {
    if (!auth) throw new Error("Auth not initialized");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const newReferralCode = `${name.split(' ')[0].toLowerCase()}${Math.random().toString(36).substr(2, 4)}`;

    const finalRole = email === 'mana-krushi-admin@google.com' ? 'admin' : role;
    
    // Check if there was a referrer
    let referredByProfile: Profile | null = null;
    if (referralCode) {
        // This is a simplification. In a real app, you would query profiles by referralCode.
        // For this app, we'll assume a direct email lookup might work if the code is the user's email prefix.
        // A more robust solution would be a backend function or a Firestore query.
    }


    const newProfile: Profile = {
        name,
        email: user.email!,
        mobile: mobile,
        role: finalRole,
        referralCode: newReferralCode,
        referredBy: referralCode, // Save the code that was used.
    };
    await saveProfile(newProfile);

    return user;
};

export const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const profile = await getProfile(userCredential.user.email!);
    if (profile?.status === 'deleted') {
        await firebaseSignOut(auth);
        throw new Error("This account has been deleted.");
    }
    
    return userCredential.user;
};

export const signOut = async () => {
    if (!auth) throw new Error("Auth not initialized");
    await firebaseSignOut(auth);
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
    if (!auth) throw new Error("Auth not initialized");
    return firebaseOnAuthStateChanged(auth, callback);
};

export const getCurrentFirebaseUser = () => {
    if (!auth) throw new Error("Auth not initialized");
    return auth.currentUser;
}
