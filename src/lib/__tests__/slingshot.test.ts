import { describe, it, expect } from "vitest";

import { goalsFromScore, judgeShot, parseShot, slingshotRoundKey } from "../slingshot";

describe("judgeShot", () => {
  it("kalecinin uzandığı yere giden şut kurtarılır", () => {
    expect(judgeShot(1, 2, 0)).toBe("saved");
  });

  it("kalecinin uzağındaki kale içi şut gol", () => {
    expect(judgeShot(6, 3, -4)).toBe("goal");
  });

  it("direğe yakın şut direkten döner", () => {
    expect(judgeShot(8.2, 3, 0)).toBe("crossbar");
    expect(judgeShot(-3, 6.6, 6)).toBe("crossbar");
  });

  it("kale dışı ve yerden giden şut auta gider", () => {
    expect(judgeShot(14, 3, 0)).toBe("out");
    expect(judgeShot(5, -1, 0)).toBe("out");
  });
});

describe("slingshotRoundKey", () => {
  it("bitiş zamanı her turu ayırır", () => {
    expect(slingshotRoundKey(1_700_000_000_000)).toBe("slingshot-1700000000000");
    expect(slingshotRoundKey(1)).not.toBe(slingshotRoundKey(2));
  });

  it("tur başlamadıysa anahtar yok", () => {
    expect(slingshotRoundKey(undefined)).toBeNull();
    expect(slingshotRoundKey(0)).toBeNull();
  });
});

describe("parseShot", () => {
  it("cevaptaki metin değerleri sayıya çevirir", () => {
    expect(parseShot({ power: "80", angle: "-12", curve: "0.4" })).toEqual({ power: 80, angle: -12, curve: 0.4 });
  });

  it("kurcalanmış değerleri oyun aralığına kırpar", () => {
    expect(parseShot({ power: 5000, angle: 90, curve: -7 })).toEqual({ power: 100, angle: 45, curve: -1 });
  });

  it("sayı olmayan şutu atar", () => {
    expect(parseShot({ power: "x", angle: 0, curve: 0 })).toBeNull();
    expect(parseShot(undefined)).toBeNull();
  });
});

describe("goalsFromScore", () => {
  it("puanı gol sayısına çevirir", () => {
    expect(goalsFromScore(0)).toBe(0);
    expect(goalsFromScore(300)).toBe(3);
    expect(goalsFromScore(undefined)).toBe(0);
  });
});
