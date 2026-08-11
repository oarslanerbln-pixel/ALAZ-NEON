import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Check if any config is missing
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

if (!isFirebaseConfigured) {
  console.error(
    "⚠️ FIREBASE ENV VARS MISSING! Check your .env.local file.",
    "\nVITE_FIREBASE_API_KEY:",
    firebaseConfig.apiKey ? "✅" : "❌",
    "\nVITE_FIREBASE_PROJECT_ID:",
    firebaseConfig.projectId ? "✅" : "❌"
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Anonymous auth gives every browser session a stable, unforgeable uid at
// zero cost (no Blaze plan needed) — Firestore rules use it to tell a room's
// host session apart from a player's, so a player can't just call
// updateDoc() on someone else's score from devtools. Requires Anonymous
// sign-in to be enabled in the Firebase console (Authentication > Sign-in
// method) — that's the one manual, still-free step this can't do for you.
export const auth = getAuth(app);

let authReadyPromise: Promise<User> | null = null;

export function ensureAnonymousAuth(): Promise<User> {
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            unsubscribe();
            resolve(user);
          }
        },
        (err) => {
          unsubscribe();
          reject(err);
        }
      );
      signInAnonymously(auth).catch((err) => {
        unsubscribe();
        reject(err);
      });
    });
  }
  return authReadyPromise;
}
