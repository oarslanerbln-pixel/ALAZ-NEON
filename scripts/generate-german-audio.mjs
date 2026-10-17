/**
 * HENGAME (ALAZ-NEON) — Yüksek Enerjili Almanca Bar/Pub Spikeri Ses Paketi
 * 
 * Google Cloud Text-to-Speech (Studio / Neural2) API kullanarak
 * TV Host ekranı için heyecan dolu, coşkulu ve akıcı Almanca anons
 * ses dosyalarını public/audio/de/ klasörüne .mp3 olarak kaydeder.
 * 
 * "Hengame" kelimesi harf harf okunmaması için fonetik olarak biçimlendirilmiştir.
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../public/audio/de');

// Yüksek Enerjili Berlin Pub/Bar Sunucusu Anonsları (Heyecanlı, coşkulu, akıcı)
export const GERMAN_ANNOUNCER_SCRIPTS = [
  // --- LOBI & GİRİŞ ---
  {
    id: "welcome_arena",
    ssml: "<speak>Willkommen bei <sub alias=\"Hengame\">Hengame</sub>! <break time=\"200ms\"/> Handy raus, QR-Code scannen und ab in die Arena!</speak>",
    voice: "de-DE-Studio-B", // Karizmatik, canlı stüdyo erkek sunucu
    speakingRate: 1.10,
    pitch: 1.0
  },
  {
    id: "game_starting",
    ssml: "<speak>Achtung an alle! <break time=\"150ms\"/> Das Spiel startet jetzt! Macht euch bereit!</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.12,
    pitch: 1.5
  },
  {
    id: "new_player_joined",
    ssml: "<speak>Ein neuer Herausforderer betritt die Arena! <break time=\"100ms\"/> Willkommen!</speak>",
    voice: "de-DE-Studio-C", // Enerjik kadın sunucu
    speakingRate: 1.15,
    pitch: 1.5
  },

  // --- GERİ SAYIM & ACİLİYET ---
  {
    id: "countdown_10s",
    ssml: "<speak>Nur noch zehn Sekunden! <break time=\"150ms\"/> Jetzt noch mal Vollgas!</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.20,
    pitch: 2.0
  },
  {
    id: "countdown_321",
    ssml: "<speak>Drei! <break time=\"150ms\"/> Zwei! <break time=\"150ms\"/> Eins! <break time=\"150ms\"/> Vorbei!</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.18,
    pitch: 2.0
  },
  {
    id: "hurry_up",
    ssml: "<speak>Schneller, schneller! <break time=\"100ms\"/> Die Zeit rennt davon!</speak>",
    voice: "de-DE-Studio-C",
    speakingRate: 1.22,
    pitch: 2.0
  },

  // --- BOMBA MODU (BOMBE) ---
  {
    id: "bomb_intro",
    ssml: "<speak>Achtung, Bombenalarm! <break time=\"200ms\"/> Schnell antworten und das Ding sofort weitergeben!</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.15,
    pitch: 1.5
  },
  {
    id: "bomb_tick_fast",
    ssml: "<speak>Die Lunte brennt lichterloh! <break time=\"100ms\"/> Gleich knallt es!</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.22,
    pitch: 2.5
  },
  {
    id: "bomb_exploded",
    ssml: "<speak>Booooom! <break time=\"200ms\"/> Die Bombe ist explodiert! Du bist leider raus!</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.15,
    pitch: -0.5
  },

  // --- QUIZ & BİLGİ YARIŞMASI ---
  {
    id: "quiz_correct",
    ssml: "<speak>Bäääm! <break time=\"100ms\"/> Volltreffer! Perfekt beantwortet!</speak>",
    voice: "de-DE-Studio-C",
    speakingRate: 1.18,
    pitch: 2.5
  },
  {
    id: "quiz_wrong",
    ssml: "<speak>Oh nein, leider daneben! <break time=\"100ms\"/> Null Punkte!</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.10,
    pitch: -1.0
  },
  {
    id: "quiz_streak",
    ssml: "<speak>Wahnsinn! <break time=\"150ms\"/> Was für eine Serie! Du bist heute Abend unschlagbar!</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.15,
    pitch: 2.0
  },

  // --- NABIZ & SENSÖR MODU ---
  {
    id: "sensor_duel",
    ssml: "<speak>Sensor-Duell! <break time=\"150ms\"/> Wer hat die schnellsten Reflexe an der ganzen Bar?</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.12,
    pitch: 1.5
  },

  // --- PODYUM & KAZANANLAR ---
  {
    id: "podium_reveal",
    ssml: "<speak>Und hier kommt das große Finale! <break time=\"200ms\"/> Wer holt sich heute die Krone?</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.10,
    pitch: 1.5
  },
  {
    id: "champion_announce",
    ssml: "<speak>Riesenapplaus für den Champion der Runde! <break time=\"200ms\"/> Was für eine grandiose Show!</speak>",
    voice: "de-DE-Studio-B",
    speakingRate: 1.14,
    pitch: 2.0
  },
  {
    id: "free_drink_reward",
    ssml: "<speak>Herzlichen Glückwunsch! <break time=\"150ms\"/> Hol dir deinen wohlverdienten Preis direkt an der Bar ab!</speak>",
    voice: "de-DE-Studio-C",
    speakingRate: 1.12,
    pitch: 2.0
  }
];

async function getAuthToken() {
  const configstore = require('../node_modules/firebase-tools/lib/configstore').configstore;
  const tokens = configstore.get('tokens');
  const { getAccessToken } = require('../node_modules/firebase-tools/lib/auth');
  const tok = await getAccessToken(tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
  return tok.access_token;
}

function synthesizeSpeech(script, accessToken) {
  return new Promise((resolve, reject) => {
    const isSsml = Boolean(script.ssml);
    const postData = JSON.stringify({
      input: isSsml ? { ssml: script.ssml } : { text: script.text },
      voice: {
        languageCode: "de-DE",
        name: script.voice
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: script.speakingRate || 1.1,
        pitch: script.pitch || 0.0
      }
    });

    const req = https.request('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-Goog-User-Project": "alaz-neon-web",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            if (json.audioContent) {
              const buffer = Buffer.from(json.audioContent, "base64");
              const outPath = path.join(OUTPUT_DIR, `${script.id}.mp3`);
              fs.writeFileSync(outPath, buffer);
              resolve({ id: script.id, path: outPath, size: buffer.length });
            } else {
              reject(new Error(`Boş audioContent: ${data}`));
            }
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log("🎙️ HENGAME Yüksek Enerjili Almanca Spiker Ses Paketi Üretimi Başlıyor...");
  console.log(`📁 Hedef Klasör: ${OUTPUT_DIR}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🔑 Google Cloud kimlik doğrulaması alınıyor...");
  const accessToken = await getAuthToken();
  console.log("✅ Kimlik doğrulandı! Studio kalitesindeki anonslar sentezleniyor...\n");

  let successCount = 0;
  for (const script of GERMAN_ANNOUNCER_SCRIPTS) {
    try {
      const preview = (script.ssml || script.text).replace(/<[^>]+>/g, '').slice(0, 38);
      process.stdout.write(`⏳ Üretiliyor: [${script.id}] "${preview}..." `);
      const res = await synthesizeSpeech(script, accessToken);
      console.log(`✅ OK (${(res.size / 1024).toFixed(1)} KB)`);
      successCount++;
    } catch (err) {
      console.log(`❌ HATA!`);
      console.error(`   ${err.message}`);
    }
  }

  console.log(`\n🎉 TAMAMLANDI! ${successCount}/${GERMAN_ANNOUNCER_SCRIPTS.length} yüksek enerjili Almanca anons başarıyla üretildi ve kaydedildi.`);
}

main().catch(console.error);
