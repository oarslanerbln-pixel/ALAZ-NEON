import { doc, setDoc } from "firebase/firestore";

import { db } from "../lib/firebase";
import { gameEventId, gameEventPayload, type GameEventType } from "../lib/clientWrites";
import { createLogger } from "../lib/logger";
import type { GameType, Room } from "../types/database";

const log = createLogger("GameEvents");

/**
 * Oyun başlangıç/bitiş olayını yazar (docs/roadmap.md, 3.2). Oyunu
 * bekletmez; yazılamazsa yalnızca uyarı düşer (telemetri oyunu bozmamalı).
 * Belge kimliği olaydan türetildiği için ikinci yazma kurallarca reddedilir:
 * iki TV açıksa da tek kayıt kalır.
 */
export function recordGameEvent(args: {
  type: GameEventType;
  room: Pick<Room, "id" | "host_uid">;
  game: GameType;
  playerCount: number;
  startedAt: number;
  endedAt?: number;
}): void {
  if (!args.room.host_uid) return;
  const payload = gameEventPayload({
    type: args.type,
    roomId: args.room.id,
    hostUid: args.room.host_uid,
    game: args.game,
    playerCount: args.playerCount,
    startedAt: args.startedAt,
    endedAt: args.endedAt,
  });
  setDoc(doc(db, "events", gameEventId(args.room.id, args.startedAt, args.type)), payload).catch((err) =>
    log.warn("Oyun olayı yazılamadı:", args.type, err),
  );
}
