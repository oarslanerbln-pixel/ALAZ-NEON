import { defineConfig } from "vitest/config";

/**
 * Firestore güvenlik kuralı testleri için ayrı yapılandırma.
 *
 * Bileşen testlerinden ayrı tutuluyor çünkü bunlar jsdom değil node
 * ortamında ve Firestore emulator'üne karşı çalışıyor. Ana vite.config.ts
 * yalnızca `src/**` altını topladığı için buradaki `test/` dizini oraya
 * karışmıyor.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.{test,spec}.ts"],
    // Emulator başlangıcı ilk testte biraz yavaş olabiliyor.
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
