/**
 * HENGAME spiker satırları (Almanca). İki üretim betiği de buradan okur.
 */

// Kimlikler src/lib/announcer.ts içindeki AnnouncerCue ile birebir aynı
// olmalı; announcer testi her cue için dosyanın varlığını denetler.
// `tags` yalnızca eleven_v3'e gönderilir; diğer modeller etiketi sesli okuyacağı için eklenmez.
export const LINES = [
  { id: "night_open", text: "Willkommen bei Hengame! Handy raus, QR-Code scannen – gleich geht's los." },
  { id: "game_start", tags: "[excited]", text: "Alle bereit? Dann los!" },
  { id: "quiz_intro", tags: "[excited]", text: "Quizzeit! Wer schneller antwortet, holt mehr Punkte." },
  { id: "bomb_intro", tags: "[excited]", text: "Achtung, die Bombe ist scharf! Richtig antworten und schnell weitergeben." },
  { id: "final_question", tags: "[excited]", text: "Letzte Frage – jetzt wird alles entschieden!" },
  { id: "last_seconds", tags: "[excited]", text: "Noch fünf Sekunden!" },
  { id: "reveal", text: "Zeit ist um! Und die richtige Antwort ist …" },
  { id: "bomb_fuse", tags: "[whispers]", text: "Die Lunte wird kürzer …" },
  { id: "bomb_exploded", tags: "[laughs]", text: "Bumm! Das war's – leider raus." },
  { id: "standings", tags: "[curious]", text: "Schauen wir auf die Tabelle …" },
  { id: "podium", tags: "[excited]", text: "Das große Finale! Wer holt sich heute die Krone?" },
  { id: "champion", tags: "[excited]", text: "Riesenapplaus für unseren Champion!" },
];
