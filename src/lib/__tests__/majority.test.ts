import { describe, expect, it } from "vitest";

import { majorityResult } from "../majority";

describe("majorityResult", () => {
  it("en kalabalık grup kazanır", () => {
    const result = majorityResult({ a: "leo", b: "leo", c: "aries", d: "leo", e: "pisces" });
    expect(result.counts).toEqual({ leo: 3, aries: 1, pisces: 1 });
    expect(result.winners).toEqual(["leo"]);
    expect(result.winnerPlayerIds).toEqual(["a", "b", "d"]);
  });

  it("beraberlikte tüm üst gruplar puan alır", () => {
    const result = majorityResult({ a: "leo", b: "leo", c: "aries", d: "aries", e: "pisces" });
    expect(result.winners).toEqual(["aries", "leo"]);
    expect(result.winnerPlayerIds).toEqual(["a", "b", "c", "d"]);
  });

  it("herkes farklı seçtiyse sürü yok, kimse puan almaz", () => {
    const result = majorityResult({ a: "leo", b: "aries", c: "pisces" });
    expect(result.counts).toEqual({ leo: 1, aries: 1, pisces: 1 });
    expect(result.winners).toEqual([]);
    expect(result.winnerPlayerIds).toEqual([]);
  });

  it("tek oy ya da hiç oy puan vermez", () => {
    expect(majorityResult({ a: "leo" }).winnerPlayerIds).toEqual([]);
    expect(majorityResult({})).toEqual({ counts: {}, winners: [], winnerPlayerIds: [] });
  });
});
