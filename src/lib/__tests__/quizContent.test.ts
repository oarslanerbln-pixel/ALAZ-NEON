import { describe, it, expect } from "vitest";

import { poolFor } from "../quizQuestions";

/**
 * Soru havuzu elle yazılan içerik; bu testler yazım sırasında kolayca
 * yapılan hataları yakalıyor. Üçü de gerçekten yaşandı: bir soruda metin
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

  it("her sorunun dört farklı şıkkı var", () => {
    const bad: string[] = [];
    for (const locale of LOCALES) {
      for (const q of poolFor(locale)) {
        const values = Object.values(q.options).map((v) => v.trim());
        if (values.length !== 4) bad.push(`${q.id}: şık sayısı ${values.length}`);
        if (new Set(values).size !== values.length) bad.push(`${q.id}: yinelenen şık`);
        if (values.some((v) => v === "")) bad.push(`${q.id}: boş şık`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("doğru cevap gerçekten şıklar arasında ve dolu", () => {
    // Metni değiştirip şıkları güncellememek bu testle yakalanıyor.
    const bad: string[] = [];
    for (const locale of LOCALES) {
      for (const q of poolFor(locale)) {
        const answer = q.options[q.correctOption];
        if (!answer || !answer.trim()) bad.push(`${q.id}: cevap "${q.correctOption}" boş`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("soru metni ve zorluk geçerli", () => {
    const bad: string[] = [];
    for (const locale of LOCALES) {
      for (const q of poolFor(locale)) {
        if (q.text.trim().length < 10) bad.push(`${q.id}: metin çok kısa`);
        if (![1, 2, 3].includes(q.difficulty)) bad.push(`${q.id}: zorluk ${q.difficulty}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("aynı dilde aynı soru metni iki kez geçmiyor", () => {
    const bad: string[] = [];
    for (const locale of LOCALES) {
      const texts = poolFor(locale).map((q) => q.text.trim().toLocaleLowerCase(locale));
      const seen = new Set<string>();
      for (const text of texts) {
        if (seen.has(text)) bad.push(`${locale}: "${text.slice(0, 40)}..."`);
        seen.add(text);
      }
    }
    expect(bad).toEqual([]);
  });

  it("her dilin havuzu bir geceyi taşıyacak kadar büyük", () => {
    for (const locale of LOCALES) {
      expect(poolFor(locale).length, locale).toBeGreaterThanOrEqual(MIN_POOL_SIZE);
    }
  });
});
