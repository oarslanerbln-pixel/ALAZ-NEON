import { describe, it, expect } from "vitest";
import { analyzeGibberish, looksLikeGibberish } from "../wordValidation";

describe("looksLikeGibberish — yakalaması gerekenler", () => {
  it("aynı harfin tekrarı", () => {
    expect(looksLikeGibberish("Kkkk")).toBe(true);
    expect(looksLikeGibberish("aaaa")).toBe(true);
  });

  it("ünlüsüz diziler", () => {
    expect(looksLikeGibberish("kfjd")).toBe(true);
    expect(looksLikeGibberish("zxc")).toBe(true);
  });

  it("klavye ezmesi", () => {
    expect(looksLikeGibberish("asdf")).toBe(true);
    expect(looksLikeGibberish("qwerty")).toBe(true);
  });

  it("tekrarlanan kalıp", () => {
    expect(looksLikeGibberish("asdasd")).toBe(true);
    expect(looksLikeGibberish("abcabc")).toBe(true);
  });

  it("tek harflik cevap", () => {
    expect(looksLikeGibberish("k")).toBe(true);
  });

  it("imkânsız ünsüz yığılması", () => {
    expect(looksLikeGibberish("kstrpla")).toBe(true);
  });
});

describe("looksLikeGibberish — yanlış pozitif olmamalı", () => {
  // Gerçek cevapları eleyen bir filtre oyunu bozar; bu blok o yüzden geniş.
  it("yaygın Türkçe kelimeler", () => {
    const words = [
      "Ankara",
      "İstanbul",
      "kahve",
      "elma",
      "kedi",
      "araba",
      "kitap",
      "deniz",
      "şarkı",
      "öğretmen",
      "çilek",
      "gündüz",
      "mama",
      "gaga",
    ];
    for (const word of words) {
      expect(analyzeGibberish(word), `"${word}" gibberish sayıldı`).toEqual({
        isGibberish: false,
      });
    }
  });

  it("çok kelimeli gerçek cevaplar", () => {
    expect(looksLikeGibberish("New York")).toBe(false);
    expect(looksLikeGibberish("Kuzey Kore")).toBe(false);
  });

  it("kısa ama gerçek kelimeler", () => {
    expect(looksLikeGibberish("at")).toBe(false);
    expect(looksLikeGibberish("ev")).toBe(false);
    expect(looksLikeGibberish("su")).toBe(false);
  });

  it("boş cevabı gibberish saymaz (ayrı bir durum)", () => {
    expect(looksLikeGibberish("")).toBe(false);
    expect(looksLikeGibberish("   ")).toBe(false);
  });
});

describe("analyzeGibberish gerekçesi", () => {
  it("neden şüpheli olduğunu bildirir", () => {
    expect(analyzeGibberish("Kkkk").reason).toBe("repeatedLetters");
    expect(analyzeGibberish("asdf").reason).toBe("keyboardMash");
    expect(analyzeGibberish("k").reason).toBe("tooShort");
  });
});
