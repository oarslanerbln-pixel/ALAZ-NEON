import { defineConfig, devices } from "@playwright/test";

/**
 * Uçtan uca testler (docs/roadmap.md, 2.1): bir TV (host) ve birden fazla
 * telefon (oyuncu) aynı odada, Firestore ve Auth emulator'üne karşı.
 *
 * Çalıştırma: `npm run test:e2e` — uygulamayı e2e kipinde derler (.env.e2e),
 * emulator'leri başlatır ve testleri koşar. Testler aynı emulator durumunu
 * paylaştığı için sırayla (tek işçi) çalışır; her test başında durum sıfırlanır.
 *
 * Playwright sürümü (1.56.1) bilerek sabit: CI aynı Chromium sürümünü
 * indiriyor, bulut geliştirme ortamında önceden kurulu olan da bu.
 */
const PORT = 4175;

export default defineConfig({
  testDir: "e2e",
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `npx vite preview --mode e2e --outDir dist-e2e --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
