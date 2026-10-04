#!/usr/bin/env node
/**
 * Bağımlılık güvenlik kapısı (docs/roadmap.md, 2.6).
 *
 * Kullanıcıya giden (üretim) bağımlılıklarda "high" ve üstü her açık CI'ı
 * kırar. Upstream düzeltmesi olmayan ve uygulamayı etkilemediği doğrulanan
 * açıklar aşağıdaki listede GEREKÇE ve SON GÖZDEN GEÇİRME TARİHİ ile
 * tutulur; tarih geçince istisna kendiliğinden düşer ve kapı yeniden
 * kırmızı yanar — istisnalar unutulup kalıcılaşmasın diye.
 *
 * Geliştirme araçları (firebase-tools, vitest …) tarayıcıya gitmiyor; onlar
 * için `npm audit` çıktısı bilgi amaçlı basılır, kapı kırılmaz.
 */
import { spawnSync } from "node:child_process";

const BLOCKING = new Set(["high", "critical"]);

const ALLOWLIST = {
  "GHSA-m9gg-hp2v-232j": {
    package: "@grpc/grpc-js",
    reason:
      "firebase → @firebase/firestore → @grpc/grpc-js@1.9. grpc yalnızca Node " +
      "ortamında kullanılıyor; tarayıcı paketi WebChannel kullanır ve dist/ " +
      "içinde grpc yok. En güncel firebase de bu sürümü sabitliyor.",
    reviewBy: "2027-01-04",
  },
};

function audit(args) {
  const result = spawnSync("npm", ["audit", "--json", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  try {
    return JSON.parse(result.stdout);
  } catch {
    console.error("npm audit çıktısı okunamadı:\n" + (result.stderr || result.stdout));
    process.exit(2);
  }
}

/** Kök tavsiyeler: `via` içinde nesne olarak geçenler (diğerleri zincir halkası). */
function advisories(report) {
  const found = new Map();
  for (const [name, vuln] of Object.entries(report.vulnerabilities ?? {})) {
    for (const via of vuln.via) {
      if (typeof via !== "object") continue;
      const id = via.url?.split("/").pop() ?? String(via.source);
      found.set(id, { id, package: name, severity: via.severity, title: via.title, url: via.url });
    }
  }
  return [...found.values()];
}

const today = new Date().toISOString().slice(0, 10);
const production = advisories(audit(["--omit=dev"]));

const blocking = [];
const allowed = [];
for (const advisory of production.filter((a) => BLOCKING.has(a.severity))) {
  const exception = ALLOWLIST[advisory.id];
  if (exception && exception.reviewBy >= today) allowed.push({ ...advisory, exception });
  else blocking.push({ ...advisory, expired: Boolean(exception) });
}

for (const a of allowed) {
  console.log(`istisna  ${a.id} (${a.package}, ${a.severity}) — gözden geçir: ${a.exception.reviewBy}`);
}
const stale = Object.keys(ALLOWLIST).filter(
  (id) => !production.some((a) => a.id === id && BLOCKING.has(a.severity)),
);
for (const id of stale) {
  console.log(`not      ${id} artık raporlanmıyor; istisna listesinden çıkarılabilir.`);
}

const dev = audit([]).metadata?.vulnerabilities ?? {};
console.log(
  `bilgi    geliştirme dahil tüm bağımlılıklar: ${dev.critical ?? 0} critical, ${dev.high ?? 0} high, ` +
    `${dev.moderate ?? 0} moderate (kapıyı kırmaz)`,
);

if (blocking.length > 0) {
  console.error("\nÜretim bağımlılıklarında engelleyici açık:");
  for (const a of blocking) {
    const note = a.expired ? " [istisna süresi doldu — yeniden değerlendir]" : "";
    console.error(`  ${a.id} ${a.package} (${a.severity}) ${a.title}${note}\n    ${a.url}`);
  }
  process.exit(1);
}
console.log("tamam    üretim bağımlılıklarında engelleyici açık yok.");
