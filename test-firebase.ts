
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

async function test() {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
    console.log("Config loaded:", firebaseConfig.projectId);
    
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: firebaseConfig.projectId,
    }, 'test-app');
    
    console.log("Firebase Admin initialized successfully");
    process.exit(0);
  } catch (e: any) {
    console.error("Firebase Admin initialization failed:", e.message);
    process.exit(1);
  }
}

test();
