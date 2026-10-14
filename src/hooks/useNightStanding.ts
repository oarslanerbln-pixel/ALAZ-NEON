import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../lib/firebase";
import { createLogger } from "../lib/logger";
import { nightRankOf } from "../lib/nightLeague";

const log = createLogger("useNightStanding");

type Standing = NonNullable<ReturnType<typeof nightRankOf>>;

/**
 * Misafirin gecelik sıradaki yeri (lobi kartı).
 *
 * Canlı dinleyici değil, tek okuma: gece puanları yalnızca bir oyun bittiğinde
 * değişiyor (`night_awarded` bayrağı o an döner). Odanın bütün `players`
 * listesini dinlemek her oyuncunun canlılık sinyalini bütün lobiye okuma
 * olarak yansıtıyordu (bkz. lib/playerCount.ts, docs/roadmap.md 1.1).
 */
export function useNightStanding(
  roomId: string | null,
  playerId: string | null | undefined,
  awardedKey: unknown,
): Standing | null {
  const [state, setState] = useState<{ key: string; standing: Standing | null } | null>(null);
  const key = `${roomId}|${playerId}|${String(awardedKey)}`;

  useEffect(() => {
    if (!roomId || !playerId) return;
    let alive = true;
    getDocs(query(collection(db, "players"), where("room_id", "==", roomId)))
      .then((snap) => {
        const roster = snap.docs.map((d) => ({
          id: d.id,
          nickname: String(d.data().nickname ?? ""),
          night_score: d.data().night_score as number | undefined,
        }));
        if (alive) setState({ key, standing: nightRankOf(roster, playerId) });
      })
      .catch((err) => log.warn("Gecelik sıra okunamadı:", err));
    return () => {
      alive = false;
    };
  }, [key, roomId, playerId]);

  return state?.key === key ? state.standing : null;
}
