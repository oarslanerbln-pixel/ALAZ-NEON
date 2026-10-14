import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../lib/firebase";
import { quizPackPayload } from "../lib/clientWrites";
import { toMillis } from "../lib/timestamps";
import { parseQuizPack, type QuizPack, type QuizPackLocale } from "../lib/quizPack";
import { createLogger } from "../lib/logger";

const log = createLogger("QuizPacks");

/**
 * Mekan/kurum soru paketleri (docs/roadmap.md, 3.4): `venues/{v}/quiz_packs`.
 * Paket mekanındır (3.1, D7); yalnızca o mekanın personeli okur/yazar
 * (firestore.rules). TV personel hesabıyla açıldığı için ayar penceresi de
 * listeyi görebiliyor.
 */
const packs = (venueId: string) => collection(db, "venues", venueId, "quiz_packs");

export interface QuizPackSummary {
  id: string;
  title: string;
  locale: QuizPackLocale;
  questionCount: number;
  createdAt: number;
}

/** Mekanın paket listesi; `venueId` null iken dinlemez (personel değilse okuma reddedilir). */
export function useQuizPacks(venueId: string | null): QuizPackSummary[] | null {
  const [list, setList] = useState<{ venueId: string; packs: QuizPackSummary[] } | null>(null);

  useEffect(() => {
    if (!venueId) return;
    const q = query(packs(venueId), orderBy("created_at", "desc"));
    return onSnapshot(
      q,
      (snap) =>
        setList({
          venueId,
          packs: snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: String(data.title ?? ""),
              locale: data.locale as QuizPackLocale,
              questionCount: Array.isArray(data.questions) ? data.questions.length : 0,
              createdAt: toMillis(data.created_at),
            };
          }),
        }),
      (err) => {
        log.error("Soru paketleri okunamadı:", err);
        setList({ venueId, packs: [] });
      },
    );
  }, [venueId]);

  // Mekan değişince eski mekanın listesi bir an bile görünmesin.
  return venueId && list?.venueId === venueId ? list.packs : null;
}

export async function saveQuizPack(venueId: string, pack: QuizPack, uid: string): Promise<string> {
  const ref = await addDoc(packs(venueId), quizPackPayload(pack, uid));
  return ref.id;
}

export async function deleteQuizPack(venueId: string, id: string): Promise<void> {
  await deleteDoc(doc(packs(venueId), id));
}

/**
 * Oyun başında paketi okur ve yeniden doğrular (konsoldan elle düzenlenmiş
 * bozuk bir paket TV'yi düşürmesin). Geçersiz ya da yoksa null.
 */
export async function loadQuizPack(venueId: string, id: string): Promise<QuizPack | null> {
  const snap = await getDoc(doc(packs(venueId), id));
  if (!snap.exists()) return null;
  const result = parseQuizPack(snap.data());
  if (!result.ok) {
    log.warn("Soru paketi geçersiz, gömülü havuz kullanılıyor:", id, result.issues);
    return null;
  }
  return result.value;
}
