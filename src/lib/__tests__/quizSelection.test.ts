import { describe, it, expect, beforeEach } from "vitest";

import { getQuizQuestions, poolFor } from "../quizQuestions";
import { topicOf, QUIZ_TOPICS } from "../quizTopics";
import {
  clearQuestionHistory,
  recentQuestionIds,
  rememberQuestions,
  HISTORY_TTL_MS,
} from "../questionHistory";

describe("konu eşlemesi", () => {
  it("her sorunun konusu çözülüyor", () => {
    // Kategori etiketi dile göre değişiyor; makine tarafı baştaki emojiye
    // bakıyor. Yeni bir soru bilinmeyen emojiyle eklenirse hiçbir kategori
    // filtresine takılmaz — bu test onu yakalar.
    const orphans: string[] = [];
    for (const locale of ["tr", "de", "en"]) {
      for (const q of poolFor(locale)) {
        if (topicOf(q) === null) orphans.push(`${q.id}: ${q.category}`);
      }
    }
    expect(orphans).toEqual([]);
  });

  it("bilinmeyen etiket null veriyor", () => {
    expect(topicOf({ category: "GENEL" })).toBeNull();
    expect(topicOf({ category: undefined })).toBeNull();
  });
});

describe("getQuizQuestions — konu filtresi", () => {
  it("yalnızca seçilen konudan soru veriyor", () => {
    const picked = getQuizQuestions("tr", 5, { topics: ["muzik"] });
    expect(picked.every((q) => topicOf(q) === "muzik")).toBe(true);
  });

  it("birden çok konu birleştiriliyor", () => {
    const topics = ["muzik", "sinema"];
    const picked = getQuizQuestions("tr", 6, { topics });
    expect(picked.every((q) => topics.includes(topicOf(q)!))).toBe(true);
  });

  it("eşleşen soru yoksa filtre yok sayılıyor — host boş tur görmesin", () => {
    const picked = getQuizQuestions("tr", 3, { topics: ["boyle-bir-konu-yok"] });
    expect(picked).toHaveLength(3);
  });

  it("konu verilmezse tüm havuz kullanılıyor", () => {
    expect(getQuizQuestions("tr", 4, {})).toHaveLength(4);
  });
});

describe("getQuizQuestions — tekrar hafızası", () => {
  it("yakında sorulmuş soruları sona bırakıyor", () => {
    const pool = poolFor("tr");
    const recent = pool.slice(0, 5).map((q) => q.id);
    const picked = getQuizQuestions("tr", 5, { recentIds: recent });
    expect(picked.some((q) => recent.includes(q.id))).toBe(false);
  });

  it("havuz tükenince EN ESKİ sorulanı önce geri getiriyor", () => {
    const pool = poolFor("tr");
    // Tamamı sorulmuş; recentIds en yeniden eskiye sıralı.
    const recent = pool.map((q) => q.id);
    const oldest = recent[recent.length - 1];
    const picked = getQuizQuestions("tr", 1, { recentIds: recent });
    expect(picked[0].id).toBe(oldest);
  });

  it("havuz turdan kısaysa üst üste aynı soruyu vermiyor", () => {
    const picked = getQuizQuestions("tr", 12, { topics: ["muzik"] });
    expect(picked).toHaveLength(12);
    for (let i = 1; i < picked.length; i++) {
      expect(picked[i].id).not.toBe(picked[i - 1].id);
    }
  });
});

describe("questionHistory", () => {
  beforeEach(() => clearQuestionHistory());

  it("yazılan sorular geri okunuyor", () => {
    rememberQuestions(["a", "b"]);
    expect(recentQuestionIds()).toEqual(expect.arrayContaining(["a", "b"]));
  });

  it("en son yazılan en başta", () => {
    const t0 = 1_700_000_000_000;
    rememberQuestions(["eski"], t0);
    rememberQuestions(["yeni"], t0 + 1000);
    expect(recentQuestionIds(t0 + 2000)[0]).toBe("yeni");
  });

  it("aynı soru iki kez yazılırsa tek kayıt kalıyor", () => {
    const t0 = 1_700_000_000_000;
    rememberQuestions(["a"], t0);
    rememberQuestions(["a"], t0 + 1000);
    expect(recentQuestionIds(t0 + 2000).filter((id) => id === "a")).toHaveLength(1);
  });

  it("TTL dolunca soru havuza geri dönüyor", () => {
    const t0 = 1_700_000_000_000;
    rememberQuestions(["a"], t0);
    expect(recentQuestionIds(t0 + HISTORY_TTL_MS + 1)).not.toContain("a");
  });

  it("bozuk depolama içeriği oyunu durdurmuyor", () => {
    localStorage.setItem("hengame_quiz_history", "{bozuk json");
    expect(recentQuestionIds()).toEqual([]);
  });
});

describe("konu kapsamı", () => {
  it("her dilde her konudan en az bir soru var", () => {
    // Host kurulum modalinde altı kategoriyi de seçebiliyor; bir dilde bir
    // kategori boşsa o seçim sessizce tüm havuza düşerdi.
    const missing: string[] = [];
    for (const locale of ["tr", "de", "en"]) {
      for (const topic of QUIZ_TOPICS) {
        if (!poolFor(locale).some((q) => topicOf(q) === topic)) {
          missing.push(`${locale}/${topic}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
