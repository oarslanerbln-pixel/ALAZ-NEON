import { describe, it, expect } from "vitest";
import { splitQuizQuestions, withQuizAnswer } from "../gameSecrets";
import type { QuizQuestion } from "../../types/database";

const q = (id: string, correctOption: QuizQuestion["correctOption"], funFact?: string): QuizQuestion => ({
  id,
  text: `Soru ${id} metni burada?`,
  options: { A: "a", B: "b", C: "c", D: "d" },
  correctOption,
  difficulty: 1,
  ...(funFact ? { funFact } : {}),
});

describe("splitQuizQuestions", () => {
  it("odaya giden soruda doğru cevap ve bilgi notu yok", () => {
    const { questions, secret } = splitQuizQuestions([q("q1", "B", "not"), q("q2", "D")]);
    for (const open of questions) {
      expect(open).not.toHaveProperty("correctOption");
      expect(open).not.toHaveProperty("funFact");
    }
    expect(secret.answers).toEqual({ q1: { correctOption: "B", funFact: "not" }, q2: { correctOption: "D" } });
  });
});

describe("withQuizAnswer", () => {
  it("host ekranı için soruyu cevabıyla birleştirir", () => {
    const { questions, secret } = splitQuizQuestions([q("q1", "C", "not")]);
    expect(withQuizAnswer(questions[0], secret)).toEqual(q("q1", "C", "not"));
  });

  it("cevap henüz okunmadıysa null; eski odada sorudaki cevap kullanılır", () => {
    const { questions } = splitQuizQuestions([q("q1", "A")]);
    expect(withQuizAnswer(questions[0], null)).toBeNull();
    expect(withQuizAnswer(null, { answers: {} })).toBeNull();
    expect(withQuizAnswer(q("eski", "D"), null)?.correctOption).toBe("D");
  });
});
