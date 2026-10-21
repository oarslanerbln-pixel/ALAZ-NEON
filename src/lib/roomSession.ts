import { isRoomLive, type RoomLike } from "./roomCodes";
import type { Player, Room } from "../types/database";

/**
 * Gece boyu oturum sürekliliği — saf, Firestore'a hiç dokunmuyor.
 *
 * Misafir telefonu gece başında BİR kez QR okutuyor. Sonrasında oyun
 * değişse, sayfa yenilense ya da misafir QR'ı tekrar okutsa bile aynı
 * `players` kaydına (puanı, night_score'u) dönmesi gerekiyor. Önceden
 * PlayerJoin saklı oturuma hiç bakmıyordu: QR'ı her okutuş yeni bir oyuncu
 * kaydı açıyor, eskisi lobide yetim kalıyor, misafir sıfırdan başlıyordu.
 *
 * Aynı şey host için de geçerli: TV ana sayfaya düşerse ve personel yeni
 * oda açarsa kod değişiyor, salondaki herkes QR'ı yeniden okutmak zorunda
 * kalıyordu. Bu yüzden host'un son odası da saklanıyor.
 *
 * Firestore'a bağlanan taraf okuma fonksiyonlarını enjekte ediyor (bkz.
 * roomQueries.ts) — roomCodes.ts ile aynı sebep: lib/firebase.ts import
 * edildiği anda Firebase'i başlatıyor, karar mantığı ancak böyle test
 * edilebiliyor.
 */

/** localStorage anahtarları — PlayerGame de aynı anahtarlardan okuyor. */
export const PLAYER_SESSION_KEYS = {
  roomId: "cafe_game_roomId",
  playerId: "cafe_game_playerId",
  playerName: "cafe_game_playerName",
  teamName: "cafe_game_teamName",
} as const;

/** Bu cihazın en son host ettiği oda. */
export const HOST_ROOM_KEY = "cafe_game_hostRoomId";

/** localStorage'ın bize gereken kısmı; testte düz bir Map yetiyor. */
export type SessionStorage = Pick<Storage, "getItem" | "setItem">;

export interface StoredPlayerSession {
  roomId: string;
  playerId: string;
}

/**
 * Gizli sekme / kısıtlı WebView'da localStorage erişimi istisna fırlatabiliyor.
 * Oturum hatırlamak bir kolaylık, katılımı asla engellememeli.
 */
function safeGet(storage: SessionStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: SessionStorage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // bkz. safeGet
  }
}

export function readPlayerSession(storage: SessionStorage): StoredPlayerSession | null {
  const roomId = safeGet(storage, PLAYER_SESSION_KEYS.roomId);
  const playerId = safeGet(storage, PLAYER_SESSION_KEYS.playerId);
  if (!roomId || !playerId) return null;
  return { roomId, playerId };
}

export function savePlayerSession(
  storage: SessionStorage,
  session: StoredPlayerSession & { nickname: string; teamName: string | null },
): void {
  safeSet(storage, PLAYER_SESSION_KEYS.playerId, session.playerId);
  safeSet(storage, PLAYER_SESSION_KEYS.roomId, session.roomId);
  safeSet(storage, PLAYER_SESSION_KEYS.playerName, session.nickname);
  safeSet(storage, PLAYER_SESSION_KEYS.teamName, session.teamName ?? "");
}

export function readHostRoomId(storage: SessionStorage): string | null {
  return safeGet(storage, HOST_ROOM_KEY) || null;
}

export function saveHostRoomId(storage: SessionStorage, roomId: string): void {
  safeSet(storage, HOST_ROOM_KEY, roomId);
}

export type SessionRoom = RoomLike & Pick<Room, "code"> & { id: string; host_uid?: string };
export type SessionPlayer = Pick<Player, "id" | "room_id" | "nickname" | "team_name" | "uid">;

export type PlayerResumeDecision =
  | { kind: "resume"; roomId: string; player: SessionPlayer }
  | {
      kind: "join";
      reason: "no_session" | "other_room" | "room_gone" | "room_closed" | "player_gone" | "other_user";
    };

function sameCode(a: string | undefined, b: string): boolean {
  return !!a && a.trim().toUpperCase() === b.trim().toUpperCase();
}

/**
 * Saklı oturum, misafirin şimdi girmek istediği odaya mı ait?
 *
 * Eşleşme oda KODU üzerinden: QR yalnızca kodu taşıyor. Kod tek başına
 * yetmiyor — kodlar 24 saat ya da oda kapanınca yeniden dağıtılıyor (bkz.
 * roomCodes.ts), dolayısıyla saklı odanın hâlâ canlı olması da şart. Kapanmış
 * geceye geri dönmek yerine yeni katılım doğru olan.
 *
 * `currentUid` biliniyorsa ve kayıttaki uid'den farklıysa aynı telefona başka
 * biri giriş yapmış demek: onun yerine eski misafirin puanına oturmasın.
 */
export function decidePlayerResume(input: {
  session: StoredPlayerSession | null;
  code: string;
  room: SessionRoom | null;
  player: SessionPlayer | null;
  currentUid?: string | null;
  now?: number;
}): PlayerResumeDecision {
  const { session, code, room, player, currentUid, now = Date.now() } = input;
  if (!session) return { kind: "join", reason: "no_session" };
  if (!room || room.id !== session.roomId) return { kind: "join", reason: "room_gone" };
  if (!sameCode(room.code, code)) return { kind: "join", reason: "other_room" };
  if (!isRoomLive(room, now)) return { kind: "join", reason: "room_closed" };
  if (!player || player.id !== session.playerId || player.room_id !== room.id) {
    return { kind: "join", reason: "player_gone" };
  }
  if (currentUid && player.uid && player.uid !== "anonymous" && player.uid !== currentUid) {
    return { kind: "join", reason: "other_user" };
  }
  return { kind: "resume", roomId: room.id, player };
}

export interface ResumeFetchers {
  fetchRoom: (roomId: string) => Promise<SessionRoom | null>;
  fetchPlayer: (playerId: string) => Promise<SessionPlayer | null>;
}

/**
 * decidePlayerResume'un Firestore okumalı hali. Okuma hatası "yeni katılım"
 * demek — en kötü ihtimalle bugünkü davranışa düşüyoruz, misafiri asla
 * kapıda bekletmiyoruz.
 */
export async function findPlayerResume(
  session: StoredPlayerSession | null,
  code: string,
  fetchers: ResumeFetchers,
  currentUid?: string | null,
  now: number = Date.now(),
): Promise<PlayerResumeDecision> {
  if (!session || !code.trim()) return { kind: "join", reason: "no_session" };
  try {
    const [room, player] = await Promise.all([
      fetchers.fetchRoom(session.roomId),
      fetchers.fetchPlayer(session.playerId),
    ]);
    return decidePlayerResume({ session, code, room, player, currentUid, now });
  } catch (err) {
    console.error("[findPlayerResume] Oturum kontrol edilemedi:", err);
    return { kind: "join", reason: "room_gone" };
  }
}

/**
 * Host'un son odası hâlâ devam ettirilebilir mi? Canlı (kapanmamış, 24 saati
 * geçmemiş) ve — kim olduğumuzu biliyorsak — bizim açtığımız oda olmalı;
 * başkasının odasını yönetmeye kurallar zaten izin vermez.
 */
export function canResumeHostRoom(
  room: SessionRoom | null,
  currentUid?: string | null,
  now: number = Date.now(),
): room is SessionRoom {
  if (!room || !isRoomLive(room, now)) return false;
  if (currentUid && room.host_uid && room.host_uid !== "anonymous" && room.host_uid !== currentUid) {
    return false;
  }
  return true;
}
