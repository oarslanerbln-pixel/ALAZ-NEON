import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Player } from "../types/database";
import { createLogger } from "../lib/logger";

const log = createLogger("usePlayer");

export function usePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(Boolean(playerId));
  const [error, setError] = useState<Error | null>(null);
  const [trackedPlayerId, setTrackedPlayerId] = useState(playerId);

  // playerId değişince state'i RENDER sırasında sıfırla; effect içinde
  // setState yapmak zincirleme render'a yol açıyordu.
  if (playerId !== trackedPlayerId) {
    setTrackedPlayerId(playerId);
    setPlayer(null);
    setError(null);
    setLoading(Boolean(playerId));
  }

  useEffect(() => {
    if (!playerId) return;

    const docRef = doc(db, "players", playerId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setPlayer({ id: docSnap.id, ...docSnap.data() } as Player);
        } else {
          setPlayer(null);
        }
        setLoading(false);
      },
      (err) => {
        log.error("Error fetching player:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [playerId]);

  // Kalıcı (lig) puanını artık bu cihaz yazmıyor: kural users/{uid}
  // puan alanını yalnızca personel hesaplı host ekranına açıyor. Aktarım
  // host'ta, bkz. hooks/useLifetimeScoreSync.ts.

  return { player, loading, error, totalScore: player?.total_score || 0 };
}
