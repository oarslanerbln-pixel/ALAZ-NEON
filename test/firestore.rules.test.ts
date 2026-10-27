import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, updateDoc, addDoc, collection, getDoc, getDocs, deleteDoc, query, where, increment } from "firebase/firestore";
import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";

/**
 * Firestore güvenlik kuralı testleri.
 *
 * Bu paketin var olma sebebi somut: canlıda iki kez kural kaynaklı kırık
 * yaşandı — önce `answers` koleksiyonu için hiç kural olmaması yüzünden
 * dört oyun modunda da cevap gönderilemedi, sonra `rooms` güncellemesinin
 * yalnızca host'a açılması bomba paslamayı kırdı.
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
const RANDOM_SIGNUP_UID = "uid-random-signup";

const asHost = () => testEnv.authenticatedContext(HOST_UID).firestore();
const asPlayer = () => testEnv.authenticatedContext(PLAYER_UID).firestore();
const asGuest = () => testEnv.unauthenticatedContext().firestore();

/**
 * İşletme personeli: staff/{uid} dokümanı olan hesap. `seedStaff()` bu
 * dokümanı kurallar devre dışıyken oluşturuyor — gerçekte de tek yolu bu
 * (Firebase Console / Admin SDK), hiçbir istemci kendine yazamıyor.
 */
const asVenueOwner = () =>
  testEnv
    .authenticatedContext(OWNER_UID, { firebase: { sign_in_provider: "password" } })
    .firestore();

/**
 * Auth API'si herkese açık (eskiden /register sayfası da vardı): sıradan
 * bir ziyaretçi de e-posta/şifre hesabı açabiliyor. Bu bağlam tam olarak onu temsil ediyor — token'ı işletme
 * hesabınınkiyle AYNI, tek farkı staff kaydının olmaması. Yetki eskiden
 * sign_in_provider'a bakıyordu, yani bu hesap da her şeyi yapabiliyordu.
 */
const asRandomSignup = () =>
  testEnv
    .authenticatedContext(RANDOM_SIGNUP_UID, { firebase: { sign_in_provider: "password" } })
    .firestore();

/** Personel listesine bir uid ekler (yalnızca kurallar devre dışıyken mümkün). */
async function seedStaff(uid: string = OWNER_UID) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "staff", uid), { added_at: Date.now() });
  });
}

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

describe("presence — oyuncu nabzı (denetim P1)", () => {
  beforeEach(() => seed());
  const beat = (extra: Record<string, unknown> = {}) => ({ room_id: ROOM_ID, last_active: Date.now(), ...extra });

  it("oyuncu kendi nabzını yazıp yenileyebilir", async () => {
    await assertSucceeds(setDoc(doc(asPlayer(), "presence", PLAYER_UID), beat()));
    await assertSucceeds(setDoc(doc(asPlayer(), "presence", PLAYER_UID), beat()));
  });

  it("başkasının nabzını yazamaz (hayalet oyuncuyu canlı gösteremez)", async () => {
    await assertFails(setDoc(doc(asPlayer(), "presence", HOST_UID), beat()));
  });

  it("nabız belgesine fazladan alan (skor vb.) yazılamaz", async () => {
    await assertFails(setDoc(doc(asPlayer(), "presence", PLAYER_UID), beat({ total_score: 999 })));
  });

  it("last_active sayı, room_id metin olmalı", async () => {
    await assertFails(setDoc(doc(asPlayer(), "presence", PLAYER_UID), beat({ last_active: "şimdi" })));
    await assertFails(setDoc(doc(asPlayer(), "presence", PLAYER_UID), beat({ room_id: 42 })));
  });

  it("girişsiz kullanıcı nabız yazamaz ve okuyamaz", async () => {
    await assertFails(setDoc(doc(asGuest(), "presence", PLAYER_UID), beat()));
    await assertFails(getDocs(query(collection(asGuest(), "presence"), where("room_id", "==", ROOM_ID))));
  });

  it("host odanın nabızlarını room_id sorgusuyla okuyabilir; nabız silinemez", async () => {
    await assertSucceeds(setDoc(doc(asPlayer(), "presence", PLAYER_UID), beat()));
    await assertSucceeds(getDocs(query(collection(asHost(), "presence"), where("room_id", "==", ROOM_ID))));
    await assertFails(deleteDoc(doc(asPlayer(), "presence", PLAYER_UID)));
  });
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

describe("answers — okuma (kopya açığı)", () => {
  /** Aynı turda iki oyuncunun cevabı: biri PLAYER_UID'in, biri yabancınınki. */
  beforeEach(async () => {
    await seed({ status: "playing" });
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "answers", "mine"), {
        room_id: ROOM_ID,
        player_id: PLAYER_ID,
        round_letter: "A",
        data: { Şehir: "Ankara" },
      });
      await setDoc(doc(db, "answers", "theirs"), {
        room_id: ROOM_ID,
        player_id: OTHER_PLAYER_ID,
        round_letter: "A",
        data: { Şehir: "Adana" },
      });
    });
  });

  it("oyuncu kendi cevabını okuyabilir", async () => {
    await assertSucceeds(getDoc(doc(asPlayer(), "answers", "mine")));
  });

  it("oyuncu başka bir oyuncunun cevabını okuyamaz — tur bitmeden kopyalanabiliyordu", async () => {
    await assertFails(getDoc(doc(asPlayer(), "answers", "theirs")));
  });

  it("oyuncunun 'zaten cevapladım mı' sorgusu çalışır (room_id + player_id)", async () => {
    await assertSucceeds(
      getDocs(
        query(
          collection(asPlayer(), "answers"),
          where("room_id", "==", ROOM_ID),
          where("player_id", "==", PLAYER_ID),
          where("round_letter", "==", "A"),
        ),
      ),
    );
  });

  it("oyuncu odanın bütün cevaplarını sorgulayamaz", async () => {
    await assertFails(
      getDocs(query(collection(asPlayer(), "answers"), where("room_id", "==", ROOM_ID))),
    );
  });

  it("host odasının cevaplarını room_id sorgusuyla okuyabilir", async () => {
    await assertSucceeds(
      getDocs(
        query(
          collection(asHost(), "answers"),
          where("room_id", "==", ROOM_ID),
          where("round_letter", "==", "A"),
        ),
      ),
    );
  });

  it("girişsiz kullanıcı cevap okuyamaz", async () => {
    await assertFails(getDoc(doc(asGuest(), "answers", "mine")));
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

/**
 * Kaldırılan modların (sensör, overload, echo, pulse, kablo, colors, bar)
 * oyuncu yazma izinleri de kalktı: aynı alanlara konsoldan yazmak artık
 * reddediliyor. Bomba paslama tek oyuncu oda yazımı olarak kaldı.
 */
describe("kaldırılan modlar — oyuncu yazımları artık reddediliyor", () => {
  it("sensör buzzer'ı (sensor_buzzer_player_id) yazılamaz", async () => {
    await seed({ status: "sensor_active", sensor_buzzer_player_id: null });
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        status: "sensor_buzzed",
        sensor_buzzer_player_id: PLAYER_ID,
        sensor_buzzer_timestamp: Date.now(),
      })
    );
    await assertFails(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { sensor_player_answer: "Kahve" }));
  });

  it("overload savuşturması (overload_target_id) yazılamaz", async () => {
    await seed({ status: "playing", overload_target_id: PLAYER_ID, overload_time_allowed: 10 });
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { overload_target_id: null, overload_time_allowed: 9 })
    );
  });

  it("echo oyu (echo_votes) yazılamaz", async () => {
    await seed({ status: "echo_active", echo_question: "Kim?", echo_votes: {} });
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { [`echo_votes.${PLAYER_ID}`]: OTHER_PLAYER_ID })
    );
  });

  it("pulse dokunuşu (pulse_clicks) yazılamaz", async () => {
    await seed({ status: "pulse_active", pulse_clicks: {} });
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { [`pulse_clicks.${PLAYER_ID}`]: Date.now() })
    );
  });

  it("oyuncu kendi kablo/colors/bar sayacını artıramaz", async () => {
    await seed();
    await assertFails(updateDoc(doc(asPlayer(), "players", PLAYER_ID), { kablo_score: increment(1) }));
    await assertFails(updateDoc(doc(asPlayer(), "players", PLAYER_ID), { colors_clicks: increment(1) }));
    await assertFails(updateDoc(doc(asPlayer(), "players", PLAYER_ID), { bar_score: increment(1) }));
  });

  it("oyuncu belgesine nabız (last_active) yazılamaz — nabız presence/{uid}'de", async () => {
    await seed();
    await assertFails(updateDoc(doc(asPlayer(), "players", PLAYER_ID), { last_active: Date.now() }));
  });

  it("ayna_survey koleksiyonu kapalı", async () => {
    await seed({ status: "ayna_survey" });
    await assertFails(
      setDoc(doc(asPlayer(), "ayna_survey", `${ROOM_ID}_${PLAYER_UID}`), {
        room_id: ROOM_ID,
        host_uid: HOST_UID,
        player_id: PLAYER_ID,
        answers: { q1: 50 },
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

describe("rooms/secret — quiz cevap anahtarı", () => {
  beforeEach(() => seed({ status: "question_active", active_game: "quiz" }));

  const keyDoc = (db: ReturnType<typeof asHost>) => doc(db, "rooms", ROOM_ID, "secret", "quiz");

  it("host anahtarı yazıp okuyabilir", async () => {
    await assertSucceeds(setDoc(keyDoc(asHost()), { answers: ["B", "D", "A"] }));
    await assertSucceeds(getDoc(keyDoc(asHost())));
  });

  it("oyuncu anahtarı okuyamaz — sorular odaya doğru şıklarıyla yazılıyordu", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "rooms", ROOM_ID, "secret", "quiz"), { answers: ["B"] });
    });
    await assertFails(getDoc(keyDoc(asPlayer())));
    await assertFails(getDoc(keyDoc(asGuest())));
  });

  it("oyuncu anahtarı değiştiremez", async () => {
    await assertFails(setDoc(keyDoc(asPlayer()), { answers: ["A"] }));
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

  it("oyuncu kendi gecelik skorunu yazamaz", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "players", PLAYER_ID), { night_score: 50000 })
    );
  });

  it("host oyun ve gecelik skoru birlikte artırabilir", async () => {
    await assertSucceeds(
      updateDoc(doc(asHost(), "players", PLAYER_ID), { total_score: increment(500), night_score: increment(500) })
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

  it("personel listesindeki işletme hesabı markayı değiştirebilir", async () => {
    await seedStaff();
    await assertSucceeds(
      setDoc(doc(asVenueOwner(), "app_config", "active_venue"), {
        name: "YENİ MEKAN",
        primary_color: "#00ff00",
        rewards_enabled: false,
        updated_at: Date.now(),
      })
    );
  });

  it("KAYIT OLAN HERHANGİ BİRİ markayı değiştiremez — asıl güvenlik açığı buydu", async () => {
    // Herkes e-posta/şifre hesabı açabilir. Yetki sign_in_provider'a bakarken bu hesap
    // tüm uygulamanın markasını değiştirebiliyordu; staff kaydı yok, artık
    // reddediliyor.
    await assertFails(
      setDoc(doc(asRandomSignup(), "app_config", "active_venue"), { name: "ELE GEÇİRİLDİ" })
    );
  });

  it("işletme hesabı bile staff kaydı silinince markayı değiştiremez", async () => {
    await assertFails(
      setDoc(doc(asVenueOwner(), "app_config", "active_venue"), { name: "ELE GEÇİRİLDİ" })
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
    await seedStaff();
    await seedReward();
    await assertSucceeds(getDoc(doc(asVenueOwner(), "rewards", REWARD_ID)));
  });

  it("KAYIT OLAN HERHANGİ BİRİ başkasının ödülünü okuyamaz", async () => {
    // Eskiden bu hesap tüm ödül koleksiyonunu okuyup kuponları toplayabilirdi.
    await seedReward();
    await assertFails(getDoc(doc(asRandomSignup(), "rewards", REWARD_ID)));
  });

  /** lib/rewards.ts'in yazdığı şekilde, kazanan oyuncu adına yeni bir ödül. */
  const newReward = (overrides: Record<string, unknown> = {}) => ({
    uid: PLAYER_UID,
    nickname: "OYUNCU",
    type: "drink",
    title: "Ücretsiz Espresso",
    description: "",
    status: "available",
    code: "X9Y8Z7",
    earned_at: Date.now(),
    ...overrides,
  });

  it("personel hesabıyla açılan oyunda kazanan adına ödül oluşturulabilir", async () => {
    await seedStaff();
    await assertSucceeds(setDoc(doc(asVenueOwner(), "rewards", "reward-new"), newReward()));
  });

  it("geçerlilik süreli ödül de oluşturulabilir", async () => {
    await seedStaff();
    await assertSucceeds(
      setDoc(doc(asVenueOwner(), "rewards", "reward-new"), newReward({ expires_at: Date.now() + 86_400_000 })),
    );
  });

  it("anonim host ödül oluşturamaz — herkes oda açabildiği için host olmak güvence değil", async () => {
    await assertFails(setDoc(doc(asHost(), "rewards", "reward-new"), newReward()));
  });

  it("oyuncu kendine ödül basamaz — konsoldan bedava içki kodu açığı", async () => {
    await assertFails(setDoc(doc(asPlayer(), "rewards", "reward-new"), newReward()));
  });

  it("KAYIT OLAN HERHANGİ BİRİ ödül oluşturamaz", async () => {
    await assertFails(setDoc(doc(asRandomSignup(), "rewards", "reward-new"), newReward()));
  });

  it("personel bile şemaya uymayan ödül oluşturamaz", async () => {
    await seedStaff();
    await assertFails(
      setDoc(doc(asVenueOwner(), "rewards", "reward-new"), newReward({ title: "" })),
    );
    await assertFails(
      setDoc(doc(asVenueOwner(), "rewards", "reward-new"), newReward({ type: "champagne" })),
    );
    await assertFails(
      setDoc(doc(asVenueOwner(), "rewards", "reward-new"), newReward({ room_secret: "x" })),
    );
  });

  it("doğrudan 'claimed' durumunda bir ödül oluşturulamaz", async () => {
    await seedStaff();
    await assertFails(
      setDoc(doc(asVenueOwner(), "rewards", "reward-fake-claimed"), {
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
    await seedStaff();
    await seedReward();
    await assertSucceeds(
      updateDoc(doc(asVenueOwner(), "rewards", REWARD_ID), {
        status: "claimed",
        claimed_at: Date.now(),
      })
    );
  });

  it("işletme hesabı bile status/claimed_at dışındaki alanları değiştiremez", async () => {
    await seedStaff();
    await seedReward();
    await assertFails(
      updateDoc(doc(asVenueOwner(), "rewards", REWARD_ID), {
        status: "claimed",
        code: "ELE-GECIRILDI",
      })
    );
  });

  it("ödül dokümanı hiçbir zaman silinemez", async () => {
    await seedStaff();
    await seedReward();
    await assertFails(deleteDoc(doc(asVenueOwner(), "rewards", REWARD_ID)));
  });

  it("KAYIT OLAN HERHANGİ BİRİ ödülü 'claimed' işaretleyemez — bedava içecek açığı", async () => {
    await seedReward();
    await assertFails(
      updateDoc(doc(asRandomSignup(), "rewards", REWARD_ID), {
        status: "claimed",
        claimed_at: Date.now(),
      })
    );
  });
});

describe("TTL alanı (expires_at) yazımı", () => {
  // Firestore TTL politikası bu alana bakıyor; alan yazılamazsa temizlik
  // hiç çalışmaz ve odalar/cevaplar yine sonsuza kadar birikir.
  it("host oda açarken expires_at yazabiliyor", async () => {
    await assertSucceeds(
      setDoc(doc(asHost(), "rooms", "room-ttl"), {
        code: "WXYZ",
        host_uid: HOST_UID,
        status: "night_lobby",
        categories: [],
        timer_setting: 60,
        total_rounds: 3,
        current_round: 0,
        game_mode: "individual",
        created_at: Date.now(),
        expires_at: new Date(Date.now() + 86400000),
      })
    );
  });

  it("oyuncu katılırken expires_at yazabiliyor", async () => {
    await seed();
    await assertSucceeds(
      setDoc(doc(asPlayer(), "players", "player-ttl"), {
        room_id: ROOM_ID,
        uid: PLAYER_UID,
        nickname: "YENİ",
        team_name: null,
        total_score: 0,
        created_at: Date.now(),
        expires_at: new Date(Date.now() + 86400000),
      })
    );
  });

  it("oyuncu cevap gönderirken expires_at yazabiliyor", async () => {
    await seed({ status: "playing" });
    await assertSucceeds(
      addDoc(collection(asPlayer(), "answers"), {
        room_id: ROOM_ID,
        player_id: PLAYER_ID,
        round_letter: "A",
        round_index: 0,
        data: { sehir: "ANKARA" },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000),
      })
    );
  });

  it("oyuncu kendi kaydının expires_at'ini DEĞİŞTİREMİYOR — oyuncu belgesini yalnız host günceller", async () => {
    await seed();
    await assertFails(
      updateDoc(doc(asPlayer(), "players", PLAYER_ID), {
        expires_at: new Date(Date.now() + 10 * 365 * 86400000),
      })
    );
  });
});

describe("staff koleksiyonu — yetkinin kaynağı", () => {
  it("hiç kimse kendini personel yapamaz", async () => {
    // Bu kural tüm modelin dayandığı nokta: staff dokümanı istemciden
    // yazılabilseydi, herkes tek satırla kendine tam yetki verirdi.
    await assertFails(
      setDoc(doc(asRandomSignup(), "staff", RANDOM_SIGNUP_UID), { added_at: Date.now() })
    );
  });

  it("personel bile başka birini personel yapamaz (yalnızca Console/Admin SDK)", async () => {
    await seedStaff();
    await assertFails(
      setDoc(doc(asVenueOwner(), "staff", RANDOM_SIGNUP_UID), { added_at: Date.now() })
    );
  });

  it("hesap kendi personel kaydını okuyabilir (arayüz 'bu hesap personel mi' diye soruyor)", async () => {
    await seedStaff();
    await assertSucceeds(getDoc(doc(asVenueOwner(), "staff", OWNER_UID)));
  });

  it("kimse başkasının personel kaydını okuyamaz — liste toplanamaz", async () => {
    await seedStaff();
    await assertFails(getDoc(doc(asRandomSignup(), "staff", OWNER_UID)));
  });

  it("personel kaydı silinemez", async () => {
    await seedStaff();
    await assertFails(deleteDoc(doc(asVenueOwner(), "staff", OWNER_UID)));
  });

  it("custom claim de personel sayılıyor — staff kaydı olmadan da geçerli", async () => {
    // Proje Blaze plana geçip Cloud Functions ile claim atamaya başladığında
    // kuralları değiştirmeden bu yola geçilebilsin diye destekleniyor.
    // Belgelediğimiz bir yetki yolu; testsiz bırakılırsa sessizce bozulur.
    const withClaim = testEnv
      .authenticatedContext("uid-claim-staff", { staff: true })
      .firestore();
    await assertSucceeds(
      setDoc(doc(withClaim, "app_config", "active_venue"), { name: "CLAIM İLE" })
    );
  });

  it("claim'i false olan hesap personel değil", async () => {
    const withoutClaim = testEnv
      .authenticatedContext("uid-claim-false", { staff: false })
      .firestore();
    await assertFails(
      setDoc(doc(withoutClaim, "app_config", "active_venue"), { name: "ELE GEÇİRİLDİ" })
    );
  });
});

describe("seasons koleksiyonu", () => {
  it("herkes sezonu okuyabilir", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "seasons", "s1"), { name: "SEZON 1" });
    });
    await assertSucceeds(getDoc(doc(asGuest(), "seasons", "s1")));
  });

  it("anonim oturum sezon yazamaz — kural 'gelistirme sirasinda' notuyla açık kalmıştı", async () => {
    await assertFails(setDoc(doc(asPlayer(), "seasons", "s1"), { name: "SAHTE" }));
  });

  it("personel sezon yazabilir", async () => {
    await seedStaff();
    await assertSucceeds(setDoc(doc(asVenueOwner(), "seasons", "s1"), { name: "SEZON 1" }));
  });
});

describe("users koleksiyonu (ALAZ League)", () => {
  /** useUserProfile'ın açtığı şekliyle bir profil (telefon numarası dahil). */
  const profile = (overrides: Record<string, unknown> = {}) => ({
    phone_number: "+905551112233",
    nickname: "PLAYER_uid-",
    total_lifetime_score: 0,
    current_league: "BRONZE",
    created_at: Date.now(),
    last_active: Date.now(),
    ...overrides,
  });

  async function seedProfile(data: Record<string, unknown> = profile()) {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users", PLAYER_UID), data);
    });
  }

  it("profil yalnızca sahibine okunur — telefon numaraları herkese açıktı", async () => {
    await seedProfile();
    await assertSucceeds(getDoc(doc(asPlayer(), "users", PLAYER_UID)));
    await assertFails(getDoc(doc(asGuest(), "users", PLAYER_UID)));
    await assertFails(getDoc(doc(asHost(), "users", PLAYER_UID)));
  });

  it("kimse profil koleksiyonunu listeleyip numara toplayamaz", async () => {
    await seedProfile();
    await assertFails(getDocs(collection(asGuest(), "users")));
    await assertFails(getDocs(collection(asHost(), "users")));
  });

  it("kullanıcı kendi profilini oluşturabilir", async () => {
    await assertSucceeds(setDoc(doc(asPlayer(), "users", PLAYER_UID), profile()));
  });

  it("profil açılırken tanımsız alan yazılamaz", async () => {
    await assertFails(
      setDoc(doc(asPlayer(), "users", PLAYER_UID), profile({ is_admin: true })),
    );
  });

  it("kullanıcı lig puanını artırabilir ve takma adını değiştirebilir", async () => {
    await seedProfile();
    await assertSucceeds(
      updateDoc(doc(asPlayer(), "users", PLAYER_UID), { total_lifetime_score: increment(120) }),
    );
    await assertSucceeds(
      setDoc(doc(asPlayer(), "users", PLAYER_UID), { nickname: "ALAZ" }, { merge: true }),
    );
  });

  it("telefon numarası ve açılış zamanı sonradan değiştirilemez", async () => {
    await seedProfile();
    await assertFails(
      updateDoc(doc(asPlayer(), "users", PLAYER_UID), { phone_number: "+900000000000" }),
    );
    await assertFails(updateDoc(doc(asPlayer(), "users", PLAYER_UID), { created_at: 0 }));
  });

  it("lig puanı sayı, lig bilinen bir kademe olmalı", async () => {
    await seedProfile();
    await assertFails(
      updateDoc(doc(asPlayer(), "users", PLAYER_UID), { total_lifetime_score: "9999" }),
    );
    await assertFails(
      updateDoc(doc(asPlayer(), "users", PLAYER_UID), { current_league: "GOD_MODE" }),
    );
  });

  it("eski şemayla açılmış profil yine puan senkronu yapabilir", async () => {
    // Güncellemede yalnızca değişen alanlar denetleniyor; fazladan alanı
    // olan eski bir profil bu yüzden kilitlenmiyor.
    await seedProfile({ nickname: "ESKI", total_xp: 450, total_lifetime_score: 10 });
    await assertSucceeds(
      updateDoc(doc(asPlayer(), "users", PLAYER_UID), { total_lifetime_score: increment(5) }),
    );
  });

  it("kullanıcı başka birinin profilini değiştiremez", async () => {
    await assertFails(
      setDoc(doc(asPlayer(), "users", STRANGER_UID), profile({ nickname: "HACKED" }))
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


describe("denetim 2026-10 — misafir konsolu", () => {
  const OUTSIDER_UID = "uid-outsider";
  const asOutsider = () => testEnv.authenticatedContext(OUTSIDER_UID).firestore();

  describe("players — katılırken skor", () => {
    beforeEach(() => seed());

    it("misafir odaya yüksek oyun skoruyla katılamaz — ödül kazananı total_score'dan seçiliyor", async () => {
      await assertFails(
        addDoc(collection(asPlayer(), "players"), {
          room_id: ROOM_ID, uid: PLAYER_UID, nickname: "HILE", team_name: null,
          total_score: 99999, night_score: 0, created_at: Date.now(),
        })
      );
    });

    it("misafir odaya gecelik skorla katılamaz", async () => {
      await assertFails(
        addDoc(collection(asPlayer(), "players"), {
          room_id: ROOM_ID, uid: PLAYER_UID, nickname: "HILE", team_name: null,
          total_score: 0, night_score: 250, created_at: Date.now(),
        })
      );
    });

    it("misafir kayda can ya da başka oyun alanı ekleyemez", async () => {
      await assertFails(
        addDoc(collection(asPlayer(), "players"), {
          room_id: ROOM_ID, uid: PLAYER_UID, nickname: "HILE", team_name: null,
          total_score: 0, night_score: 0, lives: 99, created_at: Date.now(),
        })
      );
    });

    it("katılım yazımı aynı veriyle tekrarlanabilir (onayı kaybolan isteğin yeniden denemesi)", async () => {
      const join = {
        room_id: ROOM_ID, nickname: "ANNA", team_name: null, total_score: 0, night_score: 0,
        uid: PLAYER_UID, created_at: 1_700_000_000_000,
      };
      await assertSucceeds(setDoc(doc(asPlayer(), "players", "player-retry"), join));
      await assertSucceeds(setDoc(doc(asPlayer(), "players", "player-retry"), join));
    });

    it("uygulamanın gönderdiği katılım kaydı geçer (PlayerJoin ile aynı alanlar)", async () => {
      await assertSucceeds(
        addDoc(collection(asPlayer(), "players"), {
          room_id: ROOM_ID, nickname: "ANNA", team_name: null, total_score: 0, night_score: 0,
          uid: PLAYER_UID, created_at: Date.now(), expires_at: new Date(Date.now() + 86_400_000),
        })
      );
    });
  });

  describe("rooms — bombayı yalnız tutan paslar", () => {
    beforeEach(() => seed({ status: "bomb_active", bomb_target_player: PLAYER_ID, used_words: [] }));

    it("bombayı tutmayan oyuncu bombayı başkasına yönlendiremez", async () => {
      await assertFails(
        updateDoc(doc(testEnv.authenticatedContext(STRANGER_UID).firestore(), "rooms", ROOM_ID), {
          previous_bomb_target_player: PLAYER_ID,
          bomb_target_player: PLAYER_ID,
          used_words: ["küfür"],
        })
      );
    });

    it("odada olmayan biri bombayı yönlendiremez", async () => {
      await assertFails(
        updateDoc(doc(asOutsider(), "rooms", ROOM_ID), {
          previous_bomb_target_player: PLAYER_ID,
          bomb_target_player: OTHER_PLAYER_ID,
          used_words: ["x"],
        })
      );
    });
  });

  describe("rewards — kod yalnız bir kez kullanılır", () => {
    const REWARD_ID = "reward-audit";
    async function seedReward(status: string) {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), "rewards", REWARD_ID), {
          uid: PLAYER_UID, nickname: "OYUNCU", type: "drink", title: "Espresso",
          status, code: "Z9Y8X7", earned_at: Date.now(),
        });
      });
    }

    it("kullanılmış ödül ikinci kez 'claimed' işaretlenemez — iki bar cihazı aynı kodu onaylıyordu", async () => {
      await seedStaff();
      await seedReward("claimed");
      await assertFails(
        updateDoc(doc(asVenueOwner(), "rewards", REWARD_ID), { status: "claimed", claimed_at: Date.now() })
      );
    });

    it("kullanılmış ödül yeniden 'available' yapılamaz", async () => {
      await seedStaff();
      await seedReward("claimed");
      await assertFails(updateDoc(doc(asVenueOwner(), "rewards", REWARD_ID), { status: "available" }));
    });
  });
});
