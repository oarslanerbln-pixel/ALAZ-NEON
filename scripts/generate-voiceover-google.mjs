/**
 * HENGAME — Google Cloud TTS ile Almanca spiker paketi (tek seferlik üretim)
 *
 * ElevenLabs'e alternatif: Chirp 3 HD (doğal, hazır sesler) ya da Gemini TTS
 * (tonlama Almanca bir sahne yönergesiyle yönetilir). Çalışma anında TTS
 * çağrısı YOK; çıktılar public/audio/vo/de/ altına sabit .mp3 olarak girer.
 *
 * Kimlik: önce GOOGLE_TTS_ACCESS_TOKEN (ör. `gcloud auth print-access-token`),
 * yoksa giriş yapılmış Firebase CLI oturumu (eski Google paketiyle aynı yol).
 * Faturalama projesi: GOOGLE_TTS_PROJECT ya da alaz-neon-web.
 *
 *   node scripts/generate-voiceover-google.mjs --dry
 *   node scripts/generate-voiceover-google.mjs --compare night_open
 *   node scripts/generate-voiceover-google.mjs --all --engine gemini-pro --voice Charon
 *
 * Bütçe: --budget (varsayılan 3000 karakter) tüm çalıştırmaların toplamını
 * sınırlar; defter scripts/.voiceover-ledger-google.json (git dışı).
 * Tahmini tutar: Chirp 3 HD 30 $/1M karakter, Gemini TTS çıktı süresine göre;
 * tüm paket birkaç sent.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { LINES } from "./voiceover-lines.mjs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public/audio/vo/de");
const SAMPLE_DIR = path.join(ROOT, ".voiceover-samples");
const LEDGER = path.join(__dirname, ".voiceover-ledger-google.json");
const PROJECT = process.env.GOOGLE_TTS_PROJECT || "alaz-neon-web";

const BASE_PROMPT =
  "Du bist ein charismatischer, warmer Moderator in einer Berliner Bar am Abend. " +
  "Sprich natürlich und souverän, mit einem Lächeln in der Stimme – nie übertrieben oder schreiend.";

// ElevenLabs-etiketinin Gemini'deki karşılığı: satır başına ton yönergesi.
const TAG_STYLE = {
  "[excited]": "Klinge begeistert und mitreißend.",
  "[whispers]": "Sprich leise und geheimnisvoll, fast flüsternd.",
  "[laughs]": "Klinge amüsiert, mit einem kurzen Lacher, aber freundlich.",
  "[curious]": "Klinge neugierig und baue leichte Spannung auf.",
};

const ENGINES = {
  chirp3: (voice) => ({ languageCode: "de-DE", name: `de-DE-Chirp3-HD-${voice}` }),
  "gemini-pro": (voice) => ({ languageCode: "de-DE", name: voice, modelName: "gemini-2.5-pro-tts" }),
  "gemini-flash": (voice) => ({ languageCode: "de-DE", name: voice, modelName: "gemini-2.5-flash-tts" }),
};

// --compare: aynı satırın aday sesleri (karar için yan yana dinlenir).
const COMPARE = [
  ["chirp3", "Charon"],
  ["chirp3", "Fenrir"],
  ["chirp3", "Puck"],
  ["chirp3", "Algieba"],
  ["gemini-pro", "Charon"],
  ["gemini-pro", "Fenrir"],
];

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, "");
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

async function accessToken() {
  if (process.env.GOOGLE_TTS_ACCESS_TOKEN) return process.env.GOOGLE_TTS_ACCESS_TOKEN;
  const { configstore } = require("../node_modules/firebase-tools/lib/configstore");
  const { getAccessToken } = require("../node_modules/firebase-tools/lib/auth");
  const tokens = configstore.get("tokens");
  if (!tokens?.refresh_token) throw new Error("Firebase CLI girişi yok: `npx firebase login` ya da GOOGLE_TTS_ACCESS_TOKEN.");
  const tok = await getAccessToken(tokens.refresh_token, ["https://www.googleapis.com/auth/cloud-platform"]);
  return tok.access_token;
}

function requestBody(line, engine, voice) {
  const input = { text: line.text };
  if (engine.startsWith("gemini")) {
    input.prompt = [BASE_PROMPT, TAG_STYLE[line.tags] ?? ""].join(" ").trim();
  }
  return { input, voice: ENGINES[engine](voice), audioConfig: { audioEncoding: "MP3", sampleRateHertz: 44100 } };
}

async function synthesize(token, body) {
  const res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "X-Goog-User-Project": PROJECT, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.audioContent) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return Buffer.from(json.audioContent, "base64");
}

function readLedger() {
  try { return JSON.parse(fs.readFileSync(LEDGER, "utf8")); }
  catch { return { spent: 0, log: [] }; }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const budget = Number(args.budget ?? 3000);

  /** @type {{ line: typeof LINES[number], engine: string, voice: string, file: string }[]} */
  let jobs;
  if (args.compare) {
    const line = LINES.find((l) => l.id === args.compare);
    if (!line) throw new Error(`Satır yok: ${args.compare}`);
    fs.mkdirSync(SAMPLE_DIR, { recursive: true });
    jobs = COMPARE.map(([engine, voice]) => ({ line, engine, voice, file: path.join(SAMPLE_DIR, `${line.id}.${engine}.${voice}.mp3`) }));
  } else if (args.all || args.dry) {
    const engine = typeof args.engine === "string" ? args.engine : "gemini-pro";
    const voice = typeof args.voice === "string" ? args.voice : "Charon";
    if (!ENGINES[engine]) throw new Error(`Motor yok: ${engine} (${Object.keys(ENGINES).join(", ")})`);
    const only = typeof args.only === "string" ? new Set(args.only.split(",")) : null;
    jobs = LINES.filter((l) => !only || only.has(l.id)).map((line) => ({ line, engine, voice, file: path.join(OUTPUT_DIR, `${line.id}.mp3`) }));
  } else {
    console.log("Komut yok. --dry | --compare <id> | --all [--engine e] [--voice v] [--only id,id]");
    return;
  }

  const planned = jobs.reduce((n, j) => n + j.line.text.length, 0);
  if (args.dry) {
    for (const j of jobs) console.log(`${j.line.id.padEnd(15)} ${j.line.text}`);
    console.log(`\n${jobs.length} satır, ${planned} karakter (Chirp 3 HD ile ≈ ${(planned * 30e-6).toFixed(3)} $).`);
    return;
  }

  const ledger = readLedger();
  if (ledger.spent + planned > budget) {
    throw new Error(`Bütçe aşılır: harcanan ${ledger.spent} + planlanan ${planned} > ${budget} karakter. Durdu.`);
  }

  const token = await accessToken();
  if (args.all) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`${jobs.length} istek, ${planned} karakter, proje ${PROJECT}.`);
  for (const j of jobs) {
    try {
      const audio = await synthesize(token, requestBody(j.line, j.engine, j.voice));
      fs.writeFileSync(j.file, audio);
      ledger.spent += j.line.text.length;
      ledger.log.push({ at: new Date().toISOString(), id: j.line.id, engine: j.engine, voice: j.voice, chars: j.line.text.length });
      fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
      console.log(`  ✓ ${path.relative(ROOT, j.file)}  ${(audio.length / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.log(`  ✗ ${j.engine}/${j.voice} ${j.line.id}: ${err.message}`);
    }
  }
  console.log(`Toplam: ${ledger.spent} / ${budget} karakter.`);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
