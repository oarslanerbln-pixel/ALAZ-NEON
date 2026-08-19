import { initializeApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

/**
 * Firestore, kalıcı yerel önbellekle başlatılıyor.
 *
 * Oyun kafede oynanıyor ve kafe wifi'si güvenilir değil. Kalıcı önbellek iki
 * şey kazandırıyor: bağlantı koptuğunda okumalar önbellekten karşılanıyor
 * (ekran boşalmıyor) ve yazımlar kuyruğa girip bağlantı gelince kendiliğinden
 * gönderiliyor — cevabını gönderirken wifi titreyen oyuncu turu kaybetmiyor.
 *
 * `persistentMultipleTabManager`, host'un aynı odayı birden fazla sekmede
 * açması durumunda önbelleğin bozulmasını engelliyor.
 *
 * Kalıcı önbellek her ortamda kurulamıyor (gizli sekme, IndexedDB kapalı,
 * eski tarayıcı). Böyle bir durumda oyunu tamamen çökertmek yerine sade
 * yapılandırmaya düşüyoruz.
 */
function createFirestore() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (err) {
    console.warn(
      "[firebase] Kalıcı önbellek kurulamadı, çevrimiçi moda düşülüyor:",
      err,
    );
    return getFirestore(app);
  }
}

// Initialize Cloud Firestore and get a reference to the service
export const db = createFirestore();
export const auth = getAuth(app);
