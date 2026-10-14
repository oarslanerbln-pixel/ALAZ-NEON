/**
 * Klasik harf oyununun (HENGAME ARENA) host tarafı saf mantığı
 * (docs/roadmap.md, 2.7). HostDisplay'den davranış aynen korunarak çıkarıldı;
 * e2e/classic.spec.ts ve birim testleri sabitliyor.
 */
import type { RoundResultInfo } from "../types/database";

/** Oyunun çektiği harfler (Türkçe'de az kelime başlatan Ç/Ğ/Ş/Ö/Ü/W/X/Q yok). */
export const CLASSIC_LETTERS = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");

/**
 * Henüz çekilmemiş harflerden birini seçer. Hepsi çekildiyse havuz sıfırlanır.
 * Dönen `usedLetters`, odaya yazılacak havuz durumu (seçilen harf HENÜZ
 * eklenmemiş — harf çarkı bitince eklenir).
 */
export function pickNextLetter(
  usedLetters: readonly string[],
  random: () => number = Math.random,
): { letter: string; usedLetters: string[] } {
  let available = CLASSIC_LETTERS.filter((l) => !usedLetters.includes(l));
  let pool = [...usedLetters];
  if (available.length === 0) {
    available = CLASSIC_LETTERS;
    pool = [];
  }
  return { letter: available[Math.floor(random() * available.length)], usedLetters: pool };
}

/**
 * İnceleme ekranında host bir cevabı geçerli/geçersiz yapınca oyuncunun
 * sonucu. Geçerli yapılan cevap benzersizse 20, değilse 10 puan alır;
 * geçersiz yapılan cevabın puanı düşülür.
 */
export function toggleAnswerValidity(result: RoundResultInfo, category: string): RoundResultInfo {
  const answer = result.answers[category];
  const nowValid = !answer.isValid;
  const points = nowValid ? (answer.isUnique ? 20 : 10) : 0;
  const diff = points - (answer.isValid ? answer.points : 0);
  return {
    ...result,
    roundScore: result.roundScore + diff,
    totalScore: result.totalScore + diff,
    answers: { ...result.answers, [category]: { ...answer, isValid: nowValid, points } },
  };
}

export interface PodiumStats {
  uniqueCount: number;
  earlyCount: number;
  blankCount: number;
}

/** Podyum rozetleri için gece boyu biriken istatistikler (girdi değiştirilmez). */
export function accumulatePodiumStats(
  previous: Record<string, PodiumStats>,
  results: RoundResultInfo[],
): Record<string, PodiumStats> {
  const next = { ...previous };
  for (const result of results) {
    const stats = { ...(next[result.playerId] ?? { uniqueCount: 0, earlyCount: 0, blankCount: 0 }) };
    if (result.earlyBonus) stats.earlyCount++;
    for (const answer of Object.values(result.answers)) {
      if (!answer.value) stats.blankCount++;
      else if (answer.isUnique && answer.isValid) stats.uniqueCount++;
    }
    next[result.playerId] = stats;
  }
  return next;
}
