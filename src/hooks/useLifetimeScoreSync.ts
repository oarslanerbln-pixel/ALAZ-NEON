import { useEffect, useRef } from "react";
import { doc, updateDoc, writeBatch } from "firebase/firestore";

import { db } from "../lib/firebase";
import { pendingLifetimeCredits } from "../lib/lifetimeScore";
import { lifetimeCreditPayload, lifetimeMarkerPayload } from "../lib/clientWrites";
import { reportWriteError } from "../lib/writeErrors";
import type { Player } from "../types/database";

/**
 * Oda puanını kalıcı lig puanına (users/{uid}.total_lifetime_score) aktarır.
 *
 * Host ekranında çalışır: kural kalıcı puanı yalnızca personel hesabına
 * yazdırıyor ve oda yalnızca personel hesabıyla açılabiliyor (firestore.rules).
 * Eskiden bu aktarımı oyuncunun kendi telefonu yapıyordu — yani oyuncu
 * istediği puanı yazabiliyordu.
 *
 * Kullanıcı kaydına puan ekleme ile oyuncu dokümanındaki `lifetime_credited`
 * işaretçisi aynı batch'te yazılır: ya ikisi birden olur ya hiçbiri, aynı
 * puan iki kez eklenmez.
 */
export function useLifetimeScoreSync(players: Player[]) {
  // Yazması süren oyuncular: yanıt gelmeden gelen bir sonraki anlık görüntü
  // aynı farkı ikinci kez göndermesin.
  const inFlight = useRef(new Set<string>());

  useEffect(() => {
    for (const credit of pendingLifetimeCredits(players)) {
      if (inFlight.current.has(credit.playerId)) continue;
      inFlight.current.add(credit.playerId);

      const playerRef = doc(db, "players", credit.playerId);
      const batch = writeBatch(db);
      batch.update(playerRef, lifetimeMarkerPayload(credit.credited));
      if (credit.delta !== 0) {
        batch.update(doc(db, "users", credit.uid), lifetimeCreditPayload(credit.delta));
      }

      batch
        .commit()
        .catch(async (err) => {
          // Profil kaydı yoksa ya da bu oda personel hesabıyla açılmamışsa
          // (kurala geçişten önce açılmış eski bir oda) kalıcı puan
          // yazılamaz. İşaretçiyi yine de ilerletiyoruz: aksi hâlde her
          // anlık görüntüde aynı başarısız yazma tekrar denenirdi.
          reportWriteError("lifetime_credit", err);
          if (credit.delta !== 0) {
            await updateDoc(playerRef, lifetimeMarkerPayload(credit.credited)).catch(() => {});
          }
        })
        .finally(() => inFlight.current.delete(credit.playerId));
    }
  }, [players]);
}
