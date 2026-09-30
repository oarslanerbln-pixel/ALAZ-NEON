import { collection, getDocs, query, where, writeBatch, type QueryDocumentSnapshot } from "firebase/firestore";

import { db } from "./firebase";
import { chunk, FIRESTORE_BATCH_LIMIT } from "./firestoreData";

/**
 * Bir oyun bitip yenisi başlarken odadan önceki oyunun geçici kayıtlarını
 * siler.
 *
 * Oyunlar cevaplarını tur anahtarıyla (`round_letter`: harf, "ayna_0",
 * "VAULT"…) ayırıyor ve bu anahtarlar oyunlar arasında TEKRARLANIYOR. Aynı
 * odada ikinci kez açılan bir oyun, eski cevapları kendi cevabı sanıyordu:
 * AYNA'da misafirin telefonu her soruyu "zaten kilitledin" diye açıyor, TV
 * herkesi kilitlemiş sayıp soruyu anında kapatıyor, puan da ESKİ tahmine
 * veriliyordu. Quiz ve Sensör bunu kendi başlangıçlarında zaten yapıyordu;
 * yardımcı ortak ve 500 işlemlik batch sınırına dayanıklı.
 */
async function deleteAll(docs: readonly QueryDocumentSnapshot[]): Promise<number> {
  for (const part of chunk(docs, FIRESTORE_BATCH_LIMIT)) {
    const batch = writeBatch(db);
    part.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return docs.length;
}

/** Odanın bütün cevaplarını siler (yalnızca host'a açık, bkz. firestore.rules). */
export async function deleteRoomAnswers(roomId: string): Promise<number> {
  const snap = await getDocs(query(collection(db, "answers"), where("room_id", "==", roomId)));
  return deleteAll(snap.docs);
}

/**
 * Odanın AYNA salon anketi cevaplarını siler. Anket dokümanının kimliği
 * `<room_id>_<uid>` ve kural ikinci yazmayı reddettiği için, silinmezse aynı
 * odada ikinci AYNA'da hiçbir misafir anketi dolduramıyordu. Sorgu okuma
 * kuralından geçmek için `host_uid` filtresi taşıyor.
 */
export async function deleteAynaSurvey(roomId: string, hostUid: string): Promise<number> {
  const snap = await getDocs(
    query(collection(db, "ayna_survey"), where("room_id", "==", roomId), where("host_uid", "==", hostUid)),
  );
  return deleteAll(snap.docs);
}
