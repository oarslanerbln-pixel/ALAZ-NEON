import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";

import { db } from "../lib/firebase";
import type { RoomInput } from "../lib/roomInputs";
import { createLogger } from "../lib/logger";

const log = createLogger("useRoomInputs");

/**
 * Host: odanın bütün oyuncu girişlerini dinler (playerId → kayıt).
 * Kural listelemeyi yalnızca odanın host'una açıyor; oyuncular birbirinin
 * oyunu göremiyor.
 */
export function useRoomInputs(roomId: string | null): Record<string, RoomInput> {
  const [inputs, setInputs] = useState<Record<string, RoomInput>>({});

  useEffect(() => {
    if (!roomId) return;
    return onSnapshot(
      collection(db, "rooms", roomId, "inputs"),
      (snap) => {
        const next: Record<string, RoomInput> = {};
        snap.forEach((d) => {
          next[d.id] = d.data() as RoomInput;
        });
        setInputs(next);
      },
      (err) => log.error("Girişler dinlenemedi:", err),
    );
  }, [roomId]);

  return inputs;
}

/**
 * Oyuncu: yalnızca kendi giriş kaydını dinler. "Oy verdin" durumu buradan
 * geliyor — telefon yenilense de aynı turda ikinci kez oy verme düğmesi
 * görünmüyor (kural ikinci yazmayı zaten reddediyor).
 */
export function useOwnRoomInput(roomId: string | null, playerId: string | null): RoomInput | null {
  const [input, setInput] = useState<{ key: string; value: RoomInput | null } | null>(null);
  const key = roomId && playerId ? `${roomId}/${playerId}` : null;

  useEffect(() => {
    if (!roomId || !playerId) return;
    const k = `${roomId}/${playerId}`;
    return onSnapshot(
      doc(db, "rooms", roomId, "inputs", playerId),
      (snap) => setInput({ key: k, value: snap.exists() ? (snap.data() as RoomInput) : null }),
      (err) => log.error("Giriş kaydı okunamadı:", err),
    );
  }, [roomId, playerId]);

  // Oda/oyuncu değiştiyse önceki kaydın cevabı yeni kayda ait sayılmasın.
  return input && input.key === key ? input.value : null;
}
