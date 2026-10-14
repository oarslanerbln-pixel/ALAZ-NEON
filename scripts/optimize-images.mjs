#!/usr/bin/env node
/**
 * Arka plan görsellerini AVIF + WebP'ye çevirir (docs/roadmap.md, 2.2).
 *
 * Kullanım:
 *   npm i --no-save sharp
 *   node scripts/optimize-images.mjs <kaynak-klasör>
 *
 * <kaynak-klasör> aşağıdaki listedeki özgün dosyaları (jpg/png) içerir;
 * çıktılar public/ altına yazılır. Özgün dosyalar depoda tutulmuyor
 * (yalnızca git geçmişinde): yeni bir görsel eklerken özgününü buraya
 * listeleyip betiği çalıştır, public/'e yalnızca çıktıları koy.
 *
 * sharp bağımlılık olarak eklenmedi: yerel ikili paket indiriyor ve
 * yalnızca görsel değişince gerekiyor. `npm ci` ve CI ondan etkilenmiyor.
 *
 * Bütçe (src/lib/__tests__/publicAssets.test.ts denetler): her görsel
 * ≤ 150 KB, public/ toplamı < 4 MB.
 */
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

/** Ekranda en fazla bu genişlikte görünüyorlar; büyüğü indirmek israf. */
const IMAGES = [
  // TV ve telefon arka plan karuseli (BackgroundSlider)
  { source: "bg-shisha-1.jpg", name: "bg-shisha-1", maxWidth: 1920 },
  { source: "bg-shisha-2.jpg", name: "bg-shisha-2", maxWidth: 1920 },
  { source: "bg-shisha-3.jpg", name: "bg-shisha-3", maxWidth: 1920 },
  { source: "bg-shisha-4.jpg", name: "bg-shisha-4", maxWidth: 1920 },
  // Telefon bekleme/sonuç ekranları (PlayerBackground)
  { source: "player-bg-1.png", name: "player-bg-1", maxWidth: 1080 },
  { source: "player-bg-2.png", name: "player-bg-2", maxWidth: 1080 },
  { source: "player-bg-3.png", name: "player-bg-3", maxWidth: 1080 },
];

// Görseller %60–90 opaklıkta, gradyan katmanlarının altında duruyor:
// bu kaliteler gözle ayırt edilemiyor, boyut ise ~10 kat düşüyor.
const AVIF = { quality: 50, effort: 6 };
const WEBP = { quality: 65, effort: 6 };

const [, , sourceDir] = process.argv;
if (!sourceDir) {
  console.error("Kullanım: node scripts/optimize-images.mjs <kaynak-klasör>");
  process.exit(1);
}

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("sharp bulunamadı. Önce: npm i --no-save sharp");
  process.exit(1);
}

const outDir = path.resolve("public");
await mkdir(outDir, { recursive: true });

for (const image of IMAGES) {
  const input = path.join(sourceDir, image.source);
  const pipeline = () =>
    sharp(input).rotate().resize({ width: image.maxWidth, withoutEnlargement: true });

  const avifPath = path.join(outDir, `${image.name}.avif`);
  const webpPath = path.join(outDir, `${image.name}.webp`);
  await pipeline().avif(AVIF).toFile(avifPath);
  await pipeline().webp(WEBP).toFile(webpPath);

  const kb = async (file) => Math.round((await stat(file)).size / 1024);
  console.log(`${image.name}: avif ${await kb(avifPath)} KB, webp ${await kb(webpPath)} KB`);
}
