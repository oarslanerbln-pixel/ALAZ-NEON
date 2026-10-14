import { describe, it, expect } from "vitest";
import { scoreQuizQuestion, type QuizAnswerLike } from "../quizScoring";

const START = Date.parse("2026-10-04T20:00:00.000Z");
const at = (sec: number) => new Date(START + sec * 1000).toISOString();
const ans = (player: string, option: string, sec: number): QuizAnswerLike => ({
  player_id: player,
  data: { selectedOption: option },
  created_at: at(sec),
});
const players = ["a", "b", "c", "d", "e"].map((id) => ({ id, nickname: id.toUpperCase() }));

const score = (answers: QuizAnswerLike[], extra: { isFinalRound?: boolean; streaks?: Record<string, number> } = {}) =>
  scoreQuizQuestion({
    answers,
    players,
    correctOption: "B",
    isFinalRound: extra.isFinalRound ?? false,
    streaks: extra.streaks ?? {},
    questionStartTime: START,
  });

describe("scoreQuizQuestion", () => {
  it("hız sırası bonusu: 500 / 350 / 200 / 100 (gönderim sırasına göre, giriş sırasına değil)", () => {
    const result = score([ans("d", "B", 9), ans("a", "B", 2), ans("c", "B", 6), ans("b", "B", 4)]);
    expect(result.awards).toEqual([
      { playerId: "a", earned: 1500 },
      { playerId: "b", earned: 1350 },
      { playerId: "c", earned: 1200 },
      { playerId: "d", earned: 1100 },
    ]);
  });

  it("yanlış cevap puan almaz ve hız sırasını işgal etmez", () => {
    const result = score([ans("a", "A", 1), ans("b", "B", 3)]);
    expect(result.awards).toEqual([{ playerId: "b", earned: 1500 }]);
  });

  it("final sorusu iki kat taban puan", () => {
    expect(score([ans("a", "B", 1)], { isFinalRound: true }).awards).toEqual([{ playerId: "a", earned: 2500 }]);
  });

  it("seri: 2. doğru ×1.2, 3. doğru ×1.5; yanlış sıfırlar, cevapsızlık dokunmaz", () => {
    const result = score([ans("a", "B", 1), ans("b", "B", 2), ans("c", "A", 3)], {
      streaks: { a: 1, b: 2, c: 4, d: 3 },
    });
    expect(result.awards).toEqual([
      { playerId: "a", earned: 1800 }, // (1000+500)×1.2
      { playerId: "b", earned: 2025 }, // (1000+350)×1.5
    ]);
    expect(result.streaks).toEqual({ a: 2, b: 3, c: 0, d: 3 });
  });

  it("girdi seri nesnesi değiştirilmez", () => {
    const streaks = { a: 1 };
    score([ans("a", "B", 1)], { streaks });
    expect(streaks).toEqual({ a: 1 });
  });

  it("oyuncunun yalnızca ilk cevabı sayılır; oy dağılımı geçerli seçenekleri sayar", () => {
    const result = score([ans("a", "A", 1), ans("a", "B", 2), ans("b", "C", 3), ans("c", "Z", 4)]);
    expect(result.awards).toEqual([]);
    expect(result.stats).toEqual({ A: 1, B: 0, C: 1, D: 0, total: 2 });
  });

  it("odada olmayan oyuncu atlanır", () => {
    expect(score([ans("x", "B", 1), ans("a", "B", 2)]).awards).toEqual([{ playerId: "a", earned: 1500 }]);
  });

  it("en hızlı doğru: süre (en az 0.5 sn, bir ondalık) ve kazandığı puan", () => {
    expect(score([ans("b", "B", 3.27), ans("a", "B", 5)]).fastest).toEqual({
      nickname: "B",
      timeTakenSec: 3.3,
      pointsEarned: 1500,
    });
    expect(score([ans("a", "B", 0.1)]).fastest?.timeTakenSec).toBe(0.5);
    expect(score([ans("a", "A", 1)]).fastest).toBeNull();
  });
});
