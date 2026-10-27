/**
 * Gecenin enleri (podyum ödülleri): oturum boyunca verilen cevaplardan en
 * yaratıcı cevabı ve en komik hatayı seçer. Saf; Firestore'a dokunmaz.
 *
 * Eskiden bu dosyada bir de "tahmin motoru" vardı (TV'deki zorluk/beklenen
 * ortalama çubuğu ve her turun `round_logs`'a yazılması). round_logs için
 * hiç kural yoktu, yazım her turda reddediliyordu; çubuk da bir tahmin değil
 * sabit bir harf tablosuydu. İkisi de kaldırıldı.
 */

import type { RoundResultInfo, AnswerBreakdown } from "../types/database";

export interface JulesAward {
  title: string;
  playerName: string;
  word: string;
  category: string;
  reason: string;
  type: "creative" | "funny";
}

/**
 * Jules AI: Gecenin Enleri (Best of the Night) Analyzer
 * Scans all answers given during the session to pick the most creative and the funniest mistake.
 */
export function evaluateBestOfNight(history: RoundResultInfo[]): { creative: JulesAward | null, funny: JulesAward | null } {
  let bestCreative: { ans: AnswerBreakdown, pName: string, cat: string, score: number } | null = null;
  let bestFunny: { ans: AnswerBreakdown, pName: string, cat: string, score: number } | null = null;

  for (const round of history) {
    for (const [cat, ans] of Object.entries(round.answers)) {
      if (!ans || !ans.value || ans.value.length < 2) continue;
      
      const wordLen = ans.value.length;
      
      if (ans.isValid && ans.isUnique) {
        // Creative score heuristic: Length + unique bonus
        const cScore = wordLen * 2 + 10;
        if (!bestCreative || cScore > bestCreative.score) {
          bestCreative = { ans, pName: round.name, cat, score: cScore };
        }
      } else if (!ans.isValid) {
        // Funny mistake score heuristic: Length of invalid word (the longer the weirder)
        const fScore = wordLen;
        if (!bestFunny || fScore > bestFunny.score) {
          bestFunny = { ans, pName: round.name, cat, score: fScore };
        }
      }
    }
  }

  return {
    creative: bestCreative ? {
      title: "Gecenin Yaratıcısı",
      playerName: bestCreative.pName,
      word: bestCreative.ans.value,
      category: bestCreative.cat,
      reason: "Benzersiz ve kusursuz bir zeka parıltısı.",
      type: "creative"
    } : null,
    funny: bestFunny ? {
      title: "Gecenin En Komik Hatası",
      playerName: bestFunny.pName,
      word: bestFunny.ans.value,
      category: bestFunny.cat,
      reason: "Bazen saçmalamak en iyi cevaptır.",
      type: "funny"
    } : null
  };
}
