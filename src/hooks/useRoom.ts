import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Room } from "../types/database";

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(Boolean(roomId));
  const [error, setError] = useState<Error | null>(null);
  const [trackedRoomId, setTrackedRoomId] = useState(roomId);

  // roomId değişince state'i RENDER sırasında sıfırla — React'in
  // "prop değişince state'i ayarla" deseni. Bunu effect içinde yapmak
  // fazladan bir render turu (cascading render) doğuruyordu.
  if (roomId !== trackedRoomId) {
    setTrackedRoomId(roomId);
    setRoom(null);
    setError(null);
    setLoading(Boolean(roomId));
  }

  useEffect(() => {
    if (!roomId) return;

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

  // `id` Firestore dokümanının alanı değil, doküman kimliği — güncellenemez.
  // Omit ile dışlayınca @ts-ignore'a gerek kalmıyor.
  const updateRoom = async (updates: Partial<Omit<Room, "id">>) => {
    if (!roomId) return;
    try {
      await updateDoc(doc(db, "rooms", roomId), updates as Record<string, unknown>);
    } catch (err) {
      console.error("[useRoom] Oda güncellenemedi:", err);
      setError(err as Error);
    }
  };

  return { room, loading, error, updateRoom };
}
