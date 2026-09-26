import { describe, it, expect } from "vitest";

import {
  AYNA_BASE_POINTS,
  AYNA_EXACT_BONUS,
  layoutGuessDots,
  parseGuess,
  pickQuestionIds,
  scoreGuess,
  summarizeGuesses,
  topScorers,
} from "../ayna";
import { AYNA_QUESTIONS, formatAynaDelta, formatAynaValue } from "../aynaQuestions";

describe("parseGuess — istemci kurcalanabilir", () => {
  it("geçerli sayıyı kabul eder", () => {
    expect(parseGuess("42")).toBe(42);
    expect(parseGuess(17.5)).toBe(17.5);
  });

  it("skala dışını sınırına kırpar — dışarıdan ekstra puan yok", () => {
    expect(parseGuess("250")).toBe(100);
    expect(parseGuess("-9")).toBe(0);
  });

  it("sayı olmayanı tahmin saymaz", () => {
    expect(parseGuess("abc")).toBeNull();
    expect(parseGuess("")).toBeNull();
    expect(parseGuess(undefined)).toBeNull();
    expect(parseGuess(Number.NaN)).toBeNull();
  });
});

describe("scoreGuess", () => {
  it("tam isabet taban puan + bonus", () => {
    expect(scoreGuess(84, 84)).toBe(AYNA_BASE_POINTS + AYNA_EXACT_BONUS);
    expect(scoreGuess(83, 84)).toBe(960 + AYNA_EXACT_BONUS);
  });

  it("uzaklaştıkça doğrusal azalır", () => {
    expect(scoreGuess(74, 84)).toBe(600);
    expect(scoreGuess(64, 84)).toBe(200);
  });

  it("25 ve üzeri sapma puan almaz", () => {
    expect(scoreGuess(59, 84)).toBe(0);
    expect(scoreGuess(0, 84)).toBe(0);
  });
});

describe("summarizeGuesses — salon aynası", () => {
  it("açık çoğunluk düşük tahmin ettiyse bunu söyler", () => {
    const s = summarizeGuesses([20, 30, 40, 50, 90], 84);
    expect(s.underPct).toBe(80);
    expect(s.verdict).toBe("under");
    expect(s.median).toBe(40);
  });

  it("çoğunluk yoksa salonu bölünmüş sayar", () => {
    const s = summarizeGuesses([10, 90, 10, 90], 50);
    expect(s.verdict).toBe("split");
    expect(s.median).toBe(50);
  });

  it("tam isabetleri ne üste ne alta sayar", () => {
    const s = summarizeGuesses([84, 85, 30], 84);
    expect(s.exactCount).toBe(2);
    expect(s.underPct).toBe(33);
  });

  it("tahmin yoksa sessiz kalır", () => {
    expect(summarizeGuesses([], 50)).toMatchObject({ count: 0, median: null, verdict: "none" });
  });
});

describe("layoutGuessDots", () => {
  it("aynı kutudaki tahminleri üst üste dizer, deterministik", () => {
    const dots = layoutGuessDots({ b: 41, a: 40, c: 90 });
    expect(dots).toEqual([
      { playerId: "a", value: 40, stack: 0 },
      { playerId: "b", value: 41, stack: 1 },
      { playerId: "c", value: 90, stack: 0 },
    ]);
  });
});

describe("topScorers", () => {
  it("sıfır puanlıları dışarıda bırakıp büyükten küçüğe sıralar", () => {
    expect(topScorers({ a: 200, b: 0, c: 900, d: 500 }, 2)).toEqual([
      { playerId: "c", points: 900 },
      { playerId: "d", points: 500 },
    ]);
  });
});

describe("pickQuestionIds", () => {
  const pool = ["q1", "q2", "q3", "q4"];
  const fixed = () => 0;

  it("yakın zamanda sorulanları sona iter", () => {
    const picked = pickQuestionIds(pool, 2, ["q1", "q2"], fixed);
    expect(picked).toHaveLength(2);
    expect(picked.every((id) => id === "q3" || id === "q4")).toBe(true);
  });

  it("havuz yetmezse eskileri de kullanır — oyun eksik soruyla başlamaz", () => {
    expect(pickQuestionIds(pool, 4, ["q1", "q2", "q3"], fixed)).toHaveLength(4);
  });

  it("tekrar eden soru üretmez", () => {
    const picked = pickQuestionIds(pool, 10);
    expect(new Set(picked).size).toBe(picked.length);
  });
});

describe("AYNA soru havuzu", () => {
  it("kimlikler benzersiz", () => {
    const ids = AYNA_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("her cevap skalaya sığıyor ve her sorunun kaynağı var", () => {
    for (const q of AYNA_QUESTIONS) {
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThanOrEqual(100);
      expect(q.source.trim(), q.id).not.toBe("");
    }
  });

  it("her soru ve not üç dilde de dolu", () => {
    for (const q of AYNA_QUESTIONS) {
      for (const locale of ["tr", "de", "en"] as const) {
        expect(q.text[locale].trim(), `${q.id}.text.${locale}`).not.toBe("");
        expect(q.insight[locale].trim(), `${q.id}.insight.${locale}`).not.toBe("");
        expect(q.text[locale].length, `${q.id} TV'de okunamayacak kadar uzun`).toBeLessThanOrEqual(130);
      }
    }
  });

  it("bir oyunluk soru çıkıyor", () => {
    expect(AYNA_QUESTIONS.length).toBeGreaterThanOrEqual(20);
  });
});

describe("formatAynaValue", () => {
  it("dile göre yüzde ve yıl biçimi", () => {
    expect(formatAynaValue(84, "percent", "tr")).toBe("%84");
    expect(formatAynaValue(3.7, "percent", "de")).toBe("3,7\u00A0%");
    expect(formatAynaValue(73, "years", "en")).toBe("73\u00A0years");
  });

  it("yüzdeler arasındaki fark yüzde değil yüzde puan", () => {
    expect(formatAynaDelta(36, "percent", "tr")).toBe("36\u00A0yüzde puan");
    expect(formatAynaDelta(4, "years", "de")).toBe("4\u00A0Jahre");
  });
});
