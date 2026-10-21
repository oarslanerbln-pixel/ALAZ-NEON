import { useEffect, useRef } from "react";
import type { Room } from "../types/database";
import {
  cueForTransition,
  isNewGameStatus,
  lastSecondsDelay,
  type RoomSnapshot,
} from "../lib/announcer";
import { hostAnnouncer } from "../lib/announcerPlayer";

/**
 * TV spikerini oda durum makinesine bağlar. Yalnızca HostDisplay çağırır;
 * telefon ekranları spikeri hiç yüklemez. Hangi geçişin konuşulacağı
 * lib/announcer.ts'te — burada yalnızca durum değişimi izlenir.
 */
export function useHostAnnouncer(room: Room | null) {
  const prevRef = useRef<RoomSnapshot | null>(null);

  useEffect(() => {
    hostAnnouncer.preload();
    return () => hostAnnouncer.stop();
  }, []);

  const status = room?.status;
  const questionIndex = room?.current_question_index ?? 0;
  const totalQuestions = room?.total_rounds || 5;
  const roundEndTime = room?.round_end_time ?? null;

  useEffect(() => {
    if (!status) return;
    const next: RoomSnapshot = { status, questionIndex, totalQuestions };
    const prev = prevRef.current;
    prevRef.current = next;

    if (isNewGameStatus(prev, next)) hostAnnouncer.newGame();
    const cue = cueForTransition(prev, next);
    if (cue) hostAnnouncer.say(cue);
  }, [status, questionIndex, totalQuestions]);

  useEffect(() => {
    if (!status) return;
    const delay = lastSecondsDelay({ status, questionIndex, totalQuestions }, roundEndTime, Date.now());
    if (delay === null) return;
    const timer = setTimeout(() => hostAnnouncer.say("last_seconds"), delay);
    return () => clearTimeout(timer);
  }, [status, questionIndex, totalQuestions, roundEndTime]);
}
