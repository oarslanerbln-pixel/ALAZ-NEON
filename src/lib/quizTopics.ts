import type { QuizQuestion } from "../types/database";

/**
 * Quiz konu kimlikleri — kurulum modalindeki kategori secimiyle ayni.
 *
 * Sorularin `category` alani dile gore degisen bir ETIKET ("🍸 GECE & KAFE",
 * "🍸 NACHTLEBEN", "🍸 NIGHTLIFE"). Diller arasinda stabil olan tek parca
 * bastaki emoji, dolayisiyla makine tarafi ona bakiyor. Yeni soru eklerken
 * kategori etiketi bu emojilerden biriyle BASLAMALI; aksi halde soru hicbir
 * kategori filtresine takilmaz (quizTopics testi bunu yakaliyor).
 */
export const QUIZ_TOPICS = ["gece", "muzik", "sinema", "zeka", "kultur", "bilim"] as const;

export type QuizTopic = (typeof QUIZ_TOPICS)[number];

const EMOJI_TO_TOPIC: Record<string, QuizTopic> = {
  "🍸": "gece",
  "☕": "gece",
  "🎵": "muzik",
  "🎬": "sinema",
  "🧠": "zeka",
  "🌍": "kultur",
  "🚀": "bilim",
};

/** Sorunun konusu; etiketi bilinen bir emojiyle baslamiyorsa null. */
export function topicOf(question: Pick<QuizQuestion, "category">): QuizTopic | null {
  const label = question.category?.trim();
  if (!label) return null;
  // Emojiler cok kod birimli olabiliyor; ilk "karakteri" Intl.Segmenter yerine
  // basit bir on-ek eslemesiyle buluyoruz (liste kucuk ve sabit).
  for (const [emoji, topic] of Object.entries(EMOJI_TO_TOPIC)) {
    if (label.startsWith(emoji)) return topic;
  }
  return null;
}
