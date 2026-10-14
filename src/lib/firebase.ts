import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";

import { appCheckSetup } from "./appCheckSetup";
import { createLogger } from "./logger";

const log = createLogger("firebase");

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
  log.error(
    "⚠️ FIREBASE ENV VARS MISSING! Check your .env.local file.",
    "\nVITE_FIREBASE_API_KEY:",
    firebaseConfig.apiKey ? "✅" : "❌",
    "\nVITE_FIREBASE_PROJECT_ID:",
    firebaseConfig.projectId ? "✅" : "❌"
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// App Check, Firestore ilk isteğini göndermeden önce kurulmalı: yoksa ilk
// istekler jetonsuz gider ve zorunlu kılındığında reddedilir. Site anahtarı
// tanımlı değilse kurulmaz (bkz. lib/appCheckSetup.ts).
const appCheck = appCheckSetup({
  siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
  debugToken: import.meta.env.VITE_APPCHECK_DEBUG_TOKEN,
  dev: import.meta.env.DEV,
});
if (appCheck) {
  if (appCheck.debugToken !== null) {
    (globalThis as typeof globalThis & { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean })
      .FIREBASE_APPCHECK_DEBUG_TOKEN = appCheck.debugToken;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheck.siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

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
    log.warn("Kalıcı önbellek kurulamadı, çevrimiçi moda düşülüyor:",
      err,
    );
    return getFirestore(app);
  }
}

// Initialize Cloud Firestore and get a reference to the service
export const db = createFirestore();
export const auth = getAuth(app);

// Uçtan uca testler (e2e/) uygulamayı Firestore ve Auth emulator'üne bağlıyor
// (.env.e2e). Üretim yapılandırmasında bu değişken yok; bağlantı kurulmaz.
const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST;
if (emulatorHost) {
  connectFirestoreEmulator(db, emulatorHost, 8080);
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
}
