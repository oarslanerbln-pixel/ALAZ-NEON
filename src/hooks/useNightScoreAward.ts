import { useEffect, useRef } from "react";
import { doc, increment, runTransaction } from "firebase/firestore";

import { db } from "../lib/firebase";
import { resolveActiveGame } from "../lib/gameRouting";
import { awardNightPoints, gameStandings, isNightScoredFinish, nightAwardKey } from "../lib/nightScore";
import type { Player, Room } from "../types/database";

/**
 * Bir oyun bittiğinde gece puanlarını (night_score) dağıtır — oyun örneği
 * başına TEK KEZ (bkz. lib/nightScore.ts).
 *
 * Tek seferlik olmayı transaction garanti ediyor: TV yenilenirse ya da iki
 * ekran aynı odayı açıksa ikinci deneme `night_awarded_key` eşleştiği için
 * hiçbir şey yazmaz. Host tek yazar; oyuncu dokümanlarına yazma host
 * yetkisiyle yapılıyor (firestore.rules → players update).
 */
export function useNightScoreAward(room: Room | null, players: Player[]) {
  const attemptedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!room) return;
    const game = resolveActiveGame(room);
    if (!isNightScoredFinish(game, room.status) || !game) return;
    const key = nightAwardKey(room);
    if (!key || room.night_awarded_key === key || attemptedRef.current === key) return;
    attemptedRef.current = key;

    const points = awardNightPoints(gameStandings(game, room, players));
    const ids = Object.keys(points).filter((id) => points[id] > 0);

    runTransaction(db, async (tx) => {
      const roomRef = doc(db, "rooms", room.id);
      const snap = await tx.get(roomRef);
      if (!snap.exists() || snap.data().night_awarded_key === key) return;
      for (const id of ids) {
        tx.update(doc(db, "players", id), { night_score: increment(points[id]) });
      }
      tx.update(roomRef, { night_awarded_key: key });
    }).catch((err) => {
      // Başarısız olursa bir sonraki durum güncellemesinde yeniden denensin.
      attemptedRef.current = null;
      console.error("[useNightScoreAward] Gece puanı yazılamadı:", err);
    });
  }, [room, players]);
}
