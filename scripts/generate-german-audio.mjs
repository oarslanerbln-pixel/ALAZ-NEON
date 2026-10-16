/**
 * HENGAME (ALAZ-NEON) — Almanca Spiker & Anons Ses Paketi Üreticisi
 * 
 * Google Cloud Text-to-Speech (Neural2 / Studio) API kullanarak
 * TV Host ekranı için profesyonel Almanca anons ses dosyalarını
 * public/audio/de/ klasörüne .mp3 olarak kaydeder.
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

// Üretilecek Profesyonel Almanca Spiker Anonsları
export const GERMAN_ANNOUNCER_SCRIPTS = [
  // --- LOBI & GİRİŞ ---
  {
    id: "welcome_arena",
    text: "Willkommen bei HENGAME! Scannt den QR-Code auf dem Bildschirm und tretet dem Spiel bei!",
    voice: "de-DE-Neural2-B", // Güçlü, karizmatik erkek bar sunucusu
    speakingRate: 1.05,
    pitch: -0.5
  },
  {
    id: "game_starting",
    text: "Achtung alle zusammen! Das Spiel beginnt in Kürze. Macht euch bereit!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.05,
    pitch: 0.0
  },
  {
    id: "new_player_joined",
    text: "Ein neuer Herausforderer betritt die Arena!",
    voice: "de-DE-Neural2-F", // Dinamik, enerjik kadın sunucu
    speakingRate: 1.1,
    pitch: 0.5
  },

  // --- GERİ SAYIM & ACİLİYET ---
  {
    id: "countdown_10s",
    text: "Noch zehn Sekunden! Beeilt euch!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.15,
    pitch: 0.5
  },
  {
    id: "countdown_321",
    text: "Drei, zwei, eins... Zeit ist um!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.1,
    pitch: 0.0
  },
  {
    id: "hurry_up",
    text: "Die Zeit läuft ab! Schnell antworten!",
    voice: "de-DE-Neural2-F",
    speakingRate: 1.2,
    pitch: 0.5
  },

  // --- BOMBA MODU (BOMBE) ---
  {
    id: "bomb_intro",
    text: "Achtung, Bombenalarm! Antwortet schnell und gebt die Bombe weiter!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.1,
    pitch: -0.5
  },
  {
    id: "bomb_tick_fast",
    text: "Die Lunte brennt! Gleich knallt es!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.2,
    pitch: 1.0
  },
  {
    id: "bomb_exploded",
    text: "Boom! Die Bombe ist explodiert! Du bist raus aus der Runde!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.1,
    pitch: -1.0
  },

  // --- QUIZ & BİLGİ YARIŞMASI ---
  {
    id: "quiz_correct",
    text: "Absolut richtig! Volle Punktzahl!",
    voice: "de-DE-Neural2-F",
    speakingRate: 1.1,
    pitch: 1.0
  },
  {
    id: "quiz_wrong",
    text: "Leider falsch! Das war daneben!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.05,
    pitch: -1.0
  },
  {
    id: "quiz_streak",
    text: "Unglaubliche Serie! Nicht zu stoppen heute Abend!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.1,
    pitch: 0.5
  },

  // --- NABIZ & SENSÖR MODU ---
  {
    id: "sensor_duel",
    text: "Sensor-Duell! Wer hat die schnellsten Reflexe an der Bar?",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.05,
    pitch: 0.0
  },

  // --- PODYUM & KAZANANLAR ---
  {
    id: "podium_reveal",
    text: "Und hier ist das offizielle Endergebnis des Abends!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.0,
    pitch: 0.0
  },
  {
    id: "champion_announce",
    text: "Applaus für den unangefochtenen Champion der Runde! Was für ein Spiel!",
    voice: "de-DE-Neural2-B",
    speakingRate: 1.05,
    pitch: 0.5
  },
  {
    id: "free_drink_reward",
    text: "Herzlichen Glückwunsch! Hol dir deinen wohlverdienten Preis an der Bar ab!",
    voice: "de-DE-Neural2-F",
    speakingRate: 1.05,
    pitch: 0.5
  }
];

async function getAuthToken() {
  const configstore = require('../node_modules/firebase-tools/lib/configstore').configstore;
  const tokens = configstore.get('tokens');
  const { getAccessToken } = require('../node_modules/firebase-tools/lib/auth');
  const tok = await getAccessToken(tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
  return tok.access_token;
}

function synthesizeText(script, accessToken) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      input: { text: script.text },
      voice: {
        languageCode: "de-DE",
        name: script.voice
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: script.speakingRate,
        pitch: script.pitch
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
  console.log("🎙️ HENGAME Almanca Spiker Ses Paketi Üretimi Başlıyor...");
  console.log(`📁 Hedef Klasör: ${OUTPUT_DIR}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🔑 Google Cloud kimlik doğrulaması alınıyor...");
  const accessToken = await getAuthToken();
  console.log("✅ Kimlik doğrulandı! Anonslar sentezleniyor...\n");

  let successCount = 0;
  for (const script of GERMAN_ANNOUNCER_SCRIPTS) {
    try {
      process.stdout.write(`⏳ Üretiliyor: [${script.id}] "${script.text.slice(0, 35)}..." `);
      const res = await synthesizeText(script, accessToken);
      console.log(`✅ OK (${(res.size / 1024).toFixed(1)} KB)`);
      successCount++;
    } catch (err) {
      console.log(`❌ HATA!`);
      console.error(`   ${err.message}`);
    }
  }

  console.log(`\n🎉 TAMAMLANDI! ${successCount}/${GERMAN_ANNOUNCER_SCRIPTS.length} Almanca anons başarıyla üretildi ve kaydedildi.`);
}

main().catch(console.error);
