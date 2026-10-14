import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import { db } from "../lib/firebase";
import type { SecretDoc } from "../lib/gameSecrets";
import { createLogger } from "../lib/logger";

const log = createLogger("RoomSecret");

/**
 * Odanın host'a özel belgesi (`rooms/{id}/secrets/{ad}`): doğru cevaplar,
 * kasa kodu. Yalnızca TV kullanır; kurallar oyuncuya okutmuyor.
 */
export function useRoomSecret<T>(roomId: string | null | undefined, name: SecretDoc): T | null {
  const [state, setState] = useState<{ key: string; value: T | null }>({ key: "", value: null });
  const key = roomId ? `${roomId}/${name}` : "";

  useEffect(() => {
    if (!roomId) return;
    return onSnapshot(
      doc(db, "rooms", roomId, "secrets", name),
      (snap) => setState({ key: `${roomId}/${name}`, value: snap.exists() ? (snap.data() as T) : null }),
      (err) => log.error("Gizli oyun bilgisi okunamadı:", name, err),
    );
  }, [roomId, name]);

  return state.key === key ? state.value : null;
}

export function writeRoomSecret(roomId: string, name: SecretDoc, data: object): Promise<void> {
  return setDoc(doc(db, "rooms", roomId, "secrets", name), data);
}
