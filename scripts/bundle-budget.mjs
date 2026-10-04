#!/usr/bin/env node
/**
 * Paket boyutu bütçesi (docs/roadmap.md, 2.6). `npm run build`'den sonra
 * çalışır; dist/ çıktısının gzip boyutlarını sınırlarla karşılaştırır.
 *
 * İlk yük (index.html'in doğrudan yüklediği JS + CSS) telefonun QR'ı
 * okuttuktan sonra beklediği süredir; bar Wi-Fi'ında her KB hissediliyor.
 * Sınırlar bugünkü değerlerin ~%5 üstünde: istemeden eklenen büyük bir
 * bağımlılık PR'ı kırar. Bir iyileştirme gelince sınır da aşağı çekilir
 * (2.3'te çekildi).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const KB = 1024;
const BUDGET = {
  /** index.html'in yüklediği tüm JS (giriş + modulepreload satıcı paketleri). */
  initialJs: 358 * KB,
  initialCss: 36 * KB,
  /** Uygulamanın kendi giriş paketi (2.3: 123 → 25 KB; hedef ≤ 80 KB). */
  entryJs: 27 * KB,
  /** Tembel yüklenen herhangi bir parça (en büyüğü bugün jspdf). */
  lazyChunk: 130 * KB,
};

const DIST = "dist";
const html = readFileSync(join(DIST, "index.html"), "utf8");
const gz = (file) => gzipSync(readFileSync(join(DIST, file)), { level: 9 }).length;

const entry = html.match(/<script[^>]+src="\/(assets\/[^"]+\.js)"/)?.[1];
if (!entry) {
  console.error("dist/index.html içinde giriş betiği bulunamadı — önce `npm run build`.");
  process.exit(2);
}
const preloads = [...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/(assets\/[^"]+\.js)"/g)].map(
  (m) => m[1],
);
const styles = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="\/(assets\/[^"]+\.css)"/g)].map(
  (m) => m[1],
);

const initial = new Set([entry, ...preloads, ...styles]);
const lazy = readdirSync(join(DIST, "assets"))
  .map((f) => `assets/${f}`)
  .filter((f) => f.endsWith(".js") && !initial.has(f));

const sum = (files) => files.reduce((total, f) => total + gz(f), 0);
const largestLazy = lazy.map((f) => ({ file: f, size: gz(f) })).sort((a, b) => b.size - a.size)[0];

const checks = [
  { name: "ilk yük JS", size: sum([entry, ...preloads]), budget: BUDGET.initialJs },
  { name: "ilk yük CSS", size: sum(styles), budget: BUDGET.initialCss },
  { name: `giriş paketi (${entry})`, size: gz(entry), budget: BUDGET.entryJs },
  {
    name: `en büyük tembel parça (${largestLazy?.file ?? "-"})`,
    size: largestLazy?.size ?? 0,
    budget: BUDGET.lazyChunk,
  },
];

let failed = false;
for (const c of checks) {
  const over = c.size > c.budget;
  failed ||= over;
  const fmt = (n) => `${(n / KB).toFixed(1)} KB`;
  console.log(`${over ? "AŞILDI" : "tamam "}  ${c.name}: ${fmt(c.size)} / ${fmt(c.budget)} gzip`);
}
if (failed) {
  console.error(
    "\nPaket bütçesi aşıldı. Büyük bağımlılığı tembel yükle (import()) ya da " +
      "bilinçli bir artışsa scripts/bundle-budget.mjs içindeki sınırı gerekçesiyle güncelle.",
  );
  process.exit(1);
}
