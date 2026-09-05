import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "./firebase";
import {
  allocateRoomCode as allocateRoomCodePure,
  pickJoinableRoom,
  type RoomLike,
} from "./roomCodes";
import type { Room } from "../types/database";

export type RoomWithId = Room & { id: string };

/**
 * roomCodes.ts'teki saf seçim mantığını Firestore'a bağlayan ince katman.
 * Buradaki tek iş sorgu; karar verme orada ve orada test ediliyor.
 */
async function fetchRoomsWithCode(code: string): Promise<RoomWithId[]> {
  const snapshot = await getDocs(
    query(collection(db, "rooms"), where("code", "==", code.toUpperCase())),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as RoomWithId);
}

/** Kodla katılmak isteyen oyuncu için odayı bulur; uygun oda yoksa null. */
export async function findJoinableRoomByCode(code: string): Promise<RoomWithId | null> {
  return pickJoinableRoom(await fetchRoomsWithCode(code));
}

/** Canlı bir odanın kullanmadığı yeni bir oda kodu üretir. */
export function allocateRoomCode(): Promise<string> {
  return allocateRoomCodePure<RoomLike>(fetchRoomsWithCode);
}
