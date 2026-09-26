import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";

import { db } from "../lib/firebase";

type HeartbeatTarget =
  | { collection: "rooms"; field: "host_last_active" }
  | { collection: "players"; field: "last_active" };

/**
 * Canlılık sinyali — host ekranı ve oyuncu telefonu için tek uygulama.
 *
 * Sekme görünürken `intervalMs`'de bir `field` alanına `Date.now()` yazar.
 * Sekme gizlenince durur, görünür olunca beklemeden bir sinyal atar. Eskiden
 * iki ayrı kopya vardı ve ikisi de arka planda yazmaya devam ediyordu:
 * kilitli telefon sinyal gönderip "canlı" görünüyor (bombayı alıp tur boyunca
 * kilitliyordu), her yazma da odadaki her dinleyiciye bir okuma olarak
 * yansıyordu. Geri dönüşte anlık sinyal, oyuncunun 15 sn beklemeden tekrar
 * hedeflenebilir olmasını sağlıyor.
 */
export function useHeartbeat(
  target: HeartbeatTarget["collection"],
  field: HeartbeatTarget["field"],
  docId: string | null,
  intervalMs: number,
) {
  useEffect(() => {
    if (!docId) return;
    const ref = doc(db, target, docId);
    const beat = () => {
      updateDoc(ref, { [field]: Date.now() }).catch(() => {});
    };

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
  }, [target, field, docId, intervalMs]);
}
