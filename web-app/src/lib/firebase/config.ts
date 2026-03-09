import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeRecaptchaConfig } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Functions, getFunctions } from "firebase/functions";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const cloudFunctions: Functions = getFunctions(app, "europe-west1");
let analytics: Analytics | null = null;
let _recaptchaConfigReady: Promise<void> | null = null;

// Initialize Analytics only on client-side
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });

  // Enable reCAPTCHA Enterprise for Firebase Auth (phone sign-in)
  // Export promise so phone auth can await completion before sending OTP
  _recaptchaConfigReady = initializeRecaptchaConfig(auth)
    .then(() => {
      console.log("✅ reCAPTCHA Enterprise config loaded");
    })
    .catch((err) => {
      console.warn("⚠️ reCAPTCHA Enterprise config init failed:", err);
      // Don't throw — RecaptchaVerifier will fall back to standard v2
    });
}

export { _recaptchaConfigReady, analytics, app, auth, cloudFunctions, db, storage };

