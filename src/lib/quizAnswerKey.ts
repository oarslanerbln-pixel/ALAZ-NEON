import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { retentionExpiry } from "./retention";
import type { QuizOption } from "../types/database";

/**
 * Quiz cevap anahtarının Firestore tarafı: rooms/{roomId}/secret/quiz.
 * Kural bu dokümanı yalnızca odanın host'una açıyor (bkz. firestore.rules
 * → rooms/secret); saf mantık lib/quizReveal.ts'te.
 */
const answerKeyRef = (roomId: string) => doc(db, "rooms", roomId, "secret", "quiz");

/** Yeni oyunun anahtarını yazar. Sorular odaya yazılmadan ÖNCE çağrılmalı. */
export async function saveQuizAnswerKey(roomId: string, answerKey: QuizOption[]): Promise<void> {
  // expires_at: odanın kendisi gibi TTL ile silinsin (README → Data retention).
  await setDoc(answerKeyRef(roomId), { answers: answerKey, expires_at: retentionExpiry() });
}

/**
 * Anahtarı canlı dinler: TV yenilense de puanlama doğru anahtarla sürsün.
 * Doküman yoksa (oyun henüz başlamadı) boş liste bildirir.
 */
export function subscribeQuizAnswerKey(
  roomId: string,
  onKey: (answerKey: QuizOption[]) => void,
): () => void {
  return onSnapshot(
    answerKeyRef(roomId),
    (snap) => onKey((snap.data()?.answers as QuizOption[] | undefined) ?? []),
    (err) => console.error("[quizAnswerKey] Cevap anahtarı okunamadı:", err),
  );
}
