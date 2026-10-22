// Üretim derlemesinin paket boyutları: ilk yük (index.html'in doğrudan
// yüklediği JS/CSS) ve rota/oyun başına lazy chunk'lar. Ham ve gzip.
// Kullanım: npm run build && node scripts/audit/bundle-size.mjs [distDir]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const dist = process.argv[2] ?? "dist";
const assets = join(dist, "assets");
const kb = (n) => Math.round(n / 102.4) / 10;

const files = readdirSync(assets)
  .filter((f) => /\.(js|css)$/.test(f))
  .map((f) => {
    const buf = readFileSync(join(assets, f));
    return { file: f, raw: statSync(join(assets, f)).size, gz: gzipSync(buf, { level: 9 }).length };
  })
  .sort((a, b) => b.gz - a.gz);

const html = readFileSync(join(dist, "index.html"), "utf8");
const initialNames = new Set([...html.matchAll(/assets\/([^"']+\.(?:js|css))/g)].map((m) => m[1]));
const initial = files.filter((f) => initialNames.has(f.file));
const sum = (xs, k) => xs.reduce((a, x) => a + x[k], 0);

console.log(`İlk yük (index.html): ${initial.length} dosya, ${kb(sum(initial, "raw"))} KB ham, ${kb(sum(initial, "gz"))} KB gzip`);
for (const f of initial) console.log(`  ${f.file.padEnd(48)} ${String(kb(f.raw)).padStart(8)} KB  ${String(kb(f.gz)).padStart(7)} KB gz`);
console.log(`\nTüm JS/CSS: ${files.length} dosya, ${kb(sum(files, "raw"))} KB ham, ${kb(sum(files, "gz"))} KB gzip`);
console.log("\nEn büyük 25 chunk:");
for (const f of files.slice(0, 25)) console.log(`  ${f.file.padEnd(48)} ${String(kb(f.raw)).padStart(8)} KB  ${String(kb(f.gz)).padStart(7)} KB gz`);
console.log(JSON.stringify({ initial: initial.map((f) => ({ ...f })), all: files }));
