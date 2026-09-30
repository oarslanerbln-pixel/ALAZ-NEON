import { describe, expect, it } from "vitest";

import { pickWeightedIndex } from "../wheel";

describe("pickWeightedIndex", () => {
  it("ağırlık aralıklarına göre seçer", () => {
    // [3, 5, 2] → [0,0.3) → 0, [0.3,0.8) → 1, [0.8,1) → 2
    expect(pickWeightedIndex([3, 5, 2], 0)).toBe(0);
    expect(pickWeightedIndex([3, 5, 2], 0.29)).toBe(0);
    expect(pickWeightedIndex([3, 5, 2], 0.3)).toBe(1);
    expect(pickWeightedIndex([3, 5, 2], 0.79)).toBe(1);
    expect(pickWeightedIndex([3, 5, 2], 0.8)).toBe(2);
    expect(pickWeightedIndex([3, 5, 2], 0.999999)).toBe(2);
  });

  it("sıfır ağırlıklı dilim hiç seçilmez", () => {
    for (let r = 0; r < 1; r += 0.01) {
      expect(pickWeightedIndex([1, 0, 1], r)).not.toBe(1);
    }
  });

  it("uzun vadede dağılım ağırlıklara yakın", () => {
    const counts = [0, 0, 0];
    const n = 10000;
    for (let i = 0; i < n; i++) counts[pickWeightedIndex([1, 2, 7], (i + 0.5) / n)]++;
    expect(counts).toEqual([1000, 2000, 7000]);
  });

  it("geçersiz/boş ağırlıklarda çökmeden eşit dağıtır", () => {
    expect(pickWeightedIndex([], 0.5)).toBe(0);
    expect(pickWeightedIndex([0, 0], 0.9)).toBe(1);
    expect(pickWeightedIndex([Number.NaN, -1, 0], 0.1)).toBe(0);
  });
});
