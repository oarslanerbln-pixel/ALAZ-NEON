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

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  define: {
    // Yalnızca `npm run dev --host` için: laptop'ta localhost'tan açılan TV,
    // QR'da telefonun ulaşabileceği LAN IP'sini göstersin. Derlemeye
    // yazılmıyor: hem derleme makinesinin IP'si pakete sızıyordu (denetim
    // D7), hem de 127.0.0.1'e bağlı `vite preview` (E2E) QR'ı erişilemeyen
    // LAN adresine yönlendirip bütün katılımları düşürüyordu.
    __LOCAL_IP__: JSON.stringify(command === 'serve' ? getLocalIP() : ''),
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
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-firebase": ["firebase/app", "firebase/firestore"],
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
  },
}))
