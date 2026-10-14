import { doc, increment, runTransaction } from "firebase/firestore";

import type { Room } from "../types/database";
import { db } from "./firebase";
import type { NightPoints } from "./nightLeague";
import { createLogger } from "./logger";

const log = createLogger("nightAwards");

/**
 * Oyun (yeniden) başlarken odaya yazılır: bir sonraki bitişte gecelik puan
 * dağıtılabilsin. Dashboard'dan başlatma ve oyun içi "yeniden oyna"
 * sıfırlamaları bunu ekliyor.
 */
export const NIGHT_ROUND_OPEN = { night_awarded: false } as const satisfies Partial<Room>;

/**
 * Bir oyunun gecelik puanlarını TEK SEFER yazar.
 *
 * Bitiş yolları birden fazla tetiklenebiliyor (erken bitir + son tur, efekt
 * yeniden çalışması, iki açık host sekmesi); oda dokümanındaki
 * `night_awarded` bayrağı transaction içinde okunup yazıldığı için aynı oyun
 * iki kez sayılmaz. Bu arada odadan ayrılmış oyuncular atlanır (silinmiş
 * dokümana yazmak tüm transaction'ı düşürürdü).
 */
export async function awardNightPoints(roomId: string, points: NightPoints): Promise<boolean> {
  const ids = Object.keys(points).filter((id) => points[id] > 0);
  return runTransaction(db, async (tx) => {
    const roomRef = doc(db, "rooms", roomId);
    const room = await tx.get(roomRef);
    if (!room.exists() || room.data().night_awarded === true) return false;

    const snaps = await Promise.all(ids.map((id) => tx.get(doc(db, "players", id))));
    snaps.forEach((snap, i) => {
      if (snap.exists()) tx.update(snap.ref, { night_score: increment(points[ids[i]]) });
    });
    tx.update(roomRef, { night_awarded: true });
    return true;
  });
}

/** Oyun bitişini asla engellememeli: hata yalnızca konsola düşer. */
export function finishNightRound(roomId: string | undefined, points: NightPoints): void {
  if (!roomId) return;
  awardNightPoints(roomId, points).catch((err) => log.error("Gecelik puan yazılamadı:", err));
}
