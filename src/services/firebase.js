import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD0ui4PQq5gBgLJvvRERkcaJTklrE5LiPA",
    authDomain: "omangame-b024e.firebaseapp.com",
    projectId: "omangame-b024e",
    storageBucket: "omangame-b024e.firebasestorage.app",
    messagingSenderId: "824811009546",
    appId: "1:824811009546:web:1401a6114a8c0d414c91f3",
    measurementId: "G-9LXKXLWBV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (for future use)
export const auth = getAuth(app);
