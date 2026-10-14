import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../lib/firebase";
import { quizPackPayload } from "../lib/clientWrites";
import { toMillis } from "../lib/timestamps";
import { parseQuizPack, type QuizPack, type QuizPackLocale } from "../lib/quizPack";
import { createLogger } from "../lib/logger";

const log = createLogger("QuizPacks");

/**
 * Mekan/kurum soru paketleri (docs/roadmap.md, 3.4): `quiz_packs`
 * koleksiyonu. Yalnızca personel okur/yazar (firestore.rules); TV personel
 * hesabıyla açıldığı için ayar penceresi de listeyi görebiliyor.
 */
export interface QuizPackSummary {
  id: string;
  title: string;
  locale: QuizPackLocale;
  questionCount: number;
  createdAt: number;
}

/** Paket listesi; `enabled` false iken dinlemez (personel değilse okuma reddedilir). */
export function useQuizPacks(enabled: boolean): QuizPackSummary[] | null {
  const [packs, setPacks] = useState<QuizPackSummary[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const q = query(collection(db, "quiz_packs"), orderBy("created_at", "desc"));
    return onSnapshot(
      q,
      (snap) =>
        setPacks(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: String(data.title ?? ""),
              locale: data.locale as QuizPackLocale,
              questionCount: Array.isArray(data.questions) ? data.questions.length : 0,
              createdAt: toMillis(data.created_at),
            };
          }),
        ),
      (err) => {
        log.error("Soru paketleri okunamadı:", err);
        setPacks([]);
      },
    );
  }, [enabled]);

  return enabled ? packs : null;
}

export async function saveQuizPack(pack: QuizPack, uid: string): Promise<string> {
  const ref = await addDoc(collection(db, "quiz_packs"), quizPackPayload(pack, uid));
  return ref.id;
}

export async function deleteQuizPack(id: string): Promise<void> {
  await deleteDoc(doc(db, "quiz_packs", id));
}

/**
 * Oyun başında paketi okur ve yeniden doğrular (konsoldan elle düzenlenmiş
 * bozuk bir paket TV'yi düşürmesin). Geçersiz ya da yoksa null.
 */
export async function loadQuizPack(id: string): Promise<QuizPack | null> {
  const snap = await getDoc(doc(db, "quiz_packs", id));
  if (!snap.exists()) return null;
  const result = parseQuizPack(snap.data());
  if (!result.ok) {
    log.warn("Soru paketi geçersiz, gömülü havuz kullanılıyor:", id, result.issues);
    return null;
  }
  return result.value;
}
