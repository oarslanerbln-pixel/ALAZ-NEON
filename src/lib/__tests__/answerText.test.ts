import { describe, it, expect } from "vitest";
import { cleanAnswerData, cleanAnswerText, MAX_ANSWER_LENGTH } from "../answerText";

describe("cleanAnswerText", () => {
  it("kesme işareti ve HTML karakterleri olduğu gibi kalır (React kaçışlıyor)", () => {
    expect(cleanAnswerText("Ankara'da")).toBe("Ankara'da");
    expect(cleanAnswerText('Tom & "Jerry" <3')).toBe('Tom & "Jerry" <3');
  });

  it("boşlukları sadeleştirir, görünmez ve yön değiştiren karakterleri atar", () => {
    expect(cleanAnswerText("  Ad\u200Bana \n\t Kebap  ")).toBe("Adana Kebap");
    expect(cleanAnswerText("\u202Eabc")).toBe("abc");
    expect(cleanAnswerText("Ma\u00ADlatya")).toBe("Malatya");
  });

  it("birleşik ve ayrık yazılmış harfleri aynı biçime getirir (NFC)", () => {
    expect(cleanAnswerText("I\u0307zmir")).toBe("\u0130zmir");
  });

  it("uzun metni karakter (kod noktası) sınırında keser, emojiyi bölmez", () => {
    expect(cleanAnswerText("a".repeat(5000))).toHaveLength(MAX_ANSWER_LENGTH);
    const emoji = "\u{1F600}".repeat(MAX_ANSWER_LENGTH + 5);
    expect(Array.from(cleanAnswerText(emoji))).toHaveLength(MAX_ANSWER_LENGTH);
    expect(cleanAnswerText(emoji)).not.toMatch(/[\uD800-\uDBFF]$/);
  });

  it("metin olmayan değer boş metin olur", () => {
    expect(cleanAnswerText(undefined)).toBe("");
    expect(cleanAnswerText(42)).toBe("");
    expect(cleanAnswerText({ toString: () => "x" })).toBe("");
  });
});

describe("cleanAnswerData", () => {
  it("anahtarları korur, değerleri temizler (meta alanlar dahil)", () => {
    expect(cleanAnswerData({ Şehir: " Adana ", _earlySubmit: "true" })).toEqual({
      Şehir: "Adana",
      _earlySubmit: "true",
    });
  });

  it("geçersiz veri boş harita olur", () => {
    expect(cleanAnswerData(null)).toEqual({});
    expect(cleanAnswerData("x")).toEqual({});
  });
});
