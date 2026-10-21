/**
 * HENGAME — ElevenLabs Almanca spiker paketi (tek seferlik üretim betiği)
 *
 * Çalışma anında ElevenLabs çağrısı YOK: bu betik satırları bir kez sentezler,
 * dosyalar public/audio/vo/de/ altına sabit .mp3 olarak repoya girer. Anahtar
 * yalnızca geliştiricinin makinesindeki .env.local'da durur (git'e girmez).
 *
 * .env.local:
 *   ELEVENLABS_API_KEY=...
 *   ELEVENLABS_VOICE_ID=...          (seçilen ses; --voice ile de verilebilir)
 *   ELEVENLABS_MODEL_ID=eleven_v3    (isteğe bağlı)
 *
 * Komutlar (ücretsiz olanlar kredi harcamaz):
 *   node scripts/generate-voiceover.mjs --quota                 ücretsiz: kalan kredi
 *   node scripts/generate-voiceover.mjs --voices [arama]        ücretsiz: Almanca ses adayları + önizleme linki
 *   node scripts/generate-voiceover.mjs --sample <id> [--model m] [--voice v] [--out dir]
 *   node scripts/generate-voiceover.mjs --all [--only id,id]    seri üretim → public/audio/vo/de/
 *   node scripts/generate-voiceover.mjs --dry                   ücretsiz: satırlar ve tahmini kredi
 *
 * Bütçe: --budget (varsayılan 3000) bu betiğin TÜM çalıştırmalarında harcanan
 * toplam krediyi sınırlar; harcama scripts/.voiceover-ledger.json'da (git dışı)
 * tutulur. Sınırı aşacak istek gönderilmeden durulur.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LINES } from "./voiceover-lines.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public/audio/vo/de");
const SAMPLE_DIR = path.join(ROOT, ".voiceover-samples");
const LEDGER = path.join(__dirname, ".voiceover-ledger.json");
const API = "https://api.elevenlabs.io";

// Kredi/karakter çarpanı (ElevenLabs fiyat sayfası): flash/turbo yarım kredi.
const CREDIT_RATE = { eleven_flash_v2_5: 0.5, eleven_turbo_v2_5: 0.5 };
const creditRate = (model) => CREDIT_RATE[model] ?? 1;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { args._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function loadEnv(file) {
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(ELEVENLABS_[A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function readLedger() {
  try { return JSON.parse(fs.readFileSync(LEDGER, "utf8")); }
  catch { return { spent: 0, log: [] }; }
}

function writeLedger(ledger) {
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
}

function payloadText(line, model) {
  return model === "eleven_v3" && line.tags ? `${line.tags} ${line.text}` : line.text;
}

function voiceSettings(model) {
  // v3 yalnız 0 / 0.5 / 1 kararlılık kabul eder (Creative / Natural / Robust).
  if (model === "eleven_v3") return { stability: 0.5, similarity_boost: 0.8 };
  return { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true };
}

async function api(key, pathname, init = {}) {
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: { "xi-api-key": key, ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${pathname}: ${(await res.text()).slice(0, 400)}`);
  return res;
}

async function quota(key) {
  const s = await (await api(key, "/v1/user/subscription")).json();
  return {
    tier: s.tier,
    used: s.character_count,
    limit: s.character_limit,
    remaining: s.character_limit - s.character_count,
    resetsAt: s.next_character_count_reset_unix
      ? new Date(s.next_character_count_reset_unix * 1000).toISOString().slice(0, 10)
      : "?",
  };
}

async function listVoices(key, search) {
  const own = await (await api(key, "/v2/voices?page_size=100")).json();
  console.log("— Hesaptaki sesler (doğrudan kullanılabilir):");
  for (const v of own.voices ?? []) {
    console.log(`  ${v.voice_id}  ${v.name}  [${v.category}]  ${v.labels?.accent ?? ""} ${v.labels?.gender ?? ""}`);
  }
  const q = new URLSearchParams({ language: "de", page_size: "15", sort: "trending" });
  if (search) q.set("search", search);
  const shared = await (await api(key, `/v1/shared-voices?${q}`)).json();
  console.log("\n— Voice Library, Almanca (önce web'de 'Add to My Voices' gerekir):");
  for (const v of shared.voices ?? []) {
    console.log(`  ${v.voice_id}  ${v.name}  ${v.gender ?? ""} ${v.age ?? ""} ${v.accent ?? ""}  ${v.use_case ?? ""}`);
    if (v.preview_url) console.log(`      önizleme (ücretsiz): ${v.preview_url}`);
  }
}

async function synthesize(key, { voice, model, line }) {
  const body = {
    text: payloadText(line, model),
    model_id: model,
    voice_settings: voiceSettings(model),
  };
  const res = await api(key, `/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify(body),
  });
  return Buffer.from(await res.arrayBuffer());
}

function cost(lines, model) {
  return Math.ceil(lines.reduce((n, l) => n + payloadText(l, model).length, 0) * creditRate(model));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv(path.resolve(ROOT, typeof args.env === "string" ? args.env : ".env.local"));
  const model = typeof args.model === "string" ? args.model : env.ELEVENLABS_MODEL_ID || "eleven_v3";
  const voice = typeof args.voice === "string" ? args.voice : env.ELEVENLABS_VOICE_ID;
  const budget = Number(args.budget ?? 3000);

  if (args.dry) {
    for (const l of LINES) console.log(`${l.id.padEnd(15)} ${payloadText(l, model)}`);
    console.log(`\nModel ${model}: tüm paket ≈ ${cost(LINES, model)} kredi.`);
    return;
  }

  const key = env.ELEVENLABS_API_KEY;
  if (!key) throw new Error(".env.local içinde ELEVENLABS_API_KEY yok.");

  if (args.quota) {
    const q = await quota(key);
    const ledger = readLedger();
    console.log(`Plan: ${q.tier} | kullanılan ${q.used} / ${q.limit} | kalan ${q.remaining} | yenilenme ${q.resetsAt}`);
    console.log(`Bu betikle harcanan: ${ledger.spent} / bütçe ${budget}`);
    return;
  }

  if (args.voices) {
    await listVoices(key, typeof args.voices === "string" ? args.voices : args._[0]);
    return;
  }

  let lines;
  let outDir;
  if (args.sample) {
    lines = LINES.filter((l) => l.id === args.sample);
    outDir = typeof args.out === "string" ? path.resolve(args.out) : SAMPLE_DIR;
  } else if (args.all) {
    const only = typeof args.only === "string" ? new Set(args.only.split(",")) : null;
    lines = only ? LINES.filter((l) => only.has(l.id)) : LINES;
    outDir = OUTPUT_DIR;
  } else {
    console.log("Komut yok. --quota | --voices | --dry | --sample <id> | --all");
    return;
  }
  if (lines.length === 0) throw new Error("Eşleşen satır yok.");
  if (!voice) throw new Error("Ses seçilmedi: .env.local'a ELEVENLABS_VOICE_ID yaz ya da --voice ver.");

  const ledger = readLedger();
  const planned = cost(lines, model);
  if (ledger.spent + planned > budget) {
    throw new Error(`Bütçe aşılır: harcanan ${ledger.spent} + planlanan ${planned} > ${budget}. Durdu.`);
  }
  const q = await quota(key);
  if (q.remaining < planned) throw new Error(`Kota yetmez: kalan ${q.remaining}, gereken ${planned}.`);
  console.log(`Model ${model}, ses ${voice}: ${lines.length} satır ≈ ${planned} kredi (kalan kota ${q.remaining}).`);

  fs.mkdirSync(outDir, { recursive: true });
  for (const line of lines) {
    const credits = cost([line], model);
    const audio = await synthesize(key, { voice, model, line });
    const name = args.sample ? `${line.id}.${model}.${voice.slice(0, 6)}.mp3` : `${line.id}.mp3`;
    fs.writeFileSync(path.join(outDir, name), audio);
    ledger.spent += credits;
    ledger.log.push({ at: new Date().toISOString(), id: line.id, model, voice, credits });
    writeLedger(ledger);
    console.log(`  ✓ ${name}  ${(audio.length / 1024).toFixed(1)} KB  (${credits} kredi)`);
  }
  console.log(`Toplam harcanan: ${ledger.spent} / ${budget}. Çıktı: ${outDir}`);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
