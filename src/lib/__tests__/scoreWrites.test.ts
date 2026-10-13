import { describe, expect, it } from "vitest";

import { nightScoreDelta, pointsFields, totalScoreFields } from "../scoreWrites";

describe("nightScoreDelta", () => {
  it("yalnızca artışı sayar", () => {
    expect(nightScoreDelta(1200, 2700)).toBe(1500);
    expect(nightScoreDelta(undefined, 300)).toBe(300);
  });

  it("sıfırlama ya da azalış gecelik skoru düşürmez", () => {
    expect(nightScoreDelta(2700, 0)).toBe(0);
    expect(nightScoreDelta(500, 400)).toBe(0);
  });
});

describe("totalScoreFields", () => {
  it("artışta iki skoru da yazar", () => {
    expect(Object.keys(totalScoreFields(100, 600)).sort()).toEqual(["night_score", "total_score"]);
    expect(totalScoreFields(100, 600).total_score).toBe(600);
  });

  it("sıfırlamada yalnızca oyun skorunu yazar", () => {
    expect(totalScoreFields(600, 0)).toEqual({ total_score: 0 });
  });
});

describe("pointsFields", () => {
  it("iki skoru birlikte artırır", () => {
    expect(Object.keys(pointsFields(500)).sort()).toEqual(["night_score", "total_score"]);
  });
});
