import { defineConfig } from "@playwright/test";

/**
 * Uçtan uca kafe senaryosu (bkz. e2e/README.md).
 *
 * Uygulama `demo-` projeyle derlenip yerel Firebase Emulator Suite'e
 * (Auth 9099, Firestore 8080) bağlanır; Firestore trafiği okuma/yazma
 * sayan bir vekil (8081) üzerinden geçer. Testler üretim verisine ve
 * ücretli ses servislerine dokunmaz: localhost dışındaki her istek
 * e2e/support/fixtures.ts içinde engellenir.
 *
 * Emülatörleri `npm run test:e2e` başlatır (firebase emulators:exec).
 */
export const E2E_PROJECT_ID = "demo-hurrem-e2e";
const PORT = 4173;

const appEnv = {
  VITE_FIREBASE_API_KEY: "demo-api-key",
  VITE_FIREBASE_AUTH_DOMAIN: "127.0.0.1",
  VITE_FIREBASE_PROJECT_ID: E2E_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: "",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "0",
  VITE_FIREBASE_APP_ID: "demo-app",
  VITE_FIREBASE_EMULATOR_HOST: "127.0.0.1",
  VITE_FIRESTORE_EMULATOR_PORT: "8081",
  // Yerel .env.local'daki Sentry DSN'i test derlemesine sızmasın.
  VITE_SENTRY_DSN: "",
};

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e-results/artifacts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  timeout: 5 * 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "e2e-results/report", open: "never" }],
    ["json", { outputFile: "e2e-results/results.json" }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
  },
  projects: [
    { name: "kafe", testIgnore: /measure\.spec\.ts/ },
    // Ölçüm turu ayrı: `npm run test:e2e:measure` (rapor: e2e-results/metrics.json).
    { name: "measure", testMatch: /measure\.spec\.ts/ },
  ],
  webServer: [
    {
      command: "node e2e/support/firestore-meter.mjs",
      url: "http://127.0.0.1:8081/__meter",
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
    },
    {
      command: `npm run build:e2e && npx vite preview --outDir dist-e2e --host 127.0.0.1 --port ${PORT} --strictPort`,
      url: `http://127.0.0.1:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: appEnv,
    },
  ],
});
