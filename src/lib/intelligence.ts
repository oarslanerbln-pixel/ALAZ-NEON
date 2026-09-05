/**
 * Intelligence Engine for HENGAME (cafe & venue party game)
 * Provides real-time game analytics and predictive metrics.
 *
 * This module acts as the 'Machine Learning' layer, using weighted logic
 * to predict outcomes and assess round difficulty.
 */

import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { RoundLog, RoundResultInfo, AnswerBreakdown } from "../types/database";

const LETTER_COMPLEXITY: Record<string, number> = {
  A: 10,
  B: 15,
  C: 20,
  D: 15,
  E: 10,
  F: 25,
  G: 30,
  H: 35,
  I: 10,
  J: 50,
  K: 20,
  L: 15,
  M: 20,
  N: 15,
  O: 15,
  P: 25,
  Q: 90,
  R: 15,
  S: 10,
  T: 15,
  U: 20,
  V: 40,
  W: 80,
  X: 95,
  Y: 50,
  Z: 70,
  İ: 15,
  Ö: 40,
  Ü: 40,
  Ş: 45,
  Ğ: 85,
  Ç: 45,
};

export interface RoundIntelligence {
  complexityScore: number; // 0-100
  expectedAvgScore: number;
  winProbability: number;
  marketStability: "Stabil" | "Değişken" | "Kaotik";
  operationalTip: string;
}


/**
 * Calculates real-time intelligence for the current game state.
 */
export function getRoundIntelligence(
  letter: string,
  categories: string[],
  playerCount: number,
  timeLeft: number,
  currentRound: number,
): RoundIntelligence {
  const normLetter = letter.toUpperCase();
  const letterBase = LETTER_COMPLEXITY[normLetter] || 50;

  // Complexity increases with categories and rare letters
  const complexityScore = Math.min(100, letterBase + categories.length * 5);

  // Predicting expected average score per player
  // Easy letters + high time = higher scores
  const expectedAvgScore = Math.max(
    0,
    (100 - complexityScore) * 0.8 + timeLeft * 0.2,
  );

  // Market Stability metaphor
  let marketStability: "Stabil" | "Değişken" | "Kaotik" = "Stabil";
  if (complexityScore > 70) marketStability = "Kaotik";
  else if (complexityScore > 40) marketStability = "Değişken";

  // Strategic Operational Tip (SaaS Logic)
  let operationalTip = "Müşteri akışı dengeli, servis kalitesine odaklanın.";
  if (timeLeft < 15) {
    operationalTip = `Tur ${currentRound}: Kritik süre! Müşteriler sabırsızlanıyor, hızlı karar verin.`;
  } else if (complexityScore > 60) {
    operationalTip = "Hammadde kıtlığı (Nadir Harf)! Yaratıcı çözümler üretin.";
  } else if (playerCount > 5) {
    operationalTip = "Yüksek trafik! Unik (Benzersiz) cevaplar fark yaratır.";
  }

  return {
    complexityScore,
    expectedAvgScore: Math.round(expectedAvgScore),
    winProbability: 100 - complexityScore, // Simplistic win probability
    marketStability,
    operationalTip,
  };
}

/**
 * Saves a round's data to Supabase for analysis and self-learning.
 */
export async function logRoundIntelligence(
  roomId: string,
  roundNum: number,
  letter: string,
  categories: string[],
  playerCount: number,
  predictedAvg: number,
  actualResults: RoundResultInfo[], // From calculateRoundScores
) {
  if (actualResults.length === 0) return;

  const actualAvg =
    actualResults.reduce(
      (acc: number, curr: RoundResultInfo) => acc + curr.roundScore,
      0,
    ) / actualResults.length;
  const predictionError = actualAvg - predictedAvg;
  const letterBase = LETTER_COMPLEXITY[letter.toUpperCase()] || 50;
  const complexityScore = Math.min(100, letterBase + categories.length * 5);

  const log: RoundLog = {
    room_id: roomId,
    round_number: roundNum,
    letter,
    categories,
    player_count: playerCount,
    complexity_score: complexityScore,
    predicted_avg_score: predictedAvg,
    actual_avg_score: Math.round(actualAvg),
    prediction_error: Math.round(predictionError),
  };

  try {
    await addDoc(collection(db, "round_logs"), {
      ...log,
      created_at: Date.now()
    });
  } catch (error) {
    console.error("Intelligence log failed:", error);
  }

  return log;
}

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
