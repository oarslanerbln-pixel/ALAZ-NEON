import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
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

// https://vite.dev/config/
export default defineConfig({
  define: {
    __LOCAL_IP__: JSON.stringify(localIp)
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
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
