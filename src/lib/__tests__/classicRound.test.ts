import { describe, it, expect } from "vitest";
import type { RoundResultInfo } from "../../types/database";
import { accumulatePodiumStats, CLASSIC_LETTERS, pickNextLetter, toggleAnswerValidity } from "../classicRound";

const result = (over: Partial<RoundResultInfo> = {}): RoundResultInfo => ({
  playerId: "p1",
  name: "ALFA",
  teamName: null,
  roundScore: 30,
  totalScore: 130,
  earlyBonus: false,
  answers: {
    Şehir: { value: "Adana", points: 10, isValid: true, isUnique: false },
    Hayvan: { value: "Arı", points: 20, isValid: true, isUnique: true },
    Bitki: { value: "", points: 0, isValid: false, isUnique: false },
  },
  ...over,
} as RoundResultInfo);

describe("pickNextLetter", () => {
  it("çekilmemiş harflerden seçer, havuzu değiştirmez", () => {
    const used = CLASSIC_LETTERS.filter((l) => l !== "K" && l !== "M");
    expect(pickNextLetter(used, () => 0)).toEqual({ letter: "K", usedLetters: used });
    expect(pickNextLetter(used, () => 0.99).letter).toBe("M");
  });

  it("tüm harfler çekildiyse havuz sıfırlanır", () => {
    expect(pickNextLetter(CLASSIC_LETTERS, () => 0)).toEqual({ letter: "A", usedLetters: [] });
  });
});

describe("toggleAnswerValidity", () => {
  it("geçerli cevabı geçersiz yapınca puanı düşer", () => {
    const next = toggleAnswerValidity(result(), "Hayvan");
    expect(next.answers.Hayvan).toMatchObject({ isValid: false, points: 0 });
    expect(next).toMatchObject({ roundScore: 10, totalScore: 110 });
  });

  it("geçersizi geçerli yapınca benzersizse 20, değilse 10 ekler", () => {
    const rejected = toggleAnswerValidity(result(), "Şehir");
    const restored = toggleAnswerValidity(rejected, "Şehir");
    expect(restored.answers.Şehir).toMatchObject({ isValid: true, points: 10 });
    expect(restored).toMatchObject({ roundScore: 30, totalScore: 130 });
  });

  it("girdi değiştirilmez", () => {
    const input = result();
    toggleAnswerValidity(input, "Hayvan");
    expect(input.answers.Hayvan.isValid).toBe(true);
  });
});

describe("accumulatePodiumStats", () => {
  it("benzersiz geçerli, boş ve erken gönderimleri gece boyu biriktirir", () => {
    const first = accumulatePodiumStats({}, [result({ earlyBonus: true })]);
    expect(first.p1).toEqual({ uniqueCount: 1, earlyCount: 1, blankCount: 1 });
    const second = accumulatePodiumStats(first, [result()]);
    expect(second.p1).toEqual({ uniqueCount: 2, earlyCount: 1, blankCount: 2 });
    expect(first.p1).toEqual({ uniqueCount: 1, earlyCount: 1, blankCount: 1 });
  });
});
