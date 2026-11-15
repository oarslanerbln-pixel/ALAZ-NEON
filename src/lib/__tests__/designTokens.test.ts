import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Nötr metin tonları her yüzeyde WCAG AA (4,5:1) kontrastını tutmalı.
 * Üçüncü ton (#71717a) kart içinde 3,4:1'e düşüyordu: telefonda 14 px
 * yardımcı metin loş mekânda okunmuyordu. Vurgu rengi bilerek sınanmıyor;
 * onu mekân seçiyor (VenueContext).
 */
const css = readFileSync(join("src", "index.css"), "utf8");

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`--color-${name} bulunamadı`);
  return match[1];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("tasarım tokenları", () => {
  const surfaces = ["bg", "surface", "surface-2"];
  const inks = ["ink", "ink-2", "ink-3"];

  for (const ink of inks) {
    for (const surface of surfaces) {
      it(`${ink}, ${surface} üzerinde AA kontrastını tutar`, () => {
        expect(contrast(token(ink), token(surface))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
