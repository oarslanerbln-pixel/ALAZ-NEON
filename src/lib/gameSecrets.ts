/**
 * Oyunların gizli bilgileri (doğru cevaplar, kasa kodu): oda belgesi herkese
 * açık okunduğu için `rooms/{id}/secrets/{ad}` belgesinde, yalnızca host'a
 * açık (firestore.rules). Burada saf ayırma/birleştirme; yazma verisi
 * lib/clientWrites.ts'te.
 */
import type { PublicQuizQuestion, QuizQuestion } from "../types/database";

/** `rooms/{id}/secrets/` altındaki belge adları. */
export const SECRET_DOC = { quiz: "quiz", vault: "vault", ayna: "ayna" } as const;
export type SecretDoc = (typeof SECRET_DOC)[keyof typeof SECRET_DOC];

export interface QuizSecret {
  answers: Record<string, { correctOption: QuizQuestion["correctOption"]; funFact?: string }>;
}

/** Soruları odaya yazılacak açık kısım ve host'a özel cevaplar olarak ayırır. */
export function splitQuizQuestions(questions: readonly QuizQuestion[]): {
  questions: PublicQuizQuestion[];
  secret: QuizSecret;
} {
  const answers: QuizSecret["answers"] = {};
  const open = questions.map(({ correctOption, funFact, ...rest }) => {
    answers[rest.id] = funFact ? { correctOption, funFact } : { correctOption };
    return rest;
  });
  return { questions: open, secret: { answers } };
}

/** Host ekranı için soruyu cevabıyla birleştirir; cevap henüz okunmadıysa null. */
export function withQuizAnswer(
  question: PublicQuizQuestion | null | undefined,
  secret: QuizSecret | null | undefined,
): QuizQuestion | null {
  if (!question) return null;
  // Bu sürümden önce açılmış odalarda cevap hâlâ soruyla birlikte duruyor.
  if ("correctOption" in question) return question as QuizQuestion;
  const answer = secret?.answers?.[question.id];
  return answer ? { ...question, ...answer } : null;
}
