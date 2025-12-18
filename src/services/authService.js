import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

// Update user profile
export async function updateUserProfile(displayName) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        await updateProfile(user, { displayName });
        return { success: true, user: auth.currentUser };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign in with email/password
export async function signInWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Sign up with email/password
export async function signUpWithEmail(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Sign in with Google
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Sign out
export async function signOut() {
    try {
        await firebaseSignOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Listen for auth state changes
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Helper: Convert Firebase error codes to Arabic messages
function getErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'هذا البريد مستخدم من قبل',
        'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
        'auth/weak-password': 'كلمة المرور ضعيفة (6 أحرف على الأقل)',
        'auth/user-not-found': 'المستخدم غير موجود',
        'auth/wrong-password': 'كلمة المرور خاطئة',
        'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
        'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول',
        'auth/cancelled-popup-request': 'تم إلغاء عملية تسجيل الدخول',
    };
    return messages[code] || 'حدث خطأ، حاول مرة أخرى';
}
