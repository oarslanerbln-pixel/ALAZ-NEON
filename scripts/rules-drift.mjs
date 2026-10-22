// Canlı Firestore kuralları depodaki firestore.rules ile aynı mı?
//
// 21–22.10.2026'da kurallar testte yeşil ama canlıda eskiydi: deploy elle
// yapılıyordu ve unutulmuştu (denetim P8). Bu betik yalnızca OKUR: canlıda
// yayınlanmış (released) kural setini Firebase Rules API'sinden çeker ve
// depodakiyle karşılaştırır. Yazma yetkisi gerekmez (Firebase Rules Viewer).
//
// Kullanım: ACCESS_TOKEN=$(gcloud auth print-access-token) node scripts/rules-drift.mjs [projectId] [rulesFile]
// Çıkış kodu: 0 aynı, 1 fark var, 2 okunamadı.
import { readFileSync, appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const API = "https://firebaserules.googleapis.com/v1";

/** Satır sonu ve satır sonundaki boşluk farkları kayma sayılmasın. */
export function normalizeRules(source) {
  return (
    source
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim() + "\n"
  );
}

/** İlk farklı satır (1'den başlar) ve iki taraftaki içeriği; aynıysa null. */
export function firstDifference(live, repo) {
  const a = normalizeRules(live).trimEnd().split("\n");
  const b = normalizeRules(repo).trimEnd().split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) return { line: i + 1, live: a[i] ?? "(dosya bitti)", repo: b[i] ?? "(dosya bitti)" };
  }
  return null;
}

/** Varsayılan veritabanının yayındaki kural metni. */
export async function fetchLiveRules({ projectId, token, fetchImpl = fetch }) {
  const get = async (path) => {
    const res = await fetchImpl(`${API}/${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${await res.text()}`);
    return res.json();
  };
  const release = await get(`projects/${projectId}/releases/cloud.firestore`);
  if (!release.rulesetName) throw new Error("cloud.firestore yayınında rulesetName yok");
  const ruleset = await get(release.rulesetName);
  const files = ruleset.source?.files ?? [];
  if (files.length !== 1) throw new Error(`beklenen tek kural dosyası, gelen: ${files.length}`);
  return { content: files[0].content, rulesetName: release.rulesetName, updateTime: release.updateTime };
}

function defaultProject() {
  return JSON.parse(readFileSync(".firebaserc", "utf8")).projects.default;
}

async function main() {
  const [projectId = defaultProject(), rulesFile = "firestore.rules"] = process.argv.slice(2);
  const token = process.env.ACCESS_TOKEN;
  if (!token) {
    console.error("ACCESS_TOKEN yok (ör. gcloud auth print-access-token)");
    return 2;
  }
  let live;
  try {
    live = await fetchLiveRules({ projectId, token });
  } catch (err) {
    console.error(`Canlı kurallar okunamadı: ${err.message}`);
    return 2;
  }
  const diff = firstDifference(live.content, readFileSync(rulesFile, "utf8"));
  const summary = diff
    ? [
        `### ❌ Canlı Firestore kuralları depodan farklı (${projectId})`,
        "",
        `Yayındaki set: \`${live.rulesetName}\` (${live.updateTime ?? "?"})`,
        `İlk fark ${diff.line}. satırda:`,
        "",
        "```",
        `canlı: ${diff.live}`,
        `depo:  ${diff.repo}`,
        "```",
        "",
        "Çözüm: `main`'deki kuralları deploy edin (Actions → \"Firestore kuralları (canlı)\" → Run workflow).",
      ].join("\n")
    : `### ✅ Canlı Firestore kuralları depoyla aynı (${projectId}, \`${live.rulesetName}\`)`;
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
  return diff ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().then((code) => process.exit(code));
}
