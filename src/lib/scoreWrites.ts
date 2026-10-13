import { increment } from "firebase/firestore";

/**
 * Oyun skoruna (`total_score`) puan ekleyen alanlar.
 *
 * Gecelik skor (`night_score`) buradan YAZILMAZ: o, oyun bitince sıraya göre
 * dağıtılır (lib/nightLeague + lib/nightAwards). Ham puanlar oyundan oyuna
 * çok farklı ölçekte olduğu için gece boyu toplanmaları adil değildi.
 */
export function pointsFields(points: number) {
  return { total_score: increment(Math.max(0, Math.round(points))) };
}
