import type { PublicQuizQuestion, QuizOption, QuizQuestion, Room } from "../types/database";

/**
 * Quiz cevap anahtarının saf mantığı — Firebase'siz (bkz. rewardWinners
 * başındaki not), Firestore'a yazan kısım lib/quizAnswerKey.ts'te.
 *
 * Oda dokümanı herkese açık (telefonlar PIN ile bağlanıyor). Sorular doğru
 * şıklarıyla oraya yazıldığında, oyun başlamadan BÜTÜN cevaplar birkaç
 * satırlık bir konsol sorgusuyla okunabiliyordu; kazanana gerçek ödül
 * verildiği için bu doğrudan maliyet. Artık sorular odaya şıksız yazılıyor,
 * anahtar host'a özel dokümanda duruyor ve her sorunun cevabı ancak
 * cevaplar kilitlendikten sonra `quiz_reveal` ile açıklanıyor.
 *
 * Kalan risk: soru havuzu uygulama paketinde (quizQuestions). Soru metnini
 * pakette arayan biri cevabı yine bulabilir; tam çözüm sunucu tarafı
 * (Blaze planı) gerektiriyor.
 */
export function splitAnswerKey(questions: QuizQuestion[]): {
  questions: PublicQuizQuestion[];
  answerKey: QuizOption[];
} {
  return {
    // Yayılım + delete: isteğe bağlı alanlar (category, funFact) yoksa
    // `undefined` olarak eklenmesin — Firestore undefined değeri reddediyor.
    questions: questions.map((q) => {
      const publicPart: Partial<QuizQuestion> = { ...q };
      delete publicPart.correctOption;
      return publicPart as PublicQuizQuestion;
    }),
    answerKey: questions.map((q) => q.correctOption),
  };
}

/** Bu sorunun açıklanmış doğru şıkkı; henüz açıklanmadıysa null. */
export function revealedOption(
  room: Pick<Room, "quiz_reveal">,
  questionIndex: number,
): QuizOption | null {
  const reveal = room.quiz_reveal;
  return reveal && reveal.index === questionIndex ? reveal.option : null;
}
