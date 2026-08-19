import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, updateDoc, addDoc, collection, getDoc, deleteDoc } from "firebase/firestore";
import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";

/**
 * Firestore güvenlik kuralı testleri.
 *
 * Bu paketin var olma sebebi somut: canlıda iki kez kural kaynaklı kırık
 * yaşandı — önce `answers` koleksiyonu için hiç kural olmaması yüzünden
 * dört oyun modunda da cevap gönderilemedi, sonra `rooms` güncellemesinin
 * yalnızca host'a açılması bomba paslama ile sensör buzzer'ını kırdı.
 * İkisi de burada birer test olarak sabitlendi.
 */

const PROJECT_ID = "alaz-neon-rules-test";

const HOST_UID = "uid-host";
const PLAYER_UID = "uid-player";
const STRANGER_UID = "uid-stranger";

const ROOM_ID = "room-1";
const PLAYER_ID = "player-1";
const OTHER_PLAYER_ID = "player-2";

let testEnv: RulesTestEnvironment;

/** Belirli bir oda durumu için temiz bir veri seti kurar. */
async function seed(roomOverrides: Record<string, unknown> = {}) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "rooms", ROOM_ID), {
      code: "ABCD",
      host_uid: HOST_UID,
      status: "lobby",
      categories: ["Şehir", "İsim"],
      timer_setting: 60,
      total_rounds: 3,
      current_round: 0,
      game_mode: "individual",
      ...roomOverrides,
    });
    await setDoc(doc(db, "players", PLAYER_ID), {
      room_id: ROOM_ID,
      uid: PLAYER_UID,
      nickname: "OYUNCU",
      team_name: null,
      total_score: 0,
      created_at: Date.now(),
    });
    await setDoc(doc(db, "players", OTHER_PLAYER_ID), {
      room_id: ROOM_ID,
      uid: STRANGER_UID,
      nickname: "DIGER",
      team_name: null,
      total_score: 0,
      created_at: Date.now(),
    });
  });
}

const asHost = () => testEnv.authenticatedContext(HOST_UID).firestore();
const asPlayer = () => testEnv.authenticatedContext(PLAYER_UID).firestore();
const asGuest = () => testEnv.unauthenticatedContext().firestore();

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("answers koleksiyonu", () => {
  beforeEach(() => seed());

  it("oyuncu kendi player_id'si ile cevap gönderebilir", async () => {
    await assertSucceeds(
      addDoc(collection(asPlayer(), "answers"), {
        room_id: ROOM_ID,
        player_id: PLAYER_ID,
        round_letter: "A",
        data: { Şehir: "Ankara" },
        created_at: new Date().toISOString(),
      })
    );
  });

  it("oyuncu başkasının adına cevap gönderemez", async () => {
    await assertFails(
      addDoc(collection(asPlayer(), "answers"), {
        room_id: ROOM_ID,
        player_id: OTHER_PLAYER_ID,
        round_letter: "A",
        data: { Şehir: "Ankara" },
      })
    );
  });

  it("giriş yapmamış kullanıcı cevap gönderemez", async () => {
    await assertFails(
      addDoc(collection(asGuest(), "answers"), {
        room_id: ROOM_ID,
        player_id: PLAYER_ID,
        round_letter: "A",
        data: {},
      })
    );
  });

  it("gönderilmiş cevap sonradan değiştirilemez", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "answers", "a1"), {
        room_id: ROOM_ID,
        player_id: PLAYER_ID,
        round_letter: "A",
        data: { Şehir: "Ankara" },
      });
    });
    await assertFails(
      updateDoc(doc(asPlayer(), "answers", "a1"), { data: { Şehir: "Adana" } })
    );
  });
});

describe("rooms — bomba paslama", () => {
  beforeEach(() => seed({ status: "bomb_active", bomb_target_player: PLAYER_ID, used_words: [] }));

  it("oyuncu bombayı paslayabilir", async () => {
    await assertSucceeds(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        previous_bomb_target_player: PLAYER_ID,
        bomb_target_player: OTHER_PLAYER_ID,
        used_words: ["kelime"],
      })
    );
  });

  it("oyuncu paslama bahanesiyle oda durumunu değiştiremez", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        bomb_target_player: OTHER_PLAYER_ID,
        status: "finished",
      })
    );
  });

  it("oyuncu bomba aktif değilken paslama yapamaz", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), { status: "lobby" });
    });
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        bomb_target_player: OTHER_PLAYER_ID,
      })
    );
  });
});

describe("rooms — sensör buzzer", () => {
  beforeEach(() => seed({ status: "sensor_active", sensor_buzzer_player_id: null }));

  it("oyuncu buzzer'a basıp turu kilitleyebilir", async () => {
    await assertSucceeds(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        status: "sensor_buzzed",
        sensor_buzzer_player_id: PLAYER_ID,
        sensor_buzzer_timestamp: Date.now(),
      })
    );
  });

  it("oyuncu doğrudan cevap ekranına atlayamaz", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        status: "sensor_reveal",
        sensor_buzzer_player_id: PLAYER_ID,
      })
    );
  });

  it("buzzer'a basıldıktan sonra oyuncu cevabını yazabilir", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), {
        status: "sensor_buzzed",
        sensor_buzzer_player_id: PLAYER_ID,
      });
    });
    await assertSucceeds(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { sensor_player_answer: "Kahve" })
    );
  });
});

describe("rooms — host yetkisi", () => {
  beforeEach(() => seed());

  it("host odayı serbestçe güncelleyebilir", async () => {
    await assertSucceeds(
      updateDoc(doc(asHost(), "rooms", ROOM_ID), {
        status: "playing",
        active_letter: "B",
        current_round: 1,
      })
    );
  });

  it("oyuncu oyun ayarlarını değiştiremez", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { categories: ["Hile"] })
    );
  });

  it("oyuncu odayı silemez", async () => {
    await assertFails(deleteDoc(doc(asPlayer(), "rooms", ROOM_ID)));
  });

  it("oda herkes tarafından okunabilir (telefonlar PIN ile bağlanıyor)", async () => {
    await assertSucceeds(getDoc(doc(asGuest(), "rooms", ROOM_ID)));
  });
});

describe("players — skor bütünlüğü", () => {
  beforeEach(() => seed());

  it("oyuncu kendi skorunu yükseltemez", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "players", PLAYER_ID), { total_score: 999999 })
    );
  });

  it("host oyuncu skorunu güncelleyebilir", async () => {
    await assertSucceeds(
      updateDoc(doc(asHost(), "players", PLAYER_ID), { total_score: 120 })
    );
  });

  it("oyuncu kendi adına odaya katılabilir", async () => {
    await assertSucceeds(
      addDoc(collection(asPlayer(), "players"), {
        room_id: ROOM_ID,
        uid: PLAYER_UID,
        nickname: "YENI",
        team_name: null,
        total_score: 0,
        created_at: Date.now(),
      })
    );
  });

  it("oyuncu başka bir uid adına oyuncu oluşturamaz", async () => {
    await assertFails(
      addDoc(collection(asPlayer(), "players"), {
        room_id: ROOM_ID,
        uid: STRANGER_UID,
        nickname: "SAHTE",
        total_score: 0,
      })
    );
  });
});
