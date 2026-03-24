import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION for Project: safevoice-6df0c
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAZVQ05Xa438wy8HuySmEJbah0xQIfOsgY",
  authDomain: "safevoice-6df0c.firebaseapp.com",
  projectId: "safevoice-6df0c",
  storageBucket: "safevoice-6df0c.firebasestorage.app",
  messagingSenderId: "1049963845626",
  appId: "1:1049963845626:web:40e7b3ed4d5799825e3643",
  measurementId: "G-PH93FQ9TFS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Messaging is only supported in secure contexts (HTTPS) or localhost
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("Firebase Messaging failed to initialize (requires HTTPS):", e);
}

export { messaging };
export default app;