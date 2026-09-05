import { describe, it, expect } from "vitest";

import {
  allocateRoomCode,
  isRoomLive,
  pickJoinableRoom,
  ROOM_CODE_LENGTH,
  ROOM_CODE_LIFETIME_MS,
  type RoomLike,
} from "../roomCodes";

/**
 * Bu paketin var olma sebebi somut: oda kodu 4 hane (32^4 ≈ 1M) ve hiçbir
 * benzersizlik kontrolü olmadan üretiliyordu; odalar da hiç silinmediği için
 * çakışma olasılığı her odayla artıyordu. Katılım tarafı ise sorgudan dönen
 * ilk dokümanı alıp durum kontrolünü ondan SONRA yapıyordu — yani çakışma
 * anında oyuncu kapanmış eski odaya düşüp canlı odaya hiç giremiyordu.
 */

const NOW = 1_700_000_000_000;

function room(over: Partial<{ status: string; created_at: number }> = {}) {
  return { status: "night_lobby", created_at: NOW - 1000, ...over } as RoomLike;
}

/**
 * allocateRoomCode saat enjekte etmiyor, gerçek Date.now() kullanıyor —
 * "şu an dolu" senaryolarında oda gerçekten yeni olmalı, yukarıdaki sabit
 * NOW ile kurulan oda çoktan süresi geçmiş sayılır.
 */
function liveRoom(): RoomLike {
  return { status: "night_lobby", created_at: Date.now() } as RoomLike;
}

describe("isRoomLive", () => {
  it("yeni açılmış oda canlı", () => {
    expect(isRoomLive(room(), NOW)).toBe(true);
  });

  it("24 saatten eski oda canlı değil — kodu yeniden kullanılabilir", () => {
    expect(isRoomLive(room({ created_at: NOW - ROOM_CODE_LIFETIME_MS - 1 }), NOW)).toBe(false);
  });

  it("kapanmış oda canlı değil", () => {
    expect(isRoomLive(room({ status: "closed" }), NOW)).toBe(false);
    expect(isRoomLive(room({ status: "finished" }), NOW)).toBe(false);
  });

  it("created_at'i olmayan eski oda canlı SAYILIYOR — güvenli taraf meşgul saymak", () => {
    // Kod ataması açısından yanlış tarafa düşmek çakışma üretir; boşta
    // sanmaktansa meşgul sayıp başka kod üretmek zararsız.
    expect(isRoomLive({ status: "lobby", created_at: undefined } as RoomLike, NOW)).toBe(true);
  });
});

describe("pickJoinableRoom", () => {
  it("hiç oda yoksa null", () => {
    expect(pickJoinableRoom([], NOW)).toBeNull();
  });

  it("yalnızca kapanmış odalar varsa null", () => {
    expect(pickJoinableRoom([room({ status: "finished" })], NOW)).toBeNull();
  });

  it("kapanmış oda önce gelse bile canlı oda seçiliyor — asıl hata buydu", () => {
    // Firestore dönüş sırası garanti değil. Eski kod docs[0]'ı alıp durum
    // kontrolünü sonra yaptığı için oyuncu burada "oyun başlamış" hatası
    // alıp canlı odaya hiç giremiyordu.
    const dead = room({ status: "finished", created_at: NOW - 5000 });
    const live = room({ status: "lobby", created_at: NOW - 1000 });
    expect(pickJoinableRoom([dead, live], NOW)).toBe(live);
  });

  it("iki canlı oda aynı kodu taşıyorsa en yenisi seçiliyor", () => {
    const older = room({ created_at: NOW - 60_000 });
    const newer = room({ created_at: NOW - 1_000 });
    expect(pickJoinableRoom([older, newer], NOW)).toBe(newer);
    expect(pickJoinableRoom([newer, older], NOW)).toBe(newer);
  });

  it("süresi geçmiş oda, kodu yeniden kullanılmışsa yeni odayı gölgelemiyor", () => {
    const expired = room({ created_at: NOW - ROOM_CODE_LIFETIME_MS - 1 });
    const fresh = room({ created_at: NOW - 1_000 });
    expect(pickJoinableRoom([expired, fresh], NOW)).toBe(fresh);
  });
});

describe("allocateRoomCode", () => {
  it("boş kod bulunca onu döndürüyor", async () => {
    const code = await allocateRoomCode(async () => []);
    expect(code).toHaveLength(ROOM_CODE_LENGTH);
  });

  it("canlı odanın kullandığı kodu atlayıp yeniden deniyor", async () => {
    const seen: string[] = [];
    let call = 0;
    const code = await allocateRoomCode(async (c) => {
      seen.push(c);
      // İlk iki kod dolu, üçüncüsü boş.
      return ++call <= 2 ? [liveRoom()] : [];
    });
    expect(seen).toHaveLength(3);
    expect(code).toBe(seen[2]);
  });

  it("süresi geçmiş odanın kodunu boş sayıyor — kod uzayı tükenmesin", async () => {
    const expired = room({ created_at: NOW - ROOM_CODE_LIFETIME_MS - 1 });
    // Date.now() gerçek zaman; oda 1970+NOW'dan çok eski olduğu için ölü.
    const seen: string[] = [];
    const code = await allocateRoomCode(async (c) => {
      seen.push(c);
      return [expired];
    });
    expect(seen).toHaveLength(1);
    expect(code).toBe(seen[0]);
  });

  it("her deneme dolu çıkarsa oda açılışını engellemiyor, son kodu veriyor", async () => {
    // Kafenin gece ortasında oyunu HİÇ açamaması, düşük ihtimalli bir
    // çakışmadan daha kötü — bilinçli olarak son çareye düşüyoruz.
    const seen: string[] = [];
    const code = await allocateRoomCode(async (c) => {
      seen.push(c);
      return [liveRoom()];
    }, 3);
    expect(seen).toHaveLength(3);
    expect(code).toBe(seen[2]);
  });

  it("Firestore hatasında oda açılışı engellenmiyor", async () => {
    const code = await allocateRoomCode(async () => {
      throw new Error("ağ yok");
    });
    expect(code).toHaveLength(ROOM_CODE_LENGTH);
  });
});
