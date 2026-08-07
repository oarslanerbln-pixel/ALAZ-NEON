import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Room } from "../types/database";

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "rooms", roomId);
    
    // Set up realtime listener
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setRoom({ id: docSnap.id, ...docSnap.data() } as Room);
        } else {
          setRoom(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching room:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  const updateRoom = async (updates: Partial<Room>) => {
    if (!roomId) return;
    const docRef = doc(db, "rooms", roomId);
    // @ts-ignore - updates might not match perfectly if omitting id
    await updateDoc(docRef, updates);
  };

  return { room, loading, error, updateRoom };
}
