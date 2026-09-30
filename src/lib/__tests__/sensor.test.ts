import { describe, expect, it } from "vitest";

import { everyoneLockedOut, resumedStart, revealProgress, sensorPoints, sensorRevealSec } from "../sensor";

describe("sensorPoints — erken basan çok kazanır", () => {
  it("bulanıkken 1000, tam açıkken 200", () => {
    expect(sensorPoints(0)).toBe(1000);
    expect(sensorPoints(0.5)).toBe(600);
    expect(sensorPoints(1)).toBe(200);
  });

  it("aralık dışı değerleri sıkıştırır, puan monoton azalır", () => {
    expect(sensorPoints(-1)).toBe(1000);
    expect(sensorPoints(2)).toBe(200);
    let prev = Infinity;
    for (let p = 0; p <= 1; p += 0.05) {
      const pts = sensorPoints(p);
      expect(pts).toBeLessThanOrEqual(prev);
      prev = pts;
    }
  });
});

describe("revealProgress / resumedStart", () => {
  it("başlangıçtan geçen süreye göre açılır", () => {
    expect(revealProgress(1000, 1000 + 12500, 25)).toBe(0.5);
    expect(revealProgress(1000, 1000 + 99999, 25)).toBe(1);
    expect(revealProgress(undefined, 5000, 25)).toBe(0);
  });

  it("yanlış cevaptan sonra görsel baştan bulanıklaşmaz, bekleme de puanı eritmez (regresyon)", () => {
    const start = 0;
    const pausedAt = 10_000; // %40 açıkken biri bastı
    const now = 18_000; // 8 sn cevap/hakem bekleme
    const newStart = resumedStart(start, pausedAt, now);
    expect(revealProgress(newStart, now, 25)).toBeCloseTo(0.4);
  });
});

describe("sensorRevealSec", () => {
  it("kurulum ayarını kullanır (eskiden sabit 25 sn)", () => {
    expect(sensorRevealSec(40)).toBe(40);
    expect(sensorRevealSec(3)).toBe(10);
    expect(sensorRevealSec(undefined)).toBe(25);
  });
});

describe("everyoneLockedOut", () => {
  it("herkes yanıldıysa görsel otomatik açılabilir", () => {
    expect(everyoneLockedOut(["a", "b"], ["b", "a"])).toBe(true);
    expect(everyoneLockedOut(["a", "b"], ["a"])).toBe(false);
    expect(everyoneLockedOut([], [])).toBe(false);
  });
});
