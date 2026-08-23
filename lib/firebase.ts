import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration (same as mobile app)
const firebaseConfig = {
  apiKey: "AIzaSyB27gSaURkTBef5_OK-zWvod0_iGDP7Kxo",
  authDomain: "solutionpastures-b5a20.firebaseapp.com",
  databaseURL: "https://solutionpastures-b5a20-default-rtdb.firebaseio.com",
  projectId: "solutionpastures-b5a20",
  storageBucket: "solutionpastures-b5a20.firebasestorage.app",
  messagingSenderId: "853275865378",
  appId: "1:853275865378:web:5c6d9498b9666a5330757b",
  measurementId: "G-WEP5B0QP5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
