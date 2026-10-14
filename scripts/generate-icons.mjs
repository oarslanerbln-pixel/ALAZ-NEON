#!/usr/bin/env node
/**
 * public/icon.svg'den PWA/iOS PNG ikonlarını üretir (docs/roadmap.md, 2.8).
 *
 * Kullanım:
 *   npm i --no-save sharp
 *   node scripts/generate-icons.mjs
 *
 * iOS ana ekran ikonu SVG kabul etmiyor (apple-touch-icon PNG olmalı);
 * Android kurulumu 192 ve 512 px PNG bekliyor. SVG "maskable" güvenli
 * alanına göre çizildi ("H" merkez %80'in içinde), aynı PNG maskable olarak
 * da kullanılabiliyor.
 */
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("sharp bulunamadı. Önce: npm i --no-save sharp");
  process.exit(1);
}

const svg = await readFile("public/icon.svg");
const outDir = path.join("public", "icons");
await mkdir(outDir, { recursive: true });

const ICONS = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const { file, size } of ICONS) {
  const out = path.join(outDir, file);
  await sharp(svg, { density: Math.ceil((72 * size) / 512) * 2 })
    .resize(size, size)
    .flatten({ background: "#030305" })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(out);
  console.log(`${file}: ${Math.round((await stat(out)).size / 1024)} KB`);
}
