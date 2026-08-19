import { describe, it, expect } from "vitest";
import { containsProfanity, maskProfanity, safeForDisplay } from "../profanity";

describe("containsProfanity", () => {
  it("düz yazılmış küfrü yakalar", () => {
    expect(containsProfanity("orospu")).toBe(true);
    expect(containsProfanity("piç")).toBe(true);
  });

  it("ek almış hâlleri yakalar (Türkçe sondan eklemeli)", () => {
    expect(containsProfanity("orospunun")).toBe(true);
    expect(containsProfanity("siktir")).toBe(true);
    expect(containsProfanity("yavşaklar")).toBe(true);
  });

  it("araya ayraç sıkıştırarak kaçmayı engeller", () => {
    expect(containsProfanity("a.m.k")).toBe(true);
    expect(containsProfanity("s-i-k-t-i-r")).toBe(true);
    expect(containsProfanity("a m k")).toBe(true);
  });

  it("rakam/sembol ikamesini çözer", () => {
    expect(containsProfanity("s1kt1r")).toBe(true);
    expect(containsProfanity("p1ç")).toBe(true);
  });

  it("harf uzatmasını yakalar", () => {
    expect(containsProfanity("siiiktir")).toBe(true);
  });

  it("cümle içinde geçse de yakalar", () => {
    expect(containsProfanity("bence orospu çocuğu")).toBe(true);
  });

  // Yanlış pozitifler bu filtrenin en büyük riski: masum bir kelimeyi
  // sansürlemek, küfrü kaçırmaktan daha çok göze batar.
  it("kökle çakışan masum kelimeleri sansürlemez", () => {
    expect(containsProfanity("siklet")).toBe(false);
    expect(containsProfanity("sikke")).toBe(false);
    expect(containsProfanity("götürmek")).toBe(false);
    expect(containsProfanity("götürdü")).toBe(false);
  });

  it("kısa kökleri kelime ortasında/başında aramaz", () => {
    // "am" yalnızca tam eşleşmede küfür sayılır.
    expect(containsProfanity("ama")).toBe(false);
    expect(containsProfanity("amaç")).toBe(false);
    expect(containsProfanity("amca")).toBe(false);
    expect(containsProfanity("amerika")).toBe(false);
    // "sik" ortada geçiyor ama kelime onunla başlamıyor.
    expect(containsProfanity("psikoloji")).toBe(false);
    expect(containsProfanity("fizik")).toBe(false);
    expect(containsProfanity("klasik")).toBe(false);
    expect(containsProfanity("müzik")).toBe(false);
  });

  it("sıradan cevapları geçirir", () => {
    expect(containsProfanity("Ankara")).toBe(false);
    expect(containsProfanity("kahve")).toBe(false);
    expect(containsProfanity("")).toBe(false);
  });
});

describe("maskProfanity", () => {
  it("küfrü ilk harf + yıldız olarak maskeler", () => {
    expect(maskProfanity("orospu")).toBe("o*****");
  });

  it("cümledeki yalnızca küfürlü kelimeyi maskeler", () => {
    expect(maskProfanity("bence piç")).toBe("bence p**");
  });

  it("temiz metne dokunmaz", () => {
    expect(maskProfanity("Ankara")).toBe("Ankara");
  });
});

describe("safeForDisplay", () => {
  it("temiz metni aynen döndürür", () => {
    expect(safeForDisplay("İstanbul")).toBe("İstanbul");
  });

  it("küfürlü metni maskeler", () => {
    expect(safeForDisplay("siktir")).not.toContain("iktir");
  });
});
