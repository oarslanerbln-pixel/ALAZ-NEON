import type { QuizQuestion } from "../types/database";
import { topicOf } from "./quizTopics";
import { trQuestions } from "./quiz/questions.tr";
import { deQuestions } from "./quiz/questions.de";
import { enQuestions } from "./quiz/questions.en";

// Soru havuzlari locale basina ayri modullerde (src/lib/quiz/); burada
// yalnizca secim mantigi durur. Eski import yollari korunsun diye
// havuzlar buradan da disa aktariliyor.
export { trQuestions, deQuestions, enQuestions };

export interface QuizSelectionOptions {
  /** Kurulum modalinde secilen konular; bos/atlanirsa hepsi. */
  topics?: readonly string[];
  /** Yakinda sorulmus soru kimlikleri (bkz. questionHistory) — en yeni once. */
  recentIds?: readonly string[];
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function poolFor(locale: string): QuizQuestion[] {
  if (locale.startsWith("de")) return deQuestions;
  if (locale.startsWith("en")) return enQuestions;
  return trQuestions;
}

/**
 * Bir tur icin soru secer.
 *
 * Iki davranis onceki surumden farkli:
 *
 * 1. KONU FILTRESI. Kurulum modali host'a kategori sectiriyordu ama secim
 *    hicbir yere gitmiyordu — getQuizQuestions kategori parametresi bile
 *    almiyordu. Artik gecirilen konular uygulaniyor; secimle eslesen soru
 *    yoksa filtre yok sayiliyor (host'a bos tur gostermektense tum havuzdan
 *    sormak yeg).
 *
 * 2. TEKRAR HAFIZASI. Onceden her oturum havuzu sifirdan karistiriyordu,
 *    yani haftalik gelen mudavim ayni sorulari goruyordu. Once HIC
 *    sorulmamis sorular geliyor; havuz yetmezse en UZUN SURE once sorulanlar
 *    ekleniyor. Havuz tur uzunlugundan kucukse tekrar kacinilmaz, o durumda
 *    da ust uste ayni soru gelmiyor.
 */
export function getQuizQuestions(
  locale: string = "tr",
  count: number = 5,
  options: QuizSelectionOptions = {},
): QuizQuestion[] {
  const basePool = poolFor(locale);

  const wanted = options.topics && options.topics.length > 0 ? new Set(options.topics) : null;
  const filtered = wanted ? basePool.filter((q) => {
    const topic = topicOf(q);
    return topic !== null && wanted.has(topic);
  }) : basePool;
  const pool = filtered.length > 0 ? filtered : basePool;

  // recentIds en yeniden eskiye; indeks kucukse "daha yakinda soruldu".
  const recency = new Map<string, number>();
  (options.recentIds ?? []).forEach((id, i) => {
    if (!recency.has(id)) recency.set(id, i);
  });

  const unseen = shuffle(pool.filter((q) => !recency.has(q.id)));
  const seen = pool
    .filter((q) => recency.has(q.id))
    .sort((a, b) => recency.get(b.id)! - recency.get(a.id)!); // en eski once

  const ordered = [...unseen, ...seen];
  if (ordered.length >= count) return ordered.slice(0, count);

  // Havuz turdan kisa: bastan devam et, ama ust uste ayni soruyu verme.
  const result = [...ordered];
  while (result.length < count) {
    const lap = shuffle(ordered);
    if (lap[0]?.id === result[result.length - 1]?.id && lap.length > 1) {
      [lap[0], lap[1]] = [lap[1], lap[0]];
    }
    result.push(...lap.slice(0, count - result.length));
  }
  return result;
}
