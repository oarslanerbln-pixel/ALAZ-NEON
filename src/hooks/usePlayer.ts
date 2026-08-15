import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, ensureAnonymousAuth } from "../lib/firebase";
import type { Player } from "../types/database";

export function usePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(() => Boolean(playerId));

  useEffect(() => {
    if (!playerId) return;

    // Re-establish the player's auth session on a fresh page load — answer
    // submissions require it to match this player doc's owner_uid.
    ensureAnonymousAuth().catch((err) => console.error("Player auth failed:", err));

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

  const updateScore = async (newScore: number) => {
    if (!playerId) return;
    const docRef = doc(db, "players", playerId);
    await updateDoc(docRef, { total_score: newScore });
  };

  return { player, loading, updateScore, totalScore: player?.total_score || 0 };
}
