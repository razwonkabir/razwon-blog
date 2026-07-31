/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration for Auth (Google Sign-In)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBPR2H5YkmzxmiTjRrmZ6yd9XR8EvdTI-A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "famim-blog.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "famim-blog",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "famim-blog.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "366979280067",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:366979280067:web:94ceb95d0a86f7203f0676"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider };

