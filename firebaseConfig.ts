import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { getAnalytics, isSupported } from "firebase/analytics";
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize Analytics if supported
let analytics = null;
isSupported().then(yes => {
  if (yes) analytics = getAnalytics(app);
});

// Use the specific firestoreDatabaseId if provided in the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Messaging is only supported in secure contexts (HTTPS) or localhost
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("Firebase Messaging failed to initialize (requires HTTPS):", e);
}

export { messaging, analytics };
export default app;
