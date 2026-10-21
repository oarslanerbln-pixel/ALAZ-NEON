import { describe, it, expect, vi } from "vitest";

import { ROOM_CODE_LIFETIME_MS } from "../roomCodes";
import {
  canResumeHostRoom,
  decidePlayerResume,
  findPlayerResume,
  HOST_ROOM_KEY,
  PLAYER_SESSION_KEYS,
  readHostRoomId,
  readPlayerSession,
  saveHostRoomId,
  savePlayerSession,
  type SessionPlayer,
  type SessionRoom,
  type SessionStorage,
} from "../roomSession";

/**
 * Bu paketin var olma sebebi: misafir QR'ı her okuttuğunda PlayerJoin yeni
 * bir `players` kaydı açıyordu. Oyun değişiminde ya da sayfa yenilemede QR'ı
 * yeniden okutan misafir puanını kaybediyor, lobide hayalet kopyası kalıyordu.
 */

const NOW = 1_700_000_000_000;

function memoryStorage(): SessionStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

function room(over: Partial<SessionRoom> = {}): SessionRoom {
  return {
    id: "room-1",
    code: "AB12",
    status: "night_lobby",
    created_at: NOW - 60_000,
    host_uid: "host-uid",
    ...over,
  } as SessionRoom;
}

function player(over: Partial<SessionPlayer> = {}): SessionPlayer {
  return {
    id: "player-1",
    room_id: "room-1",
    nickname: "ATILLA",
    team_name: null,
    uid: "guest-uid",
    ...over,
  };
}

const session = { roomId: "room-1", playerId: "player-1" };

describe("decidePlayerResume", () => {
  it("aynı QR yeniden okutulunca eski kayda dönülüyor — asıl hata buydu", () => {
    const decision = decidePlayerResume({ session, code: "AB12", room: room(), player: player(), now: NOW });
    expect(decision).toEqual({ kind: "resume", roomId: "room-1", player: player() });
  });

  it("kod büyük/küçük harf ve boşluktan bağımsız eşleşiyor", () => {
    const decision = decidePlayerResume({ session, code: " ab12 ", room: room(), player: player(), now: NOW });
    expect(decision.kind).toBe("resume");
  });

  it("oyun bitmiş (finished) odaya da dönülebiliyor — host lobiye dönene kadar beklemek yok", () => {
    const decision = decidePlayerResume({
      session, code: "AB12", room: room({ status: "finished" }), player: player(), now: NOW,
    });
    expect(decision.kind).toBe("resume");
  });

  it("saklı oturum yoksa normal katılım", () => {
    expect(decidePlayerResume({ session: null, code: "AB12", room: null, player: null, now: NOW }))
      .toEqual({ kind: "join", reason: "no_session" });
  });

  it("başka bir odanın QR'ı okutulunca normal katılım", () => {
    const decision = decidePlayerResume({ session, code: "ZZ99", room: room(), player: player(), now: NOW });
    expect(decision).toEqual({ kind: "join", reason: "other_room" });
  });

  it("saklı oda artık yoksa normal katılım", () => {
    expect(decidePlayerResume({ session, code: "AB12", room: null, player: player(), now: NOW }))
      .toEqual({ kind: "join", reason: "room_gone" });
  });

  it("gece kapanmışsa (closed) eski kayda dönülmüyor", () => {
    const decision = decidePlayerResume({
      session, code: "AB12", room: room({ status: "closed" }), player: player(), now: NOW,
    });
    expect(decision).toEqual({ kind: "join", reason: "room_closed" });
  });

  it("24 saati geçmiş oda — kod başka odaya verilmiş olabilir — dönülmüyor", () => {
    const decision = decidePlayerResume({
      session, code: "AB12",
      room: room({ created_at: NOW - ROOM_CODE_LIFETIME_MS - 1 }),
      player: player(), now: NOW,
    });
    expect(decision).toEqual({ kind: "join", reason: "room_closed" });
  });

  it("oyuncu kaydı silinmişse (TTL) normal katılım", () => {
    expect(decidePlayerResume({ session, code: "AB12", room: room(), player: null, now: NOW }))
      .toEqual({ kind: "join", reason: "player_gone" });
  });

  it("oyuncu kaydı başka odaya aitse dönülmüyor", () => {
    const decision = decidePlayerResume({
      session, code: "AB12", room: room(), player: player({ room_id: "room-2" }), now: NOW,
    });
    expect(decision).toEqual({ kind: "join", reason: "player_gone" });
  });

  it("telefonda başka kullanıcı oturum açmışsa eski misafirin puanına oturmuyor", () => {
    const decision = decidePlayerResume({
      session, code: "AB12", room: room(), player: player(), currentUid: "someone-else", now: NOW,
    });
    expect(decision).toEqual({ kind: "join", reason: "other_user" });
  });

  it("oturum henüz bilinmiyorsa uid kontrolü atlanıyor", () => {
    const decision = decidePlayerResume({
      session, code: "AB12", room: room(), player: player(), currentUid: null, now: NOW,
    });
    expect(decision.kind).toBe("resume");
  });
});

describe("findPlayerResume", () => {
  it("odayı ve oyuncuyu saklı kimliklerle okuyor", async () => {
    const fetchRoom = vi.fn().mockResolvedValue(room());
    const fetchPlayer = vi.fn().mockResolvedValue(player());
    const decision = await findPlayerResume(session, "AB12", { fetchRoom, fetchPlayer }, null, NOW);
    expect(fetchRoom).toHaveBeenCalledWith("room-1");
    expect(fetchPlayer).toHaveBeenCalledWith("player-1");
    expect(decision.kind).toBe("resume");
  });

  it("oturum ya da kod yoksa Firestore'a hiç gitmiyor", async () => {
    const fetchRoom = vi.fn();
    const fetchPlayer = vi.fn();
    await findPlayerResume(null, "AB12", { fetchRoom, fetchPlayer }, null, NOW);
    await findPlayerResume(session, "  ", { fetchRoom, fetchPlayer }, null, NOW);
    expect(fetchRoom).not.toHaveBeenCalled();
    expect(fetchPlayer).not.toHaveBeenCalled();
  });

  it("okuma hatasında misafiri kapıda bırakmıyor, normal katılıma düşüyor", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const decision = await findPlayerResume(
      session, "AB12",
      { fetchRoom: vi.fn().mockRejectedValue(new Error("offline")), fetchPlayer: vi.fn() },
      null, NOW,
    );
    expect(decision.kind).toBe("join");
    spy.mockRestore();
  });
});

describe("canResumeHostRoom", () => {
  it("canlı ve kendi odası devam ettirilebilir", () => {
    expect(canResumeHostRoom(room(), "host-uid", NOW)).toBe(true);
  });

  it("oyun bitmiş (finished) oda da devam ettirilebilir", () => {
    expect(canResumeHostRoom(room({ status: "finished" }), "host-uid", NOW)).toBe(true);
  });

  it("kapanmış, eski ya da olmayan oda devam ettirilemez", () => {
    expect(canResumeHostRoom(room({ status: "closed" }), "host-uid", NOW)).toBe(false);
    expect(canResumeHostRoom(room({ created_at: NOW - ROOM_CODE_LIFETIME_MS - 1 }), "host-uid", NOW)).toBe(false);
    expect(canResumeHostRoom(null, "host-uid", NOW)).toBe(false);
  });

  it("başkasının odası devam ettirilemez", () => {
    expect(canResumeHostRoom(room(), "other-uid", NOW)).toBe(false);
  });
});

describe("saklama", () => {
  it("oyuncu oturumu PlayerGame'in okuduğu anahtarlara yazılıyor", () => {
    const storage = memoryStorage();
    savePlayerSession(storage, { roomId: "room-1", playerId: "player-1", nickname: "ATILLA", teamName: null });
    expect(storage.data.get(PLAYER_SESSION_KEYS.roomId)).toBe("room-1");
    expect(storage.data.get(PLAYER_SESSION_KEYS.playerId)).toBe("player-1");
    expect(storage.data.get(PLAYER_SESSION_KEYS.teamName)).toBe("");
    expect(readPlayerSession(storage)).toEqual(session);
  });

  it("yarım oturum yok sayılıyor", () => {
    const storage = memoryStorage();
    storage.setItem(PLAYER_SESSION_KEYS.roomId, "room-1");
    expect(readPlayerSession(storage)).toBeNull();
  });

  it("host odası saklanıp okunuyor", () => {
    const storage = memoryStorage();
    expect(readHostRoomId(storage)).toBeNull();
    saveHostRoomId(storage, "room-9");
    expect(storage.data.get(HOST_ROOM_KEY)).toBe("room-9");
    expect(readHostRoomId(storage)).toBe("room-9");
  });

  it("erişilemeyen localStorage (gizli sekme) katılımı bozmuyor", () => {
    const broken: SessionStorage = {
      getItem: () => { throw new Error("SecurityError"); },
      setItem: () => { throw new Error("QuotaExceededError"); },
    };
    expect(readPlayerSession(broken)).toBeNull();
    expect(readHostRoomId(broken)).toBeNull();
    expect(() => saveHostRoomId(broken, "room-1")).not.toThrow();
  });
});
