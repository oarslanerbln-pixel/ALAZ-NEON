import { describe, expect, it } from "vitest";

import { colorsDurationSec, decideColors, redShare } from "../colorsWar";

describe("redShare", () => {
  it("eşitlikte ortada, fark hedefe ulaşınca uçta", () => {
    expect(redShare(10, 10, 100)).toBe(50);
    expect(redShare(100, 0, 100)).toBe(100);
    expect(redShare(0, 250, 100)).toBe(0);
  });
});

describe("decideColors", () => {
  it("domination: uca dayanınca biter", () => {
    expect(decideColors({ redPct: 100, now: 0, endTime: 1000 })).toBe("red");
    expect(decideColors({ redPct: 0, now: 0, endTime: 1000 })).toBe("blue");
    expect(decideColors({ redPct: 70, now: 0, endTime: 1000 })).toBeNull();
  });

  it("domination: güvenlik süresi dolunca önde olan kazanır (eskiden sonsuz sürüyordu)", () => {
    expect(decideColors({ redPct: 55, now: 1000, endTime: 1000 })).toBe("red");
    expect(decideColors({ redPct: 50, now: 1000, endTime: 1000 })).toBe("draw");
  });

  it("timed: uca dayanmak bitirmez, süre bitirir", () => {
    expect(decideColors({ redPct: 100, condition: "timed", now: 0, endTime: 1000 })).toBeNull();
    expect(decideColors({ redPct: 40, condition: "timed", now: 1000, endTime: 1000 })).toBe("blue");
  });

  it("süre bilgisi olmayan eski odada yalnızca uç bitirir", () => {
    expect(decideColors({ redPct: 60, now: 999999, endTime: 0 })).toBeNull();
  });
});

describe("colorsDurationSec", () => {
  it("timed 60 sn, domination 120 sn güvenlik sınırı", () => {
    expect(colorsDurationSec("timed")).toBe(60);
    expect(colorsDurationSec("domination")).toBe(120);
    expect(colorsDurationSec(undefined)).toBe(120);
  });
});
