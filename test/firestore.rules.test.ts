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

const OWNER_UID = "uid-venue-owner";

const asHost = () => testEnv.authenticatedContext(HOST_UID).firestore();
const asPlayer = () => testEnv.authenticatedContext(PLAYER_UID).firestore();
const asGuest = () => testEnv.unauthenticatedContext().firestore();
// Gerçek Firebase ID token'larında sağlayıcı bilgisi burada durur:
// token.firebase.sign_in_provider. Uygulamadaki her anonim host/oyuncu
// oturumunun "anonymous" olduğu, yalnızca e-posta/şifreyle giriş yapmış
// hesapların "password" taşıdığı varsayımını burada simüle ediyoruz.
const asVenueOwner = () =>
  testEnv
    .authenticatedContext(OWNER_UID, { firebase: { sign_in_provider: "password" } })
    .firestore();

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

describe("rooms — overload savuşturma", () => {
  beforeEach(() =>
    seed({ status: "playing", overload_target_id: PLAYER_ID, overload_time_allowed: 10 })
  );

  it("hedef olan oyuncu bombayı savuşturup paslayabilir", async () => {
    await assertSucceeds(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        overload_target_id: null,
        overload_time_allowed: 9,
      })
    );
  });

  it("oyuncu savuşturma bahanesiyle oda durumunu değiştiremez", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        overload_target_id: null,
        status: "finished",
      })
    );
  });

  it("oyuncu oyun 'playing' değilken savuşturma yazamaz", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), { status: "lobby" });
    });
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        overload_target_id: null,
        overload_time_allowed: 9,
      })
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

describe("app_config — mekan markası", () => {
  it("herkes aktif markayı okuyabilir (oda açılmadan önce landing/login bakıyor)", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "app_config", "active_venue"), {
        name: "TEST MEKANI",
        rewards_enabled: true,
      });
    });
    await assertSucceeds(getDoc(doc(asGuest(), "app_config", "active_venue")));
  });

  it("e-posta/şifre ile giriş yapmış işletme hesabı markayı değiştirebilir", async () => {
    await assertSucceeds(
      setDoc(doc(asVenueOwner(), "app_config", "active_venue"), {
        name: "YENİ MEKAN",
        primary_color: "#00ff00",
        rewards_enabled: false,
        updated_at: Date.now(),
      })
    );
  });

  it("anonim host oturumu markayı değiştiremez", async () => {
    // asHost() bu paketteki HER anonim oturumu temsil ediyor — gerçek
    // uygulamada host/oyuncu girişi hep anonim, sadece işletme hesabı
    // e-posta/şifre kullanıyor. Bu ayrım kırılırsa herhangi bir ziyaretçi
    // tüm uygulamanın markasını değiştirebilir hâle gelir.
    await assertFails(
      setDoc(doc(asHost(), "app_config", "active_venue"), { name: "ELE GEÇİRİLDİ" })
    );
  });

  it("girişsiz kullanıcı markayı değiştiremez", async () => {
    await assertFails(
      setDoc(doc(asGuest(), "app_config", "active_venue"), { name: "ELE GEÇİRİLDİ" })
    );
  });
});

describe("rewards koleksiyonu", () => {
  const REWARD_ID = "reward-1";

  /** PLAYER_UID'e ait, "available" durumunda tek bir ödül dokümanı kurar. */
  async function seedReward(overrides: Record<string, unknown> = {}) {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "rewards", REWARD_ID), {
        uid: PLAYER_UID,
        nickname: "OYUNCU",
        type: "drink",
        title: "Ücretsiz Espresso",
        description: "",
        status: "available",
        code: "A1B2C3",
        earned_at: Date.now(),
        ...overrides,
      });
    });
  }

  it("oyuncu kendi ödülünü okuyabilir", async () => {
    await seedReward();
    await assertSucceeds(getDoc(doc(asPlayer(), "rewards", REWARD_ID)));
  });

  it("başka bir oyuncu bu ödülü okuyamaz — önceki kural herhangi bir girişe tüm koleksiyonu açıyordu", async () => {
    await seedReward();
    await assertFails(getDoc(doc(asHost(), "rewards", REWARD_ID)));
  });

  it("işletme hesabı (doğrulama ekranı) başkasının ödülünü kod ile okuyabilir", async () => {
    await seedReward();
    await assertSucceeds(getDoc(doc(asVenueOwner(), "rewards", REWARD_ID)));
  });

  it("host, kazanan oyuncu adına 'available' bir ödül oluşturabilir", async () => {
    await assertSucceeds(
      setDoc(doc(asHost(), "rewards", "reward-new"), {
        uid: PLAYER_UID,
        nickname: "OYUNCU",
        type: "drink",
        title: "Ücretsiz Espresso",
        description: "",
        status: "available",
        code: "X9Y8Z7",
        earned_at: Date.now(),
      })
    );
  });

  it("doğrudan 'claimed' durumunda bir ödül oluşturulamaz", async () => {
    await assertFails(
      setDoc(doc(asHost(), "rewards", "reward-fake-claimed"), {
        uid: PLAYER_UID,
        nickname: "OYUNCU",
        type: "drink",
        title: "Sahte",
        description: "",
        status: "claimed",
        claimed_at: Date.now(),
        code: "FAKE01",
        earned_at: Date.now(),
      })
    );
  });

  it("oyuncu KENDİ ödülünü 'claimed' işaretleyemez — asıl güvenlik açığı buydu", async () => {
    await seedReward();
    await assertFails(
      updateDoc(doc(asPlayer(), "rewards", REWARD_ID), {
        status: "claimed",
        claimed_at: Date.now(),
      })
    );
  });

  it("işletme hesabı (barda doğrulama) ödülü 'claimed' işaretleyebilir", async () => {
    await seedReward();
    await assertSucceeds(
      updateDoc(doc(asVenueOwner(), "rewards", REWARD_ID), {
        status: "claimed",
        claimed_at: Date.now(),
      })
    );
  });

  it("işletme hesabı bile status/claimed_at dışındaki alanları değiştiremez", async () => {
    await seedReward();
    await assertFails(
      updateDoc(doc(asVenueOwner(), "rewards", REWARD_ID), {
        status: "claimed",
        code: "ELE-GECIRILDI",
      })
    );
  });

  it("ödül dokümanı hiçbir zaman silinemez", async () => {
    await seedReward();
    await assertFails(deleteDoc(doc(asVenueOwner(), "rewards", REWARD_ID)));
  });
});

describe("users koleksiyonu (ALAZ League)", () => {
  it("herkes kullanıcı profilini okuyabilir (liderlik tablosu için)", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users", PLAYER_UID), {
        nickname: "ALAZ_CHAMPION",
        total_xp: 450,
      });
    });
    await assertSucceeds(getDoc(doc(asGuest(), "users", PLAYER_UID)));
  });

  it("kullanıcı kendi profilini oluşturabilir veya güncelleyebilir", async () => {
    await assertSucceeds(
      setDoc(doc(asPlayer(), "users", PLAYER_UID), {
        nickname: "ALAZ_CHAMPION",
        total_xp: 500,
      })
    );
  });

  it("kullanıcı başka birinin profilini değiştiremez", async () => {
    await assertFails(
      setDoc(doc(asPlayer(), "users", STRANGER_UID), {
        nickname: "HACKED",
        total_xp: 0,
      })
    );
  });

  it("kullanıcı profili doğrudan silinemez", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users", PLAYER_UID), {
        nickname: "PLAYER",
      });
    });
    await assertFails(deleteDoc(doc(asPlayer(), "users", PLAYER_UID)));
  });
});

