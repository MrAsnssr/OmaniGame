import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithCredential,
    User
} from 'firebase/auth';
import { auth } from './firebase';

// Google Sign-In will be handled via expo-auth-session
// For now, we support email/password auth

export async function updateUserProfile(displayName: string) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        await updateProfile(user, { displayName });
        return { success: true, user: auth.currentUser };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function signInWithEmail(email: string, password: string) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error: any) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

export async function signUpWithEmail(email: string, password: string) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error: any) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Google Sign-In using credential from expo-auth-session
export async function signInWithGoogleCredential(idToken: string) {
    try {
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        return { success: true, user: result.user };
    } catch (error: any) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

export async function signOut() {
    try {
        await firebaseSignOut(auth);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
    return auth.currentUser;
}

// Arabic error messages
function getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
        'auth/email-already-in-use': 'هذا البريد مستخدم من قبل',
        'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
        'auth/weak-password': 'كلمة المرور ضعيفة (6 أحرف على الأقل)',
        'auth/user-not-found': 'المستخدم غير موجود',
        'auth/wrong-password': 'كلمة المرور خاطئة',
        'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
    };
    return messages[code] || 'حدث خطأ، حاول مرة أخرى';
}
