import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { doc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Sentinel } from "../lib/sentinel";
import { HOST_HEARTBEAT_MS } from "../lib/liveness";
import { useHeartbeat } from "./useHeartbeat";
import { isAnswerForRound, submittedPlayerIdsForRound, type RoundAnswerRef } from "../lib/arenaRound";
import { withoutUndefined } from "../lib/firestoreData";
import type { Room, Player, Answer } from "../types/database";

export function useHostRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  /**
   * Odadaki cevapların yalnızca "kim, hangi tura" bilgisi (cevap kimliğine
   * göre). "Bu tura kim cevap verdi" buradan TÜRETİLİYOR — eskiden gelen her
   * cevap bir listeye ekleniyor, liste de harf değişince sıfırlanıyordu; host
   * yenilemesinde ilk anlık görüntü gecenin bütün cevaplarını listeye doldurup
   * turu erken bitiriyordu (bkz. lib/arenaRound.ts).
   */
  const [answerRefs, setAnswerRefs] = useState<Record<string, RoundAnswerRef>>({});
  /** Cevap dinleyicisinin, o anki turu bilmesi için odanın son hâli. */
  const latestRoomRef = useRef<Room | null>(null);
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
    setAnswerRefs({});
    setError(null);
    setLoading(Boolean(roomId));
    setNotFound(!roomId);
  }

  // Host canlılık sinyali — misafir telefonundaki "host çevrimdışı" uyarısı
  // buna bakıyor (bkz. lib/liveness.ts → isHostOnline). Bu hook yalnızca
  // HostDisplay'de kullanılıyor, yani sinyali gerçekten TV atıyor.
  useHeartbeat("rooms", "host_last_active", roomId, HOST_HEARTBEAT_MS);

  useEffect(() => {
    if (!roomId) return;

    // 1. Room Subscription
    const roomUnsub = onSnapshot(
      doc(db, "rooms", roomId),
      (docSnap) => {
        if (docSnap.exists()) {
          const next = { id: docSnap.id, ...docSnap.data() } as Room;
          latestRoomRef.current = next;
          setRoom(next);
          setNotFound(false);
        } else {
          // Oda silinmiş ya da hiç yok — sessizce null'da kalma, bildir
          console.error("[useHostRoom] Oda bulunamadı:", roomId);
          latestRoomRef.current = null;
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
      const changes = snapshot.docChanges();
      if (changes.length === 0) return;

      setAnswerRefs((prev) => {
        const next = { ...prev };
        for (const change of changes) {
          if (change.type === "removed") {
            delete next[change.doc.id];
            continue;
          }
          const data = change.doc.data() as Answer;
          next[change.doc.id] = {
            player_id: data.player_id,
            round_letter: data.round_letter,
            round_index: data.round_index,
          };
        }
        return next;
      });

      // Hız radarı yalnızca O ANKİ TURUN cevaplarına bakmalı. Önceki turdan
      // kalmış, kafe wifi'si yüzünden kuyrukta bekleyip yeni tur başlarken
      // ulaşan bir cevap "tur başladıktan 1 sn sonra 30 harf" gibi görünüp
      // oyuncuyu gece boyunca sessizce yasaklatıyordu.
      const current = latestRoomRef.current;
      for (const change of changes) {
        if (change.type !== "added") continue;
        const newAnswer = change.doc.data() as Answer;
        if (!isAnswerForRound(newAnswer, current?.active_letter, current?.current_round)) continue;

        let totalAnswerLength = 0;
        if (newAnswer.data) {
          Object.values(newAnswer.data).forEach(val => {
            totalAnswerLength += val ? val.toString().length : 0;
          });
        }

        const dummyText = "X".repeat(totalAnswerLength);
        Sentinel.processIncomingAnswer(newAnswer.player_id, dummyText);
      }
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

  const submittedPlayerIds = useMemo(
    () => submittedPlayerIdsForRound(Object.values(answerRefs), room?.active_letter, room?.current_round),
    [answerRefs, room?.active_letter, room?.current_round],
  );

  const updateRoomStatus = useCallback(async (
    status: Room["status"],
    extra: Partial<Room> = {},
  ) => {
    if (!roomId) return;
    
    // Firestore `undefined` alanı olan yazmayı senkron reddediyor; tek geçit
    // burası olduğu için temizlik de burada (bkz. lib/firestoreData.ts).
    const fields = withoutUndefined(extra);
    // Optimistic UI Update
    setRoom((prev) => (prev ? { ...prev, status, ...fields } : prev));
    // Yazma hatası çağıranı patlatmasın: eskiden reject olunca
    // startGame/handleSpinnerComplete yarıda kalıp oyun donuyordu.
    try {
      await updateDoc(doc(db, "rooms", roomId), { status, ...fields });
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
  };
}
