
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    type User,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    type ConfirmationResult
} from "firebase/auth";
import { auth } from './firebase';
import { saveProfile, getProfile } from './storage';
import type { Profile } from './types';

export const signUpWithEmail = async (name: string, email: string, password: string, mobile: string, role: 'owner' | 'passenger', referralCode?: string, mobileVerified: boolean = false) => {
    if (!auth) throw new Error("Auth not initialized");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const newReferralCode = `${name.split(' ')[0].toLowerCase()}${Math.random().toString(36).substr(2, 4)}`;

    const finalRole = email === 'mana-krushi-admin@google.com' ? 'admin' : role;
    
    const newProfile: Profile = {
        name,
        email: user.email!,
        mobile: mobile,
        mobileVerified,
        role: finalRole,
        referralCode: newReferralCode,
        referredBy: referralCode,
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

// --- Phone Auth ---
export const getRecaptchaVerifier = (containerId: string) => {
    if (!auth) throw new Error("Auth not initialized");
    // Ensure this is only called on the client side
    if (typeof window !== 'undefined') {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
                'size': 'invisible'
            });
        }
        return (window as any).recaptchaVerifier;
    }
    return null;
}


export const sendOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    if (!auth) throw new Error("Auth not initialized");
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

export const confirmOtp = async (confirmationResult: ConfirmationResult, code: string) => {
    return await confirmationResult.confirm(code);
}
