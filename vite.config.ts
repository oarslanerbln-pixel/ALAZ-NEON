import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { execSync } from 'child_process'
import os from 'os'

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIP();

/**
 * Sürüm kimliği (docs/roadmap.md, 2.4): Sentry'deki her hata hangi yayından
 * geldiğini bilsin. Vercel ve GitHub Actions commit'i ortamdan veriyor.
 */
function appRelease(): string {
  const sha = process.env.VITE_APP_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
  if (sha) return `hengame@${sha.slice(0, 12)}`;
  try {
    return `hengame@${execSync('git rev-parse --short=12 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()}`;
  } catch {
    return 'hengame@dev';
  }
}

const release = appRelease();

// Kaynak haritaları yalnızca Sentry'ye yüklenecekse üretilir ("hidden": JS
// dosyası haritaya işaret etmez) ve yüklemeden sonra dist/'ten silinir —
// yayına çıkıp kaynak kodu herkese açmasın. Üç değişken de yoksa hiçbiri
// olmaz (yerel geliştirme, CI, e2e). Token yalnızca derleme ortamında durur.
const sentryUpload = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

// https://vite.dev/config/
export default defineConfig({
  define: {
    __LOCAL_IP__: JSON.stringify(localIp),
    'import.meta.env.VITE_APP_RELEASE': JSON.stringify(release),
  },
  plugins: [
    react(),
    tailwindcss(),
    ...(sentryUpload
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: { name: release },
            sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
            telemetry: false,
          }),
        ]
      : []),
  ],
  build: {
    sourcemap: sentryUpload ? 'hidden' : false,
    // Satıcı kütüphanelerini ayır: uygulama kodu değişince
    // tarayıcı react/firebase/motion chunk'larını yeniden indirmez.
    rollupOptions: {
      output: {
        manualChunks: {
          // react-dom/client ve firebase/auth ayrı giriş noktaları: listelenmezse
          // uygulamanın giriş paketine düşüp her yayında yeniden indiriliyordu.
          "vendor-react": ["react", "react-dom", "react-dom/client", "react-router-dom"],
          "vendor-firebase": ["firebase/app", "firebase/firestore", "firebase/app-check", "firebase/auth"],
          "vendor-motion": ["framer-motion"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    // CI kapısı (docs/roadmap.md, 2.6): saf oyun mantığı src/lib'de yaşıyor
    // ve birim testle korunuyor. `npm run test:coverage` eşiğin altında kırmızı.
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: [
        'src/lib/**/__tests__/**',
        // Tarayıcı/SDK bağlamaları — mantık içermiyor; uçtan uca testler kapsıyor.
        'src/lib/firebase.ts',
        'src/lib/soundSynth.ts',
      ],
      reporter: ['text-summary', 'json-summary'],
      // Satır/ifade hedefi %80 (yol haritası). Diğer ikisi mevcut düzeyin
      // biraz altında: belirgin bir düşüş PR'ı kırar; yükseldikçe artırılır.
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 85,
        branches: 70,
      },
    },
  },
})
