import { collection, deleteField, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Bir gecede oyunlar arka arkaya oynanıyor ve aynı oda, aynı oyuncu
 * kayıtlarıyla devam ediyor (bkz. lib/roomSession.ts). Her oyunun kendi
 * skoru, canları ve cevapları bir sonrakine taşınmamalı:
 *
 * - Eski `answers` kalınca ikinci quiz'in 1. sorusu "herkes cevapladı"
 *   sayılıp anında kapanıyor, telefonlar eski şıkla kilitleniyordu.
 * - `total_score` sıfırlanmayınca ikinci oyunun kazananı (ödül ve gecelik
 *   lig puanı) bu oyunun değil gecenin toplamıyla seçiliyordu.
 * - Bombada elenen misafir sonraki bomba oyununa ölü başlıyordu.
 */

/** Firestore toplu yazımı en fazla 500 işlem alır; pay bırakıyoruz. */
export const BATCH_LIMIT = 450;

export function chunk<T>(items: readonly T[], size: number = BATCH_LIMIT): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Odanın bütün cevaplarını siler — 500'den fazlası birikmiş olsa da. */
export async function clearRoomAnswers(roomId: string): Promise<number> {
  const snapshot = await getDocs(query(collection(db, "answers"), where("room_id", "==", roomId)));
  for (const part of chunk(snapshot.docs)) {
    const batch = writeBatch(db);
    part.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return snapshot.size;
}

/** Oyun skorunu sıfırlar ve canları doldurur (alan yoksa 3 can sayılır). */
export async function resetPlayersForNewGame(playerIds: readonly string[]): Promise<void> {
  for (const part of chunk(playerIds)) {
    const batch = writeBatch(db);
    part.forEach((id) => batch.update(doc(db, "players", id), { total_score: 0, lives: deleteField() }));
    await batch.commit();
  }
}
