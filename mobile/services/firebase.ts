// Firebase configuration for React Native
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

// Firebase configuration (same as web)
const firebaseConfig = {
    apiKey: "AIzaSyD0ui4PQq5gBgLJvvRERkcaJTklrE5LiPA",
    authDomain: "omangame-b024e.firebaseapp.com",
    projectId: "omangame-b024e",
    storageBucket: "omangame-b024e.appspot.com",
    messagingSenderId: "824811009546",
    appId: "1:824811009546:web:1401a6114a8c0d414c91f3",
    measurementId: "G-9LXKXLWBV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth with React Native persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
