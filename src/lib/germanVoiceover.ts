/**
 * HENGAME — Almanca Spiker & Voiceover Yöneticisi
 * 
 * TV Host ekranında oyun durumlarına göre profesyonel Almanca
 * anonsların çalınmasını sağlar.
 */

import { SoundManager } from "./audio";

export type GermanVoiceoverId =
  | "welcome_arena"
  | "game_starting"
  | "new_player_joined"
  | "countdown_10s"
  | "countdown_321"
  | "hurry_up"
  | "bomb_intro"
  | "bomb_tick_fast"
  | "bomb_exploded"
  | "quiz_correct"
  | "quiz_wrong"
  | "quiz_streak"
  | "sensor_duel"
  | "podium_reveal"
  | "champion_announce"
  | "free_drink_reward";

export const GERMAN_VOICEOVER_PATHS: Record<GermanVoiceoverId, string> = {
  welcome_arena: "/audio/de/welcome_arena.mp3",
  game_starting: "/audio/de/game_starting.mp3",
  new_player_joined: "/audio/de/new_player_joined.mp3",
  countdown_10s: "/audio/de/countdown_10s.mp3",
  countdown_321: "/audio/de/countdown_321.mp3",
  hurry_up: "/audio/de/hurry_up.mp3",
  bomb_intro: "/audio/de/bomb_intro.mp3",
  bomb_tick_fast: "/audio/de/bomb_tick_fast.mp3",
  bomb_exploded: "/audio/de/bomb_exploded.mp3",
  quiz_correct: "/audio/de/quiz_correct.mp3",
  quiz_wrong: "/audio/de/quiz_wrong.mp3",
  quiz_streak: "/audio/de/quiz_streak.mp3",
  sensor_duel: "/audio/de/sensor_duel.mp3",
  podium_reveal: "/audio/de/podium_reveal.mp3",
  champion_announce: "/audio/de/champion_announce.mp3",
  free_drink_reward: "/audio/de/free_drink_reward.mp3",
};

/**
 * TV Host ekranında ilgili Almanca anonsu çalar.
 * @param id Çalınacak ses ID'si
 * @param volume Ses seviyesi (0.0 - 1.0, varsayılan 0.8)
 */
export function playGermanVoiceover(id: GermanVoiceoverId, volume = 0.8): void {
  const soundManager = SoundManager.getInstance();
  if (soundManager.getIsMuted()) return;

  const audioPath = GERMAN_VOICEOVER_PATHS[id];
  if (!audioPath) return;

  soundManager.playSFX(audioPath, volume);
}
