import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Player } from "../types/database";

export function usePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(Boolean(playerId));
  const [trackedPlayerId, setTrackedPlayerId] = useState(playerId);

  // playerId değişince state'i RENDER sırasında sıfırla; effect içinde
  // setState yapmak zincirleme render'a yol açıyordu.
  if (playerId !== trackedPlayerId) {
    setTrackedPlayerId(playerId);
    setPlayer(null);
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
        console.error("Error fetching player:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [playerId]);

  // Skoru oyuncu cihazından yazan bir yol bilerek yok: puanlama host'ta
  // yapılıyor ve Firestore kuralları da oyuncu dokümanına yazmayı yalnızca
  // host'a açıyor. Buraya bir updateScore eklenirse sessizce permission-denied
  // alır — skor değişikliği useHostRoom.updatePlayerScore üzerinden gitmeli.
  return { player, loading, totalScore: player?.total_score || 0 };
}
