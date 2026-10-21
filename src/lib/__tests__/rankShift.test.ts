import { describe, expect, it } from "vitest";

import { rankDeltas, rankOrder, startingOrder } from "../rankShift";

describe("rankOrder", () => {
  it("puana göre azalan, eşitlikte önce katılan önde", () => {
    const order = rankOrder([
      { id: "a", total_score: 100, created_at: 3 },
      { id: "b", total_score: 300, created_at: 2 },
      { id: "c", total_score: 100, created_at: 1 },
    ]);
    expect(order).toEqual(["b", "c", "a"]);
  });
});

describe("startingOrder", () => {
  it("önceki sıra yoksa yeni sırayı döndürür", () => {
    expect(startingOrder([], ["a", "b"])).toEqual(["a", "b"]);
  });

  it("ayrılanları çıkarır, yeni katılanları sona ekler", () => {
    expect(startingOrder(["a", "x", "b"], ["b", "c", "a"])).toEqual(["a", "b", "c"]);
  });
});

describe("rankDeltas", () => {
  it("yükseleni pozitif, düşeni negatif verir; yerinde kalanı atlar", () => {
    expect(rankDeltas(["a", "b", "c"], ["c", "b", "a"])).toEqual({ c: 2, a: -2 });
  });

  it("önceki sıralamada olmayan oyuncuyu atlar", () => {
    expect(rankDeltas(["a"], ["b", "a"])).toEqual({ a: -1 });
  });
});
