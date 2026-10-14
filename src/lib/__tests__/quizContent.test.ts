import { describe, it, expect } from "vitest";

import { validateQuestions } from "../quizPack";
import { poolFor } from "../quizQuestions";

/**
 * Soru havuzu elle yazılan içerik (src/content/quiz/*.json); bu testler
 * yazım sırasında kolayca yapılan hataları yakalıyor. Üçü de gerçekten yaşandı: bir soruda metin
 * değiştirilip seçenekler eski hâlinde kalmıştı (espresso sorusunun
 * seçenekleri hâlâ "1/2/3/5" idi), bir başkasının şıkları birbiriyle
 * aynıydı, ve aynı kimlik iki kez kullanılmıştı.
 */

const LOCALES = ["tr", "de", "en"] as const;

/** Tur uzunluğu varsayılanı 8; iki gece üst üste tekrar olmasın diye alt sınır. */
const MIN_POOL_SIZE = 40;

describe("quiz içerik bütünlüğü", () => {
  it("kimlikler benzersiz", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const locale of LOCALES) {
      for (const q of poolFor(locale)) {
        if (seen.has(q.id)) dupes.push(`${q.id} (${seen.get(q.id)} + ${locale})`);
        seen.set(q.id, locale);
      }
    }
    expect(dupes).toEqual([]);
  });

  it("her havuz içerik şemasına uyar (paket yüklemesiyle aynı kurallar)", () => {
    // Dört dolu ve farklı şık, şıklar arasında doğru cevap, geçerli zorluk,
    // metin uzunluğu, dilde benzersiz kimlik ve metin: lib/quizPack.ts.
    for (const locale of LOCALES) {
      const result = validateQuestions(poolFor(locale));
      expect(result.ok ? [] : result.issues, locale).toEqual([]);
    }
  });

  it("her dilin havuzu bir geceyi taşıyacak kadar büyük", () => {
    for (const locale of LOCALES) {
      expect(poolFor(locale).length, locale).toBeGreaterThanOrEqual(MIN_POOL_SIZE);
    }
  });
});
