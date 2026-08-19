import { useState, useEffect, useCallback } from "react";
import { doc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Sentinel } from "../lib/sentinel";
import type { Room, Player, Answer } from "../types/database";

export function useHostRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [submittedPlayerIds, setSubmittedPlayerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(roomId));
  const [notFound, setNotFound] = useState(!roomId);
  const [error, setError] = useState<Error | null>(null);
  const [trackedRoomId, setTrackedRoomId] = useState(roomId);

  // roomId değişince state'i RENDER sırasında sıfırla — React'in
  // "prop değişince state'i ayarla" deseni. Effect içinde setState
  // yapmak fazladan bir render turu doğuruyordu.
  if (roomId !== trackedRoomId) {
    setTrackedRoomId(roomId);
    setRoom(null);
    setPlayers([]);
    setSubmittedPlayerIds([]);
    setError(null);
    setLoading(Boolean(roomId));
    setNotFound(!roomId);
  }

  useEffect(() => {
    if (!roomId) return;

    // 1. Room Subscription
    const roomUnsub = onSnapshot(
      doc(db, "rooms", roomId),
      (docSnap) => {
        if (docSnap.exists()) {
          setRoom({ id: docSnap.id, ...docSnap.data() } as Room);
          setNotFound(false);
        } else {
          // Oda silinmiş ya da hiç yok — sessizce null'da kalma, bildir
          console.error("[useHostRoom] Oda bulunamadı:", roomId);
          setRoom(null);
          setNotFound(true);
        }
        setLoading(false);
      },
      (err) => {
        // Firestore kural reddi / offline / kota — eskiden sessizce yutuluyordu
        console.error("[useHostRoom] Oda dinlenemedi:", err);
        setError(err);
        setLoading(false);
      }
    );

    // 2. Player Subscription
    const qPlayers = query(collection(db, "players"), where("room_id", "==", roomId));
    const playersUnsub = onSnapshot(
      qPlayers,
      (snapshot) => {
        const pList: Player[] = [];
        snapshot.forEach(d => {
          pList.push({ id: d.id, ...d.data() } as Player);
        });
        setPlayers(pList);
      },
      (err) => {
        console.error("[useHostRoom] Oyuncular dinlenemedi:", err);
        setError(err);
      }
    );

    // 3. Answer Tracking Subscription
    const qAnswers = query(collection(db, "answers"), where("room_id", "==", roomId));
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
    }, (err) => {
      console.error("[useHostRoom] Cevaplar dinlenemedi:", err);
      setError(err);
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

  const updateRoomStatus = useCallback(async (
    status: Room["status"],
    extra: Partial<Room> = {},
  ) => {
    if (!roomId) return;
    
    // Optimistic UI Update
    setRoom((prev) => (prev ? { ...prev, status, ...extra } : prev));
    // Yazma hatası çağıranı patlatmasın: eskiden reject olunca
    // startGame/handleSpinnerComplete yarıda kalıp oyun donuyordu.
    try {
      await updateDoc(doc(db, "rooms", roomId), { status, ...extra });
    } catch (err) {
      console.error("[useHostRoom] Oda güncellenemedi:", status, err);
      setError(err as Error);
    }
  }, [roomId]);

  const updatePlayerScore = useCallback(async (playerId: string, totalScore: number) => {
    try {
      await updateDoc(doc(db, "players", playerId), { total_score: totalScore });
    } catch (err) {
      console.error("[useHostRoom] Skor güncellenemedi:", playerId, err);
    }
  }, []);

  return {
    room,
    players,
    submittedPlayerIds,
    loading,
    notFound,
    error,
    updateRoomStatus,
    updatePlayerScore,
    setSubmittedPlayerIds,
  };
}
