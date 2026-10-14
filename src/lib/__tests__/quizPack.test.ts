import { describe, it, expect } from "vitest";
import { parseQuizPack, QUIZ_PACK_LIMITS, validateQuestions, type QuizIssue } from "../quizPack";

const question = (n: number, over: Record<string, unknown> = {}) => ({
  id: `firma_${n}`,
  text: `Şirketimiz hangi yılda kuruldu? (${n})`,
  options: { A: "1990", B: "2001", C: "2010", D: "2020" },
  correctOption: "B",
  difficulty: 2,
  ...over,
});

const pack = (over: Record<string, unknown> = {}) => ({
  title: "Yılbaşı Partisi",
  locale: "tr",
  questions: [1, 2, 3, 4, 5].map((n) => question(n)),
  ...over,
});

const codes = (result: ReturnType<typeof parseQuizPack>): QuizIssue[] => (result.ok ? [] : result.issues);

describe("parseQuizPack", () => {
  it("geçerli paketi kabul eder, boşlukları kırpar ve fazladan alanları atar", () => {
    const result = parseQuizPack(
      pack({ title: "  Yılbaşı  ", questions: [1, 2, 3, 4, 5].map((n) => question(n, { secret: 1, funFact: " Bilgi " })) }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.title).toBe("Yılbaşı");
    expect(result.value.questions[0]).toEqual({ ...question(1), funFact: "Bilgi" });
  });

  it("nesne olmayan dosyayı reddeder", () => {
    expect(codes(parseQuizPack([question(1)]))).toEqual([{ code: "notObject" }]);
    expect(codes(parseQuizPack(null))).toEqual([{ code: "notObject" }]);
  });

  it("başlık, dil ve soru sayısı sınırları", () => {
    expect(codes(parseQuizPack(pack({ title: "" })))).toContainEqual({ code: "title" });
    expect(codes(parseQuizPack(pack({ title: "x".repeat(QUIZ_PACK_LIMITS.titleMax + 1) })))).toContainEqual({ code: "title" });
    expect(codes(parseQuizPack(pack({ locale: "fr" })))).toContainEqual({ code: "locale" });
    expect(codes(parseQuizPack(pack({ questions: [question(1)] })))).toContainEqual({ code: "count" });
    expect(codes(parseQuizPack(pack({ questions: "yok" })))).toContainEqual({ code: "count" });
  });

  it("soru hatalarını soru kimliğiyle bildirir", () => {
    const questions = [
      question(1, { options: { A: "a", B: "b", C: "c" } }),
      question(2, { options: { A: "Evet", B: "evet", C: "Hayır", D: "Belki" } }),
      question(3, { correctOption: "E" }),
      question(4, { difficulty: 5 }),
      question(5, { text: "Kısa?" }),
      question(6, { id: "boşluklu kimlik" }),
    ];
    expect(codes(parseQuizPack(pack({ questions })))).toEqual([
      { code: "options", ref: "firma_1" },
      { code: "duplicateOptions", ref: "firma_2" },
      { code: "correctOption", ref: "firma_3" },
      { code: "difficulty", ref: "firma_4" },
      { code: "text", ref: "firma_5" },
      { code: "id", ref: "boşluklu kimlik" },
    ]);
  });

  it("kimliği olmayan soruyu sırasıyla gösterir", () => {
    const questions = [question(1), question(2), "soru değil", question(4, { id: "" }), question(5)];
    expect(codes(parseQuizPack(pack({ questions })))).toEqual([
      { code: "questionShape", ref: "#3" },
      { code: "id", ref: "#4" },
    ]);
  });
});

describe("validateQuestions", () => {
  it("yinelenen kimlik ve metni yakalar (büyük/küçük harf duyarsız)", () => {
    const result = validateQuestions([
      question(1),
      question(1, { text: "Başka bir soru metni burada?" }),
      question(2, { text: "WHAT YEAR WAS THE COMPANY FOUNDED?" }),
      question(3, { text: "What year was the company founded?" }),
    ]);
    expect(result.ok ? [] : result.issues).toEqual([
      { code: "duplicateId", ref: "firma_1" },
      { code: "duplicateText", ref: "firma_3" },
    ]);
  });
});

describe("örnek paket dosyası", () => {
  it("indirilen şablon şemaya uyar (yükleyen kişi doğrudan düzenleyebilsin)", async () => {
    const sample = (await import("../../content/quiz/sample-pack.json")).default;
    const result = parseQuizPack(sample);
    expect(result.ok ? [] : result.issues).toEqual([]);
  });
});
