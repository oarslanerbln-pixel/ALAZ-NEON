import { useState, useEffect } from "react";
import { doc, collection, query, where, limit, onSnapshot, updateDoc } from "firebase/firestore";
import { db, ensureAnonymousAuth } from "../lib/firebase";
import { Sentinel } from "../lib/sentinel";
import type { Room, Player, Answer } from "../types/database";

export function useHostRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [submittedPlayerIds, setSubmittedPlayerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    // Re-establish the host's auth session on a fresh page load (e.g. a
    // refresh) — Firestore rules require it to match the room's host_uid
    // before accepting any privileged write.
    ensureAnonymousAuth().catch((err) => console.error("Host auth failed:", err));

    // 1. Room Subscription
    const roomUnsub = onSnapshot(doc(db, "rooms", roomId), (docSnap) => {
      if (docSnap.exists()) {
        setRoom({ id: docSnap.id, ...docSnap.data() } as Room);
      }
      setLoading(false);
    });

    // 2. Player Subscription
    const qPlayers = query(collection(db, "players"), where("room_id", "==", roomId), limit(500));
    const playersUnsub = onSnapshot(qPlayers, (snapshot) => {
      const pList: Player[] = [];
      snapshot.forEach(d => {
        pList.push({ id: d.id, ...d.data() } as Player);
      });
      setPlayers(pList);
    });

    // 3. Answer Tracking Subscription
    const qAnswers = query(collection(db, "answers"), where("room_id", "==", roomId), limit(5000));
    const answersUnsub = onSnapshot(qAnswers, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newAnswer = { id: change.doc.id, ...change.doc.data() } as Answer;
          
          let totalAnswerLength = 0;
          if (newAnswer.data) {
            Object.values(newAnswer.data).forEach(val => {
              totalAnswerLength += val ? val.toString().length : 0;
            });
          }

          const dummyText = "X".repeat(totalAnswerLength);
          Sentinel.processIncomingAnswer(newAnswer.player_id, dummyText);

          setSubmittedPlayerIds((prev) => [
            ...new Set([...prev, newAnswer.player_id]),
          ]);
        }
      });
    });

    return () => {
      roomUnsub();
      playersUnsub();
      answersUnsub();
    };
  }, [roomId]);

  // Reset submitted IDs when letter changes
  useEffect(() => {
    if (room?.active_letter) {
      setTimeout(
        () => setSubmittedPlayerIds((prev) => (prev.length > 0 ? [] : prev)),
        0,
      );
    }
  }, [room?.active_letter]);

  const updateRoomStatus = async (
    status: Room["status"],
    extra: Partial<Room> = {},
  ) => {
    if (!roomId) return;
    
    // Optimistic UI Update
    setRoom((prev) => (prev ? { ...prev, status, ...extra } : prev));
    await updateDoc(doc(db, "rooms", roomId), { status, ...extra });
  };

  const updatePlayerScore = async (playerId: string, totalScore: number) => {
    await updateDoc(doc(db, "players", playerId), { total_score: totalScore });
  };

  return {
    room,
    players,
    submittedPlayerIds,
    loading,
    updateRoomStatus,
    updatePlayerScore,
    setSubmittedPlayerIds,
  };
}
