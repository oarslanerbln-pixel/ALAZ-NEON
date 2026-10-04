/**
 * Quiz sorusunun puanlaması (docs/roadmap.md, 2.7). HostQuizDisplay'den
 * davranışı aynen korunarak çıkarıldı; e2e/quiz.spec.ts ve birim testleri
 * kuralları sabitliyor:
 *  - Doğru cevap 1000 puan, finalde 2000.
 *  - Doğru cevaplayanlar arasında hız sırası bonusu: 500 / 350 / 200 / 100.
 *  - Üst üste doğru: 2. doğruda ×1.2, 3. ve sonrasında ×1.5. Yanlış seriyi
 *    sıfırlar; cevap vermemek seriyi değiştirmez.
 *  - Oyuncunun yalnızca ilk cevabı sayılır (oluşturulma zamanına göre).
 */
import { toMillis } from "./timestamps";

export type QuizOption = "A" | "B" | "C" | "D";

export interface VoteStats {
  A: number;
  B: number;
  C: number;
  D: number;
  total: number;
}

export interface FastestWinner {
  nickname: string;
  timeTakenSec: number;
  pointsEarned: number;
}

export interface QuizAnswerLike {
  player_id: string;
  data?: Record<string, string>;
  created_at?: Parameters<typeof toMillis>[0];
}

export interface QuizAward {
  playerId: string;
  earned: number;
}

export interface QuizQuestionResult {
  stats: VoteStats;
  /** Doğru cevaplayanlar, hız sırasıyla. */
  awards: QuizAward[];
  /** Güncel seri sayıları (girdi değiştirilmez). */
  streaks: Record<string, number>;
  fastest: FastestWinner | null;
}

const SPEED_BONUS = [500, 350, 200];
const LATE_SPEED_BONUS = 100;

function streakMultiplier(streak: number): number {
  if (streak >= 3) return 1.5;
  if (streak === 2) return 1.2;
  return 1.0;
}

export function scoreQuizQuestion(input: {
  answers: QuizAnswerLike[];
  players: { id: string; nickname: string }[];
  correctOption: string;
  isFinalRound: boolean;
  streaks: Record<string, number>;
  /** Sorunun başladığı an (ms); en hızlı doğrunun süresi buna göre. */
  questionStartTime: number;
}): QuizQuestionResult {
  const stats: VoteStats = { A: 0, B: 0, C: 0, D: 0, total: 0 };
  const streaks = { ...input.streaks };

  const sorted = [...input.answers].sort((a, b) => toMillis(a.created_at) - toMillis(b.created_at));
  const firstAnswers = new Map<string, QuizAnswerLike>();
  for (const answer of sorted) {
    if (firstAnswers.has(answer.player_id)) continue;
    firstAnswers.set(answer.player_id, answer);
    const option = answer.data?.selectedOption as QuizOption | undefined;
    if (option && stats[option] !== undefined) {
      stats[option]++;
      stats.total++;
    }
  }

  const awards: QuizAward[] = [];
  let fastest: FastestWinner | null = null;
  let speedRank = 0;

  for (const [playerId, answer] of firstAnswers) {
    const player = input.players.find((p) => p.id === playerId);
    if (!player) continue;

    if (answer.data?.selectedOption !== input.correctOption) {
      streaks[playerId] = 0;
      continue;
    }

    const base = input.isFinalRound ? 2000 : 1000;
    const speedBonus = SPEED_BONUS[speedRank] ?? LATE_SPEED_BONUS;
    const streak = (streaks[playerId] || 0) + 1;
    streaks[playerId] = streak;
    const earned = Math.round((base + speedBonus) * streakMultiplier(streak));

    if (speedRank === 0) {
      const elapsedSec = Math.max(0.5, (toMillis(answer.created_at) - input.questionStartTime) / 1000).toFixed(1);
      fastest = { nickname: player.nickname, timeTakenSec: parseFloat(elapsedSec), pointsEarned: earned };
    }

    speedRank++;
    awards.push({ playerId, earned });
  }

  return { stats, awards, streaks, fastest };
}
