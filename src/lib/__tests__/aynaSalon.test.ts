import { describe, it, expect } from "vitest";

import {
  AYNA_SALON_MIN,
  SALON_QUESTIONS,
  applySurveyResults,
  buildQuestionOrder,
  isSalonId,
  salonQuestionCount,
  salonTruth,
  tallySurvey,
} from "../aynaSalon";
import { AYNA_QUESTIONS, aynaRoundQuestion } from "../aynaQuestions";

describe("salonQuestionCount", () => {
  it("toplamın yaklaşık üçte biri, en az bir", () => {
    expect(salonQuestionCount(5)).toBe(2);
    expect(salonQuestionCount(7)).toBe(2);
    expect(salonQuestionCount(10)).toBe(3);
    expect(salonQuestionCount(1)).toBe(0);
  });
});

describe("buildQuestionOrder", () => {
  const world = ["w1", "w2", "w3", "w4", "w5", "w6", "w7"];

  it("salon sorularını aralara serpiştirir, ilk soru dünya sorusu", () => {
    const { order, reserves } = buildQuestionOrder(world, ["s1", "s2"], 7);
    expect(order).toEqual(["w1", "w2", "s1", "w3", "s2", "w4", "w5"]);
    expect(reserves).toEqual(["w6", "w7"]);
  });

  it("istenen toplamı tutturur", () => {
    const { order } = buildQuestionOrder(world, ["s1", "s2", "s3"], 7);
    expect(order).toHaveLength(7);
    expect(order[0]).toBe("w1");
  });

  it("salon sorusu yoksa yalnızca dünya soruları", () => {
    expect(buildQuestionOrder(world, [], 3).order).toEqual(["w1", "w2", "w3"]);
  });
});

describe("tallySurvey", () => {
  it("evet/hayır sayar, geçilen ve kurcalanmış değerleri saymaz", () => {
    const docs = [
      { answers: { a: true, b: false } },
      { answers: { a: false } },
      { answers: { a: "evet", b: 1 } },
      { answers: null },
      {},
    ];
    expect(tallySurvey(docs, ["a", "b"])).toEqual({ a: { yes: 1, total: 2 }, b: { yes: 0, total: 1 } });
  });
});

describe("salonTruth — mahremiyet eşiği", () => {
  it(`${AYNA_SALON_MIN} kişinin altında gerçek yok (soru sorulmaz)`, () => {
    expect(salonTruth({ yes: 3, total: AYNA_SALON_MIN - 1 })).toBeNull();
    expect(salonTruth(undefined)).toBeNull();
  });

  it("eşikte ve üstünde yuvarlanmış yüzde", () => {
    expect(salonTruth({ yes: 2, total: 6 })).toBe(33);
    expect(salonTruth({ yes: 5, total: 5 })).toBe(100);
  });
});

describe("applySurveyResults", () => {
  const order = ["w1", "salon-bilingual", "w2", "salon-morning"];

  it("yetersiz cevaplı salon sorusunu yedekle değiştirir", () => {
    const tally = { "salon-bilingual": { yes: 4, total: 9 }, "salon-morning": { yes: 1, total: 2 } };
    expect(applySurveyResults(order, ["w9"], tally)).toEqual(["w1", "salon-bilingual", "w2", "w9"]);
  });

  it("yedek kalmadıysa soruyu atlar", () => {
    expect(applySurveyResults(order, [], {})).toEqual(["w1", "w2"]);
  });
});

describe("salon soru havuzu", () => {
  it("kimlikler benzersiz, dünya sorularıyla çakışmıyor ve tanınıyor", () => {
    const ids = SALON_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(isSalonId)).toBe(true);
    expect(AYNA_QUESTIONS.some((q) => isSalonId(q.id))).toBe(false);
  });

  it("her soru üç dilde dolu ve TV'de okunabilir uzunlukta", () => {
    for (const q of SALON_QUESTIONS) {
      for (const locale of ["tr", "de", "en"] as const) {
        expect(q.prompt[locale].trim(), `${q.id}.prompt.${locale}`).not.toBe("");
        expect(q.text[locale].length, `${q.id}.text.${locale}`).toBeLessThanOrEqual(130);
      }
    }
  });
});

describe("aynaRoundQuestion", () => {
  it("salon sorusunu gerçek ve kaynakla birlikte dünya sorusu biçiminde verir", () => {
    const q = aynaRoundQuestion("salon-bilingual", { ayna_round_truth: 64, ayna_round_sample: 18 }, "tr");
    expect(q).toMatchObject({ category: "salon", answer: 64, unit: "percent", source: "Bu salon · 18 kişi" });
  });

  it("dünya sorusunu havuzdan verir", () => {
    expect(aynaRoundQuestion("ayna-vaccines", {}, "en")?.answer).toBe(84);
  });

  it("bilinmeyen kimlikte undefined", () => {
    expect(aynaRoundQuestion("yok", {}, "tr")).toBeUndefined();
  });
});
