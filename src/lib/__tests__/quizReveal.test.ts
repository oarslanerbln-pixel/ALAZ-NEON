import { describe, it, expect } from "vitest";
import { revealedOption, splitAnswerKey } from "../quizReveal";
import type { QuizQuestion } from "../../types/database";

const question = (id: string, correctOption: QuizQuestion["correctOption"]): QuizQuestion => ({
  id,
  text: `Soru ${id}`,
  options: { A: "a", B: "b", C: "c", D: "d" },
  correctOption,
  difficulty: 1,
  funFact: "bilgi",
});

describe("splitAnswerKey — doğru şık odaya yazılmaz", () => {
  it("odaya giden sorularda correctOption alanı hiç yok", () => {
    const { questions } = splitAnswerKey([question("q1", "B"), question("q2", "D")]);
    for (const q of questions) {
      expect("correctOption" in q).toBe(false);
    }
    expect(questions[0]).toEqual({
      id: "q1",
      text: "Soru q1",
      options: { A: "a", B: "b", C: "c", D: "d" },
      difficulty: 1,
      funFact: "bilgi",
    });
  });

  it("anahtar soru sırasını koruyor", () => {
    const { answerKey } = splitAnswerKey([question("q1", "B"), question("q2", "D"), question("q3", "A")]);
    expect(answerKey).toEqual(["B", "D", "A"]);
  });
});

describe("revealedOption — açıklama yalnızca kendi sorusunda görünür", () => {
  it("açıklama yoksa null", () => {
    expect(revealedOption({}, 0)).toBeNull();
    expect(revealedOption({ quiz_reveal: null }, 0)).toBeNull();
  });

  it("açıklanan sorunun şıkkını döner", () => {
    expect(revealedOption({ quiz_reveal: { index: 2, option: "C" } }, 2)).toBe("C");
  });

  it("başka bir sorunun açıklaması yeni soruya sızmaz", () => {
    expect(revealedOption({ quiz_reveal: { index: 1, option: "C" } }, 2)).toBeNull();
  });
});
