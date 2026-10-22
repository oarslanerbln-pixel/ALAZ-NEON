import { useCallback, useEffect } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";

import { db } from "../lib/firebase";
import { retentionExpiry } from "../lib/retention";

/**
 * Sekme görünürken `intervalMs`'de bir `beat` çağırır. Sekme gizlenince durur,
 * görünür olunca beklemeden bir sinyal atar. Eskiden iki ayrı kopya vardı ve
 * ikisi de arka planda yazmaya devam ediyordu: kilitli telefon sinyal
 * gönderip "canlı" görünüyor (bombayı alıp tur boyunca kilitliyordu), her
 * yazma da odadaki her dinleyiciye bir okuma olarak yansıyordu. Geri dönüşte
 * anlık sinyal, oyuncunun 15 sn beklemeden tekrar hedeflenebilir olmasını
 * sağlıyor.
 */
function useVisibleInterval(beat: (() => void) | null, intervalMs: number) {
  useEffect(() => {
    if (!beat) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer !== null) return;
      beat();
      timer = setInterval(beat, intervalMs);
    };
    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };
    const sync = () => (document.visibilityState === "hidden" ? stop() : start());

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [beat, intervalMs]);
}

/** Host ekranının canlılık sinyali: `rooms/{id}.host_last_active`. */
export function useHeartbeat(target: "rooms", field: "host_last_active", docId: string | null, intervalMs: number) {
  // Kimlik değişmedikçe aynı fonksiyon: yoksa her render'da aralık yeniden
  // kurulup hemen bir sinyal daha yazılırdı.
  const beat = useCallback(() => {
    if (docId) updateDoc(doc(db, target, docId), { [field]: Date.now() }).catch(() => {});
  }, [target, field, docId]);
  useVisibleInterval(docId ? beat : null, intervalMs);
}

/**
 * Oyuncu telefonunun canlılık sinyali: `presence/{uid}`.
 *
 * Oyuncu belgesine (`players/{id}.last_active`) yazılmıyor: o belgeyi odadaki
 * her telefonun lobi listesi dinliyor ve her nabız N okuma ediyordu (lobide
 * dakikada 4N(N+2); 20 kişide Spark kotası ~27 dakikada bitiyordu). Presence
 * belgesini yalnızca TV dinliyor. Belge kimliği oturum uid'i olduğu için kural
 * ek okuma (`get()`) gerektirmiyor.
 */
export function usePlayerPresence(roomId: string | null, uid: string | null | undefined, intervalMs: number) {
  const beat = useCallback(() => {
    if (!roomId || !uid) return;
    setDoc(doc(db, "presence", uid), {
      room_id: roomId,
      last_active: Date.now(),
      expires_at: retentionExpiry(),
    }).catch(() => {});
  }, [roomId, uid]);
  useVisibleInterval(roomId && uid ? beat : null, intervalMs);
}
