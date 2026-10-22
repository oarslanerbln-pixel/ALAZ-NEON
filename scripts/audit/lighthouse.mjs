// Lighthouse ölçümü: her sayfa × (mobil, masaüstü) × N tekrar, medyan raporlanır.
// Kullanım: node scripts/audit/lighthouse.mjs <baseUrl> <outDir> [runs] [path...]
// Tarayıcı: CHROME_PATH (yoksa Lighthouse'un bulduğu Chrome).
// Canlı siteye yalnızca sayfa açar; oda/oyuncu oluşturmaz.
// LH_BLOCK="desen1,desen2": bu istekleri engeller (yerel önce/sonra
// karşılaştırmasında üretim Auth/Firestore'a hiç gidilmesin diye).
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [base, outDir, runsArg, ...pathsArg] = process.argv.slice(2);
if (!base || !outDir) {
  console.error("kullanım: node scripts/audit/lighthouse.mjs <baseUrl> <outDir> [runs] [path...]");
  process.exit(1);
}
const runs = Number(runsArg ?? 3);
const paths = pathsArg.length ? pathsArg : ["/join", "/host/setup"];
mkdirSync(outDir, { recursive: true });

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const rows = [];
for (const path of paths) {
  for (const preset of ["mobile", "desktop"]) {
    const metrics = [];
    for (let i = 0; i < runs; i++) {
      const slug = `${path.replace(/[^a-z0-9]+/gi, "_")}_${preset}_${i}`;
      const out = join(outDir, `${slug}.json`);
      const args = [
        "--yes", "lighthouse@12.8.2", base + path,
        "--output=json", `--output-path=${out}`, "--quiet",
        "--only-categories=performance",
        "--chrome-flags=--headless=new --no-sandbox",
      ];
      if (preset === "desktop") args.push("--preset=desktop");
      for (const pat of (process.env.LH_BLOCK ?? "").split(",").filter(Boolean)) {
        args.push(`--blocked-url-patterns=${pat}`);
      }
      execFileSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
      const lhr = JSON.parse(readFileSync(out, "utf8"));
      const a = lhr.audits;
      metrics.push({
        score: Math.round(lhr.categories.performance.score * 100),
        lcp: a["largest-contentful-paint"].numericValue,
        fcp: a["first-contentful-paint"].numericValue,
        tbt: a["total-blocking-time"].numericValue,
        cls: a["cumulative-layout-shift"].numericValue,
        bytes: a["total-byte-weight"].numericValue,
      });
    }
    const pick = (k) => median(metrics.map((m) => m[k]));
    rows.push({
      path, preset, runs,
      score: pick("score"),
      lcp_ms: Math.round(pick("lcp")),
      fcp_ms: Math.round(pick("fcp")),
      tbt_ms: Math.round(pick("tbt")),
      cls: Number(pick("cls").toFixed(3)),
      kb: Math.round(pick("bytes") / 1024),
    });
  }
}
console.table(rows);
console.log(JSON.stringify(rows));
