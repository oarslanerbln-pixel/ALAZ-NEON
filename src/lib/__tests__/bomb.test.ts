import { describe, expect, it } from "vitest";

import { bombFuseSec, nextPassFuse } from "../bomb";

describe("bombFuseSec", () => {
  it("kurulum ayarını kullanır, 10–60 aralığına sıkıştırır", () => {
    expect(bombFuseSec(30)).toBe(30);
    expect(bombFuseSec(5)).toBe(10);
    expect(bombFuseSec(600)).toBe(60);
    expect(bombFuseSec(undefined)).toBe(15);
  });
});

describe("nextPassFuse", () => {
  it("her pasta kısalır, alt sınırın altına inmez", () => {
    const first = nextPassFuse(20, 1);
    expect(first.multiplier).toBeCloseTo(0.95);
    expect(first.fuseMs).toBe(19000);
    expect(nextPassFuse(20, 0.3).multiplier).toBe(0.35);
    expect(nextPassFuse(20, 0.3).fuseMs).toBe(7000);
  });

  it("30 sn fitil seçilince paslar da ona göre (eskiden sabit 14 sn'den başlıyordu)", () => {
    expect(nextPassFuse(30, 1).fuseMs).toBe(28500);
  });
});
