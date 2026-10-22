import { initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";

/**
 * Geliştirmedeki ekran önizlemesi (`/__screens`, bkz. src/dev/ScreenPreview).
 * Sahte oda verisiyle çalışır; üretim veritabanına hiçbir istek gitmesin diye
 * Firebase ulaşılamayan bir emülatöre bağlanır ve önbellek bellekte kalır
 * (kalıcı önbellekte kuyruğa giren bir yazım sonraki gerçek oturumda
 * üretime gönderilirdi).
 */
export const isScreenPreview =
  import.meta.env.DEV &&
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/__screens");

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

/**
 * Uçtan uca testler (Playwright, bkz. e2e/) yerel Firebase Emulator Suite'e
 * bağlanır. Yalnızca `demo-` önekli proje kimliğiyle açılır: emülatör bu
 * önekte gerçek bir projeye hiç dokunmaz, yanlışlıkla üretim yapılandırmasıyla
 * derlenen bir paket de kullanıcıları localhost'a yönlendiremez.
 */
const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "";
const firestoreEmulatorPort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080);
export const isEmulatorMode =
  emulatorHost !== "" && firebaseConfig.projectId.startsWith("demo-");

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
  if (isScreenPreview) {
    const previewDb = initializeFirestore(app, { localCache: memoryLocalCache() });
    connectFirestoreEmulator(previewDb, "127.0.0.1", 1);
    return previewDb;
  }
  if (isEmulatorMode) {
    // Kalıcı önbellek üretimdeki gibi açık kalır: test, kafe wifi'sinin
    // kopup geri gelmesini gerçek yapılandırmayla denesin.
    const e2eDb = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
    connectFirestoreEmulator(e2eDb, emulatorHost, firestoreEmulatorPort);
    return e2eDb;
  }
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
/**
 * `getAuth()` tarayıcıda açılır pencere/yönlendirme girişi için Google'ın
 * iframe'ini (auth/iframe.js + gapi, ~135 KB, iki ek alan adı) her sayfada
 * peşinen yüklüyor. Uygulamada popup/redirect girişi yok (anonim, e-posta,
 * telefon): aynı kalıcılıkla ama çözücüsüz başlatıyoruz. Telefonla katılan
 * misafir kafe wifi'sinde bu yükü indirmek zorunda kalmıyor.
 */
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
});
if (isScreenPreview) {
  connectAuthEmulator(auth, "http://127.0.0.1:1", { disableWarnings: true });
} else if (isEmulatorMode) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
}
