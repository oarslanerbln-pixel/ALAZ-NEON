import { describe, it, expect } from "vitest";
import { pendingLifetimeCredits } from "../lifetimeScore";

const player = (overrides: Record<string, unknown> = {}) => ({
  id: "p1",
  uid: "u1",
  total_score: 0,
  ...overrides,
});

describe("pendingLifetimeCredits", () => {
  it("aktarılmış puanla eşitse hiçbir şey yazmaz", () => {
    expect(pendingLifetimeCredits([player()])).toEqual([]);
    expect(pendingLifetimeCredits([player({ total_score: 40, lifetime_credited: 40 })])).toEqual([]);
  });

  it("yeni kazanılan puanın yalnızca farkını aktarır", () => {
    expect(pendingLifetimeCredits([player({ total_score: 120, lifetime_credited: 40 })])).toEqual([
      { playerId: "p1", uid: "u1", delta: 80, credited: 120 },
    ]);
  });

  it("işaretçisi olmayan (yeni katılmış) oyuncunun tüm puanını aktarır", () => {
    expect(pendingLifetimeCredits([player({ total_score: 30 })])).toEqual([
      { playerId: "p1", uid: "u1", delta: 30, credited: 30 },
    ]);
  });

  it("oda sıfırlamasında kalıcı puana dokunmaz, yalnızca işaretçiyi sıfırlar", () => {
    expect(pendingLifetimeCredits([player({ total_score: 0, lifetime_credited: 250 })])).toEqual([
      { playerId: "p1", uid: "u1", delta: 0, credited: 0 },
    ]);
  });

  it("puan düzeltmesini eksi fark olarak aktarır", () => {
    expect(pendingLifetimeCredits([player({ total_score: 90, lifetime_credited: 100 })])).toEqual([
      { playerId: "p1", uid: "u1", delta: -10, credited: 90 },
    ]);
  });

  it("kimliksiz ya da anonim yer tutucu oyuncuları atlar", () => {
    expect(
      pendingLifetimeCredits([
        player({ uid: undefined, total_score: 50 }),
        player({ uid: "anonymous", total_score: 50 }),
      ]),
    ).toEqual([]);
  });

  it("birden fazla oyuncuyu bağımsız değerlendirir", () => {
    const credits = pendingLifetimeCredits([
      player({ id: "a", uid: "ua", total_score: 10 }),
      player({ id: "b", uid: "ub", total_score: 20, lifetime_credited: 20 }),
      player({ id: "c", uid: "uc", total_score: 5, lifetime_credited: 2 }),
    ]);
    expect(credits.map((c) => [c.playerId, c.delta])).toEqual([
      ["a", 10],
      ["c", 3],
    ]);
  });
});
