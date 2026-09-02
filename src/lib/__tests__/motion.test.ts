import { describe, it, expect, vi } from "vitest";
import { EASE, SPRING, DURATION, normalizeFrameDelta, prefersReducedMotion } from "../motion";

describe("motion tokenları", () => {
  it("bezier eğrilerinin x kontrol noktaları [0,1] aralığında (CSS/framer geçerliliği)", () => {
    for (const [name, [x1, , x2]] of Object.entries(EASE)) {
      expect(x1, `${name}.x1`).toBeGreaterThanOrEqual(0);
      expect(x1, `${name}.x1`).toBeLessThanOrEqual(1);
      expect(x2, `${name}.x2`).toBeGreaterThanOrEqual(0);
      expect(x2, `${name}.x2`).toBeLessThanOrEqual(1);
    }
  });

  it("yaylar kararlı: damping oranı ζ 0.4–1.0 arasında (ne sönümsüz ne de sürünen)", () => {
    for (const [name, s] of Object.entries(SPRING)) {
      const zeta = s.damping / (2 * Math.sqrt(s.stiffness * s.mass));
      expect(zeta, name).toBeGreaterThan(0.4);
      expect(zeta, name).toBeLessThanOrEqual(1.0);
    }
  });

  it("süre ölçeği monoton artar (instant < fast < base < slow < cinematic)", () => {
    expect(DURATION.instant).toBeLessThan(DURATION.fast);
    expect(DURATION.fast).toBeLessThan(DURATION.base);
    expect(DURATION.base).toBeLessThan(DURATION.slow);
    expect(DURATION.slow).toBeLessThan(DURATION.cinematic);
  });
});

describe("normalizeFrameDelta", () => {
  it("16.67ms → 1 kare, 33.3ms → 2 kare", () => {
    expect(normalizeFrameDelta(1000 / 60)).toBeCloseTo(1, 5);
    expect(normalizeFrameDelta(1000 / 30)).toBeCloseTo(2, 5);
  });

  it("uzun duraklamada tavana çarpar (sekme dönüşünde fizik patlamaz)", () => {
    expect(normalizeFrameDelta(5000)).toBe(3);
    expect(normalizeFrameDelta(5000, 5)).toBe(5);
  });

  it("geçersiz/negatif değerlerde 1 döner", () => {
    expect(normalizeFrameDelta(0)).toBe(1);
    expect(normalizeFrameDelta(-10)).toBe(1);
    expect(normalizeFrameDelta(Number.NaN)).toBe(1);
  });
});

describe("prefersReducedMotion", () => {
  it("matchMedia yoksa false döner", () => {
    const original = window.matchMedia;
    Object.defineProperty(window, "matchMedia", { configurable: true, value: undefined });
    try {
      expect(prefersReducedMotion()).toBe(false);
    } finally {
      Object.defineProperty(window, "matchMedia", { configurable: true, value: original });
    }
  });

  it("kullanıcı tercihini okur", () => {
    const original = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    try {
      expect(prefersReducedMotion()).toBe(true);
    } finally {
      Object.defineProperty(window, "matchMedia", { configurable: true, value: original });
    }
  });
});
