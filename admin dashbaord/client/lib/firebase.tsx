// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA9kSguPzcPI5sY6D280JC8EbR9U39b2yc",
  authDomain: "lmssally-a0957.firebaseapp.com",
  projectId: "lmssally-a0957",
  storageBucket: "lmssally-a0957.firebasestorage.app",
  messagingSenderId: "996044244101",
  appId: "1:996044244101:web:854cfafe5f29da8f3195ec",
  measurementId: "G-H5ND1VZQ1R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Storage

export { app, analytics, auth, db, storage };