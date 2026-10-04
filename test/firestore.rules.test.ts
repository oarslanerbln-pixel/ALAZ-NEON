import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, updateDoc, addDoc, collection, getDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";

// Uygulamanın yazdığı verinin kendisi: testler istemciden ayrışamasın diye
// elle kopyalanmış nesneler yerine bu fonksiyonlar kullanılıyor (bkz.
// src/lib/clientWrites.ts ve src/lib/__tests__/writeContract.test.ts).
import {
  COUNTER_MAX_STEP,
  UNITY_MAX_STEP,
  aynaGuessPayload,
  aynaSurveyPayload,
  bombPassPayload,
  counterIncrementPayload,
  echoInputPayload,
  emojiPulsePayload,
  heartbeatPayload,
  letterAnswerPayload,
  lifetimeCreditPayload,
  lifetimeMarkerPayload,
  nicknamePayload,
  overloadDeflectPayload,
  playerJoinPayload,
  profileCreatePayload,
  pulseInputPayload,
  quizAnswerPayload,
  rewardClaimPayload,
  rewardPayload,
  roomCreatePayload,
  sensorAnswerPayload,
  sensorBuzzPayload,
  unityInputPayload,
  vaultGuessPayload,
  wheelSpinPayload,
  type PlayerCounter,
} from "../src/lib/clientWrites";

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
 * /register herkese açık: sıradan bir ziyaretçi de e-posta/şifre hesabı
 * açabiliyor. Bu bağlam tam olarak onu temsil ediyor — token'ı işletme
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

describe("answers koleksiyonu", () => {
  beforeEach(() => seed({ status: "playing" }));

  /** PlayerGame'in klasik turda gerçekte yazdığı cevap. */
  const answer = (overrides: Record<string, unknown> = {}) => ({
    ...letterAnswerPayload({
      roomId: ROOM_ID,
      playerId: PLAYER_ID,
      letter: "A",
      roundIndex: 1,
      data: { Şehir: "Ankara" },
    }),
    ...overrides,
  });
  const answers = (db: ReturnType<typeof asPlayer>) => collection(db, "answers");

  it("oyuncu kendi player_id'si ile cevap gönderebilir", async () => {
    await assertSucceeds(addDoc(answers(asPlayer()), answer()));
  });

  it("oyuncu başkasının adına cevap gönderemez", async () => {
    await assertFails(addDoc(answers(asPlayer()), answer({ player_id: OTHER_PLAYER_ID })));
  });

  it("giriş yapmamış kullanıcı cevap gönderemez", async () => {
    await assertFails(addDoc(answers(asGuest()), answer()));
  });

  it("gönderilmiş cevap sonradan değiştirilemez", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "answers", "a1"), answer());
    });
    await assertFails(
      updateDoc(doc(asPlayer(), "answers", "a1"), { data: { Şehir: "Adana" } })
    );
  });

  // Oyuncu kaydının odası kontrol edilmiyordu: bir odanın oyuncusu başka
  // odanın turuna cevap basabiliyordu.
  it("oyuncu kendi odası dışındaki bir odaya cevap yazamaz", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "rooms", "room-2"), { host_uid: HOST_UID, status: "playing" });
    });
    await assertFails(addDoc(answers(asPlayer()), answer({ room_id: "room-2" })));
  });

  it("cevap kabul etmeyen oda durumunda (lobi, bitmiş oyun) yazılamaz", async () => {
    await seed({ status: "lobby" });
    await assertFails(addDoc(answers(asPlayer()), answer()));
    await seed({ status: "finished" });
    await assertFails(addDoc(answers(asPlayer()), answer()));
  });

  it("süre bitip host incelemeye geçtiğinde otomatik gönderim hâlâ kabul edilir", async () => {
    await seed({ status: "review" });
    await assertSucceeds(addDoc(answers(asPlayer()), answer()));
  });

  it("şema dışı alan, dev veri haritası ya da uzun tur anahtarı yazılamaz", async () => {
    await assertFails(addDoc(answers(asPlayer()), answer({ score: 9999 })));
    const huge = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`k${i}`, "x"]));
    await assertFails(addDoc(answers(asPlayer()), answer({ data: huge })));
    await assertFails(addDoc(answers(asPlayer()), answer({ round_letter: "X".repeat(64) })));
  });

  describe("okuma", () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), "answers", "mine"), answer());
      });
    });

    // Cevaplar herkese açıktı: hızlı oyuncunun cevabı tur bitmeden okunup
    // kopyalanabiliyordu.
    it("başka bir oyuncu ya da girişsiz kullanıcı cevabı okuyamaz", async () => {
      await assertFails(getDoc(doc(asStranger(), "answers", "mine")));
      await assertFails(getDoc(doc(asGuest(), "answers", "mine")));
    });

    it("başka bir oyuncu odanın bütün cevaplarını sorgulayamaz", async () => {
      await assertFails(
        getDocs(query(answers(asStranger()), where("room_id", "==", ROOM_ID)))
      );
    });

    it("oyuncu kendi cevabını okuyabilir ve kendi cevaplarını sorgulayabilir", async () => {
      await assertSucceeds(getDoc(doc(asPlayer(), "answers", "mine")));
      // PlayerQuizController / PlayerAynaController'ın "zaten cevapladım mı" sorgusu.
      await assertSucceeds(
        getDocs(
          query(
            answers(asPlayer()),
            where("room_id", "==", ROOM_ID),
            where("player_id", "==", PLAYER_ID),
            where("round_letter", "==", "A")
          )
        )
      );
    });

    it("host odanın cevaplarını sorgulayabilir", async () => {
      await assertSucceeds(
        getDocs(query(answers(asHost()), where("room_id", "==", ROOM_ID), where("round_letter", "==", "A")))
      );
    });
  });
});

// Odadaki diğer oyuncu (OTHER_PLAYER_ID'nin sahibi).
const asStranger = () => testEnv.authenticatedContext(STRANGER_UID).firestore();

describe("rooms — bomba paslama", () => {
  beforeEach(() => seed({ status: "bomb_active", bomb_target_player: PLAYER_ID, used_words: [] }));

  it("bombayı tutan oyuncu paslayabilir", async () => {
    await assertSucceeds(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        previous_bomb_target_player: PLAYER_ID,
        bomb_target_player: OTHER_PLAYER_ID,
        used_words: ["kelime"],
      })
    );
  });

  // Paslama kuralı yalnızca alan listesine bakıyordu: bombayı tutmayan biri
  // de bombayı istediğine atabiliyor, turu kilitleyebiliyordu.
  it("bombayı tutmayan oyuncu paslayamaz", async () => {
    await assertFails(
      updateDoc(doc(asStranger(), "rooms", ROOM_ID), {
        previous_bomb_target_player: OTHER_PLAYER_ID,
        bomb_target_player: PLAYER_ID,
        used_words: ["kelime"],
      })
    );
  });

  it("paslayan kendini başkası gibi gösteremez", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        previous_bomb_target_player: OTHER_PLAYER_ID,
        bomb_target_player: OTHER_PLAYER_ID,
        used_words: ["kelime"],
      })
    );
  });

  it("bomba odada olmayan birine paslanamaz", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        previous_bomb_target_player: PLAYER_ID,
        bomb_target_player: "uydurma-oyuncu",
        used_words: ["kelime"],
      })
    );
  });

  it("kullanılmış kelimeler silinemez", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), { used_words: ["elma", "armut"] });
    });
    await assertFails(
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
        previous_bomb_target_player: PLAYER_ID,
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

  it("başka bir oyuncunun adına buzzer'a basılamaz", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        status: "sensor_buzzed",
        sensor_buzzer_player_id: OTHER_PLAYER_ID,
        sensor_buzzer_timestamp: Date.now(),
      })
    );
  });

  it("odada olmayan biri buzzer'a basamaz", async () => {
    await assertFails(
      updateDoc(doc(asRandomSignup(), "rooms", ROOM_ID), {
        status: "sensor_buzzed",
        sensor_buzzer_player_id: "uydurma-oyuncu",
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

  describe("buzzer'a basıldıktan sonra", () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), {
          status: "sensor_buzzed",
          sensor_buzzer_player_id: PLAYER_ID,
        });
      });
    });

    it("basan oyuncu cevabını yazabilir", async () => {
      await assertSucceeds(
        updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { sensor_player_answer: "Kahve" })
      );
    });

    it("basmayan oyuncu cevap yazamaz", async () => {
      await assertFails(
        updateDoc(doc(asStranger(), "rooms", ROOM_ID), { sensor_player_answer: "Çay" })
      );
    });

    it("cevap TV'yi taşıracak uzunlukta olamaz", async () => {
      await assertFails(
        updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { sensor_player_answer: "X".repeat(500) })
      );
    });
  });
});

describe("rooms — overload savuşturma", () => {
  beforeEach(() =>
    seed({ status: "playing", overload_target_id: PLAYER_ID, overload_time_allowed: 10 })
  );

  /** PlayerOverloadGame'in savuşturmada gerçekte yazdığı alanlar. */
  const deflect = (from: string) => overloadDeflectPayload(from);

  // Eski test istemcinin YAZMADIĞI bir veriyi deniyordu (overload_time_allowed);
  // istemcinin yazdığı overload_last_target_id beyaz listede yoktu, yani
  // canlıda her savuşturma reddediliyordu.
  it("hedef olan oyuncu savuşturabilir (istemcinin gerçek yazımı)", async () => {
    await assertSucceeds(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), deflect(PLAYER_ID)));
  });

  it("hedef olmayan oyuncu savuşturamaz", async () => {
    await assertFails(updateDoc(doc(asStranger(), "rooms", ROOM_ID), deflect(OTHER_PLAYER_ID)));
  });

  it("savuşturan kendini başkası gibi gösteremez", async () => {
    await assertFails(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), deflect(OTHER_PLAYER_ID)));
  });

  // Sonraki hedefi ve kısalan süreyi host seçiyor; oyuncu süreyi yazabiliyordu.
  it("oyuncu tur süresini yazamaz", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { overload_time_allowed: 999 })
    );
  });

  it("oyuncu savuşturma bahanesiyle oda durumunu değiştiremez", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { ...deflect(PLAYER_ID), status: "finished" })
    );
  });

  it("oyuncu oyun 'playing' değilken savuşturma yazamaz", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), { status: "lobby" });
    });
    await assertFails(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), deflect(PLAYER_ID)));
  });
});

/**
 * Oyuncu girişleri (rooms/{id}/inputs/{playerId}): echo oyu ve pulse
 * dokunuşu. Eskiden oda dokümanındaki haritalara yazılıyordu; her oy
 * odadaki her telefona bir okuma olarak yayılıyordu ve haritanın tamamı
 * başkasının oyunu ezecek şekilde yazılabiliyordu. Artık her oyuncu yalnızca
 * kendi kaydına, tur başına bir kez yazıyor; kayıtları yalnızca host
 * okuyor, sonucu reveal anında odaya o yazıyor.
 */
const inputRef = (db: ReturnType<typeof asPlayer>, playerId: string) =>
  doc(db, "rooms", ROOM_ID, "inputs", playerId);

describe("rooms/{id}/inputs — echo oyu", () => {
  const ROUND = 7;
  beforeEach(() => seed({ status: "echo_active", echo_question: "Kim?", echo_votes: {}, input_round: ROUND }));

  it("oyuncu oyunu kendi giriş kaydına yazabilir", async () => {
    await assertSucceeds(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, echo_vote: OTHER_PLAYER_ID })
    );
  });

  it("oyuncu artık oda dokümanına oy yazamaz", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        [`echo_votes.${PLAYER_ID}`]: OTHER_PLAYER_ID,
      })
    );
  });

  it("başka bir oyuncunun kaydına oy yazılamaz", async () => {
    await assertFails(
      setDoc(inputRef(asPlayer(), OTHER_PLAYER_ID), { round: ROUND, echo_vote: PLAYER_ID })
    );
  });

  it("kendine ya da odada olmayan birine oy verilemez", async () => {
    await assertFails(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, echo_vote: PLAYER_ID })
    );
    await assertFails(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, echo_vote: "uydurma-oyuncu" })
    );
  });

  it("aynı turda ikinci kez oy verilemez", async () => {
    await assertSucceeds(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, echo_vote: OTHER_PLAYER_ID })
    );
    await assertFails(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, echo_vote: OTHER_PLAYER_ID })
    );
  });

  it("yeni turda yeniden oy verilebilir", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(inputRef(ctx.firestore(), PLAYER_ID), { round: ROUND - 1, echo_vote: OTHER_PLAYER_ID });
    });
    await assertSucceeds(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, echo_vote: OTHER_PLAYER_ID })
    );
  });

  it("eski tur numarasıyla oy verilemez", async () => {
    await assertFails(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND - 1, echo_vote: OTHER_PLAYER_ID })
    );
  });

  it("oylama açık değilken oy verilemez", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), { status: "echo_reveal" });
    });
    await assertFails(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, echo_vote: OTHER_PLAYER_ID })
    );
  });

  describe("okuma", () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(inputRef(ctx.firestore(), PLAYER_ID), { round: ROUND, echo_vote: OTHER_PLAYER_ID });
      });
    });

    it("oyuncu kendi oyunu okuyabilir (telefon yenilenince 'oy verdin' korunur)", async () => {
      await assertSucceeds(getDoc(inputRef(asPlayer(), PLAYER_ID)));
    });

    it("diğer oyuncular kimin kime oy verdiğini okuyamaz", async () => {
      await assertFails(getDoc(inputRef(asStranger(), PLAYER_ID)));
      await assertFails(getDocs(collection(asStranger(), "rooms", ROOM_ID, "inputs")));
    });

    it("host bütün girişleri listeleyebilir", async () => {
      await assertSucceeds(getDocs(collection(asHost(), "rooms", ROOM_ID, "inputs")));
    });
  });
});

describe("rooms/{id}/inputs — pulse dokunuşu", () => {
  const ROUND = 3;
  beforeEach(() =>
    seed({ status: "pulse_active", pulse_target_time: Date.now() + 10000, pulse_clicks: {}, input_round: ROUND })
  );

  it("oyuncu dokunuş zamanını kendi giriş kaydına yazabilir", async () => {
    await assertSucceeds(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, pulse_click: Date.now() })
    );
  });

  it("oyuncu artık oda dokümanına dokunuş yazamaz", async () => {
    await assertFails(
      updateDoc(doc(asPlayer(), "rooms", ROOM_ID), {
        [`pulse_clicks.${PLAYER_ID}`]: Date.now(),
      })
    );
  });

  it("dokunuş bahanesiyle başka alan ya da echo oyu yazılamaz", async () => {
    await assertFails(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, pulse_click: Date.now(), total_score: 9999 })
    );
    await assertFails(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, echo_vote: OTHER_PLAYER_ID })
    );
  });

  it("tur bittikten sonra dokunuş yazılamaz", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), { status: "pulse_reveal" });
    });
    await assertFails(
      setDoc(inputRef(asPlayer(), PLAYER_ID), { round: ROUND, pulse_click: Date.now() })
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

  // Lobideki telefonlar sayıyı artık bu alandan okuyor (lib/playerCount.ts).
  it("lobi sayacını (player_count) yalnızca host yazabilir", async () => {
    await assertSucceeds(updateDoc(doc(asHost(), "rooms", ROOM_ID), { player_count: 3 }));
    await assertFails(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { player_count: 99 }));
  });

  it("oda herkes tarafından okunabilir (telefonlar PIN ile bağlanıyor)", async () => {
    await assertSucceeds(getDoc(doc(asGuest(), "rooms", ROOM_ID)));
  });
});

describe("rooms — oda açma yalnızca personel hesabına açık", () => {
  // HostSetup'ın yazdığı oda dokümanının özü.
  const roomPayload = (hostUid: string) => ({
    code: "QWER",
    host_uid: hostUid,
    status: "night_lobby",
    active_game: "none",
    categories: [],
    timer_setting: 60,
    total_rounds: 3,
    current_round: 0,
    game_mode: "individual",
    created_at: Date.now(),
  });

  it("personel hesabı kendi adına oda açabilir", async () => {
    await seedStaff(HOST_UID);
    await assertSucceeds(setDoc(doc(asHost(), "rooms", "room-new"), roomPayload(HOST_UID)));
  });

  // Her anonim oturum host olabiliyordu: ödül ve kalıcı puan yazma yetkisi
  // "odanın host'u" üzerinden aktığı için oda açmak hepsinin kapısıydı.
  it("anonim oturum oda açamaz", async () => {
    await assertFails(setDoc(doc(asPlayer(), "rooms", "room-anon"), roomPayload(PLAYER_UID)));
  });

  it("personel başka bir hesap adına oda açamaz", async () => {
    await seedStaff(HOST_UID);
    await assertFails(setDoc(doc(asHost(), "rooms", "room-proxy"), roomPayload(PLAYER_UID)));
  });
});

describe("rooms/{id}/transient — emoji tepkileri", () => {
  beforeEach(() => seed({ status: "playing" }));

  const pulseRef = (db: ReturnType<typeof asPlayer>) =>
    doc(db, "rooms", ROOM_ID, "transient", "emojiPulse");

  // Bu alt koleksiyon için hiç kural yoktu: `match /rooms/{roomId}` alt
  // koleksiyonları kapsamaz, varsayılan ret her tepkiyi sessizce düşürüyordu.
  it("odadaki oyuncu emoji gönderebilir", async () => {
    await assertSucceeds(
      setDoc(pulseRef(asPlayer()), { emoji: "🔥", timestamp: Date.now(), player_id: PLAYER_ID })
    );
  });

  it("TV tepkiyi okuyabilir", async () => {
    await assertSucceeds(getDoc(pulseRef(asGuest())));
  });

  it("başka bir oyuncunun adına emoji gönderilemez", async () => {
    await assertFails(
      setDoc(pulseRef(asPlayer()), { emoji: "🔥", timestamp: Date.now(), player_id: OTHER_PLAYER_ID })
    );
  });

  it("odada olmayan biri emoji gönderemez", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "players", "player-elsewhere"), {
        room_id: "baska-oda",
        uid: PLAYER_UID,
        nickname: "GEZGIN",
        team_name: null,
        total_score: 0,
      });
    });
    await assertFails(
      setDoc(pulseRef(asPlayer()), { emoji: "🔥", timestamp: Date.now(), player_id: "player-elsewhere" })
    );
  });

  it("emoji yerine uzun metin ya da ek alan yazılamaz", async () => {
    await assertFails(
      setDoc(pulseRef(asPlayer()), { emoji: "X".repeat(64), timestamp: Date.now(), player_id: PLAYER_ID })
    );
    await assertFails(
      setDoc(pulseRef(asPlayer()), {
        emoji: "🔥",
        timestamp: Date.now(),
        player_id: PLAYER_ID,
        message: "TV'de reklam",
      })
    );
  });

  it("emojiPulse dışında bir transient dokümanı yazılamaz", async () => {
    await assertFails(
      setDoc(doc(asPlayer(), "rooms", ROOM_ID, "transient", "baska"), {
        emoji: "🔥",
        timestamp: Date.now(),
        player_id: PLAYER_ID,
      })
    );
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

  /** PlayerJoin'in gerçekte yazdığı katılım dokümanı. */
  const joinPayload = (overrides: Record<string, unknown> = {}) => ({
    ...playerJoinPayload({ roomId: ROOM_ID, uid: PLAYER_UID, nickname: "YENI", teamName: null }),
    ...overrides,
  });

  // Ödül kazananı total_score'a göre seçiliyor: puanlı katılım, ödül
  // kuralları ne kadar sıkı olursa olsun bedava kupon demek.
  it("oyuncu odaya puanla katılamaz", async () => {
    await assertFails(
      addDoc(collection(asPlayer(), "players"), joinPayload({ total_score: 9999 }))
    );
  });

  it("oyuncu odaya gece puanıyla katılamaz", async () => {
    await assertFails(
      addDoc(collection(asPlayer(), "players"), joinPayload({ night_score: 9999 }))
    );
  });

  it("katılım dokümanına beyaz liste dışı alan sokulamaz", async () => {
    await assertFails(
      addDoc(collection(asPlayer(), "players"), joinPayload({ lives: 99 }))
    );
    await assertFails(
      addDoc(collection(asPlayer(), "players"), joinPayload({ lifetime_credited: -5000 }))
    );
  });

  it("var olmayan bir odaya oyuncu oluşturulamaz", async () => {
    await assertFails(
      addDoc(collection(asPlayer(), "players"), joinPayload({ room_id: "yok-boyle-oda" }))
    );
  });

  it("bitmiş odaya katılınamaz", async () => {
    await seed({ status: "finished" });
    await assertFails(addDoc(collection(asPlayer(), "players"), joinPayload()));
  });

  // Oturum yeni açılmışken Firestore yazmayı tekrar gönderebiliyor
  // (PlayerJoin). Aynı veriyle ikinci yazma zararsız olmalı, hata değil.
  it("katılım yazmasının aynen tekrar gönderilmesi kabul edilir", async () => {
    const payload = playerJoinPayload({
      roomId: ROOM_ID,
      uid: PLAYER_UID,
      nickname: "YENI",
      teamName: null,
      now: 1_700_000_000_000,
    });
    await assertSucceeds(setDoc(doc(asPlayer(), "players", "player-retry"), payload));
    await assertSucceeds(setDoc(doc(asPlayer(), "players", "player-retry"), payload));
  });

  it("katılım tekrarı bahanesiyle puan yazılamaz", async () => {
    const payload = playerJoinPayload({ roomId: ROOM_ID, uid: PLAYER_UID, nickname: "YENI", teamName: null });
    await assertSucceeds(setDoc(doc(asPlayer(), "players", "player-retry2"), payload));
    await assertFails(
      setDoc(doc(asPlayer(), "players", "player-retry2"), { ...payload, total_score: 500 })
    );
  });

  it("TV'yi taşıracak uzunlukta takma ad reddedilir", async () => {
    await assertFails(
      addDoc(collection(asPlayer(), "players"), joinPayload({ nickname: "X".repeat(21) }))
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
    // /register herkese açık. Yetki sign_in_provider'a bakarken bu hesap
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

  /** lib/rewards.ts'in host ekranından yazdığı ödül dokümanı. */
  const grantPayload = (overrides: Record<string, unknown> = {}) => ({
    ...rewardPayload({
      roomId: ROOM_ID,
      uid: PLAYER_UID,
      nickname: "OYUNCU",
      code: "X9Y8Z7",
      venue: {
        reward_type: "drink",
        reward_title: "Ücretsiz Espresso",
        reward_description: "",
        reward_validity_days: 7,
      },
    }),
    ...overrides,
  });

  it("personel hesabıyla açılmış odanın host'u kazanan adına 'available' ödül oluşturabilir", async () => {
    await seed();
    await seedStaff(HOST_UID);
    await assertSucceeds(setDoc(doc(asHost(), "rewards", "reward-new"), grantPayload()));
  });

  // Asıl açık: create kuralı yalnızca status'a bakıyordu. Herhangi bir
  // anonim oturum konsoldan kendine kupon yazıp barda kodla kullanabiliyordu.
  it("oyuncu kendine kupon yazamaz — bedava içecek açığı", async () => {
    await seed();
    await assertFails(setDoc(doc(asPlayer(), "rewards", "reward-forged"), grantPayload()));
  });

  it("personel olmayan host ödül yazamaz", async () => {
    await seed();
    await assertFails(setDoc(doc(asHost(), "rewards", "reward-anon-host"), grantPayload()));
  });

  it("personel bile host'u olmadığı oda adına ödül yazamaz", async () => {
    await seed();
    await seedStaff();
    await assertFails(
      setDoc(doc(asVenueOwner(), "rewards", "reward-other-room"), grantPayload())
    );
  });

  it("oda bağı (room_id) olmadan ödül yazılamaz", async () => {
    await seed();
    await seedStaff(HOST_UID);
    const withoutRoom: Record<string, unknown> = grantPayload();
    delete withoutRoom.room_id;
    await assertFails(setDoc(doc(asHost(), "rewards", "reward-no-room"), withoutRoom));
  });

  it("ödül dokümanına şema dışı alan sokulamaz", async () => {
    await seed();
    await seedStaff(HOST_UID);
    await assertFails(
      setDoc(doc(asHost(), "rewards", "reward-extra"), grantPayload({ value_try: 5000 }))
    );
  });

  it("doğrudan 'claimed' durumunda bir ödül oluşturulamaz", async () => {
    await seed();
    await seedStaff(HOST_UID);
    await assertFails(
      setDoc(
        doc(asHost(), "rewards", "reward-fake-claimed"),
        grantPayload({ status: "claimed", claimed_at: Date.now(), code: "FAKE01" })
      )
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
    await seedStaff(HOST_UID);
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

  it("oyuncu skor güncellerken expires_at'i DEĞİŞTİREMİYOR — alan beyaz listede değil", async () => {
    await seed();
    await assertFails(
      updateDoc(doc(asPlayer(), "players", PLAYER_ID), {
        kablo_score: 1,
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
  /** useUserProfile'ın ilk girişte oluşturduğu profil. */
  const profilePayload = (overrides: Record<string, unknown> = {}) => ({
    ...profileCreatePayload({ phoneNumber: "+905551112233", nickname: "PLAYER_abcd" }),
    ...overrides,
  });

  async function seedProfile(uid: string = PLAYER_UID) {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users", uid), profilePayload({ total_lifetime_score: 450 }));
    });
  }

  // Profil telefon numarasını taşıyor; herkese açık okuma kayıtlı bütün
  // numaraların listelenebilmesi demekti (KVKK). Uygulamada başkasının
  // profilini okuyan bir ekran yok.
  it("kimse başkasının profilini okuyamaz — telefon numarası sızıntısı", async () => {
    await seedProfile();
    await assertFails(getDoc(doc(asGuest(), "users", PLAYER_UID)));
    await assertFails(getDoc(doc(asHost(), "users", PLAYER_UID)));
  });

  it("kullanıcı kendi profilini okuyabilir", async () => {
    await seedProfile();
    await assertSucceeds(getDoc(doc(asPlayer(), "users", PLAYER_UID)));
  });

  it("kullanıcı kendi profilini başlangıç değerleriyle oluşturabilir", async () => {
    await assertSucceeds(setDoc(doc(asPlayer(), "users", PLAYER_UID), profilePayload()));
  });

  it("profil yalnızca takma adla da oluşabilir (PlayerJoin'in merge yazımı)", async () => {
    await assertSucceeds(
      setDoc(doc(asPlayer(), "users", PLAYER_UID), { nickname: "YENI" }, { merge: true })
    );
  });

  it("profil puanla ya da üst ligle oluşturulamaz", async () => {
    await assertFails(
      setDoc(doc(asPlayer(), "users", PLAYER_UID), profilePayload({ total_lifetime_score: 99999 }))
    );
    await assertFails(
      setDoc(doc(asPlayer(), "users", PLAYER_UID), profilePayload({ current_league: "LEGEND" }))
    );
  });

  it("kullanıcı takma adını güncelleyebilir", async () => {
    await seedProfile();
    await assertSucceeds(
      setDoc(doc(asPlayer(), "users", PLAYER_UID), nicknamePayload("YENI_AD"), { merge: true })
    );
  });

  // Eskiden puanı oyuncunun kendi cihazı increment() ile yazıyordu ve kural
  // alan kısıtı koymuyordu: konsoldan tek satırla lig tablosunun tepesi.
  it("kullanıcı kendi kalıcı puanını artıramaz", async () => {
    await seedProfile();
    await assertFails(
      updateDoc(doc(asPlayer(), "users", PLAYER_UID), lifetimeCreditPayload(100000))
    );
  });

  it("kullanıcı kendi ligini değiştiremez", async () => {
    await seedProfile();
    await assertFails(
      updateDoc(doc(asPlayer(), "users", PLAYER_UID), { current_league: "LEGEND" })
    );
  });

  it("personel host oyun sonunda kalıcı puan ekleyebilir", async () => {
    await seedProfile();
    await seedStaff(HOST_UID);
    await assertSucceeds(
      updateDoc(doc(asHost(), "users", PLAYER_UID), lifetimeCreditPayload(120))
    );
  });

  it("personel olmayan host kalıcı puan yazamaz", async () => {
    await seedProfile();
    await assertFails(
      updateDoc(doc(asHost(), "users", PLAYER_UID), lifetimeCreditPayload(120))
    );
  });

  it("personel bile puan dışındaki profil alanlarını değiştiremez", async () => {
    await seedProfile();
    await seedStaff(HOST_UID);
    await assertFails(
      updateDoc(doc(asHost(), "users", PLAYER_UID), { nickname: "DEGISTI" })
    );
  });

  it("kullanıcı başka birinin profilini değiştiremez", async () => {
    await assertFails(
      setDoc(doc(asPlayer(), "users", STRANGER_UID), profilePayload({ nickname: "HACKED" }))
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


describe("ayna_survey — anonim salon anketi", () => {
  const SURVEY_ID = `${ROOM_ID}_${PLAYER_UID}`;
  const asStranger = () => testEnv.authenticatedContext(STRANGER_UID).firestore();
  const survey = (overrides: Record<string, unknown> = {}) => ({
    ...aynaSurveyPayload({
      roomId: ROOM_ID,
      hostUid: HOST_UID,
      playerId: PLAYER_ID,
      answers: { "salon-bilingual": true, "salon-morning": false },
    }),
    ...overrides,
  });

  beforeEach(() => seed({ status: "ayna_survey" }));

  it("oyuncu anket açıkken kendi cevabını gönderebilir", async () => {
    await assertSucceeds(setDoc(doc(asPlayer(), "ayna_survey", SURVEY_ID), survey()));
  });

  it("aynı oyuncu ikinci kez gönderemez — oy çoğaltma yok", async () => {
    await assertSucceeds(setDoc(doc(asPlayer(), "ayna_survey", SURVEY_ID), survey()));
    await assertFails(
      setDoc(doc(asPlayer(), "ayna_survey", SURVEY_ID), survey({ answers: { "salon-bilingual": false } }))
    );
  });

  it("anket kapandıktan sonra cevap gönderilemez", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), { status: "ayna_active" });
    });
    await assertFails(setDoc(doc(asPlayer(), "ayna_survey", SURVEY_ID), survey()));
  });

  it("başka bir hesabın belge kimliğiyle gönderilemez", async () => {
    await assertFails(setDoc(doc(asPlayer(), "ayna_survey", `${ROOM_ID}_${STRANGER_UID}`), survey()));
  });

  it("başka oyuncunun player_id'si ile gönderilemez", async () => {
    await assertFails(
      setDoc(doc(asPlayer(), "ayna_survey", SURVEY_ID), survey({ player_id: OTHER_PLAYER_ID }))
    );
  });

  it("host_uid sahte olamaz — okuma yetkisi ona dayanıyor", async () => {
    await assertFails(
      setDoc(doc(asPlayer(), "ayna_survey", SURVEY_ID), survey({ host_uid: PLAYER_UID }))
    );
  });

  it("şemaya ek alan sokulamaz", async () => {
    await assertFails(
      setDoc(doc(asPlayer(), "ayna_survey", SURVEY_ID), survey({ nickname: "OYUNCU" }))
    );
  });

  it("diğer misafirler kimin ne dediğini okuyamaz", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "ayna_survey", SURVEY_ID), survey());
    });
    await assertFails(getDoc(doc(asStranger(), "ayna_survey", SURVEY_ID)));
    await assertFails(getDoc(doc(asPlayer(), "ayna_survey", SURVEY_ID)));
  });

  it("host toplamı hesaplamak için cevapları okuyabilir", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "ayna_survey", SURVEY_ID), survey());
    });
    await assertSucceeds(getDoc(doc(asHost(), "ayna_survey", SURVEY_ID)));
  });

  it("host'un sayaç sorgusu (room_id + host_uid) kurallardan geçer", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "ayna_survey", SURVEY_ID), survey());
    });
    await assertSucceeds(
      getDocs(query(collection(asHost(), "ayna_survey"), where("room_id", "==", ROOM_ID), where("host_uid", "==", HOST_UID)))
    );
  });

  it("misafir odanın tüm anketini sorgulayamaz", async () => {
    await assertFails(getDocs(query(collection(asPlayer(), "ayna_survey"), where("room_id", "==", ROOM_ID))));
  });
});

/**
 * İstemci yazma sözleşmesi: src/lib/clientWrites.ts'teki her yazma, uygulamanın
 * gerçekte yazdığı veriyle, gerçek bağlamında kurallardan geçmeli. Buradaki
 * olumlu testler "testte geçiyor, canlıda reddediliyor" kalıbını kapatıyor;
 * src/lib/__tests__/writeContract.test.ts her fonksiyonun burada kullanıldığını
 * denetliyor.
 */
describe("istemci yazma sözleşmesi (clientWrites)", () => {
  const answerRef = (db: ReturnType<typeof asPlayer>) => collection(db, "answers");

  // Her cevap, istemcinin gerçekte yazdığı oda durumunda deneniyor.
  describe("cevaplar", () => {
    it("klasik tur cevabı", async () => {
      await seed({ status: "playing" });
      await assertSucceeds(
        addDoc(
          answerRef(asPlayer()),
          letterAnswerPayload({ roomId: ROOM_ID, playerId: PLAYER_ID, letter: "A", roundIndex: 1, data: { Şehir: "Ankara" } })
        )
      );
    });

    it("quiz cevabı", async () => {
      await seed({ status: "question_active" });
      await assertSucceeds(
        addDoc(answerRef(asPlayer()), quizAnswerPayload({ roomId: ROOM_ID, playerId: PLAYER_ID, questionIndex: 2, option: "B" }))
      );
    });

    it("kasa tahmini", async () => {
      await seed({ status: "vault_active" });
      await assertSucceeds(
        addDoc(answerRef(asPlayer()), vaultGuessPayload({ roomId: ROOM_ID, playerId: PLAYER_ID, guess: "1234" }))
      );
    });

    it("ayna tahmini", async () => {
      await seed({ status: "ayna_active" });
      await assertSucceeds(
        addDoc(
          answerRef(asPlayer()),
          aynaGuessPayload({ roomId: ROOM_ID, playerId: PLAYER_ID, roundKey: "ayna_0", roundIndex: 0, value: 42 })
        )
      );
    });
  });

  describe("canlılık sinyali", () => {
    beforeEach(() => seed());

    it("oyuncu kendi sinyalini yazabilir", async () => {
      await assertSucceeds(updateDoc(doc(asPlayer(), "players", PLAYER_ID), heartbeatPayload("last_active")));
    });

    it("host oda sinyalini yazabilir", async () => {
      await assertSucceeds(updateDoc(doc(asHost(), "rooms", ROOM_ID), heartbeatPayload("host_last_active")));
    });
  });

  describe("oda hamleleri", () => {
    it("bomba paslama", async () => {
      await seed({ status: "bomb_active", bomb_target_player: PLAYER_ID, used_words: [] });
      await assertSucceeds(
        updateDoc(doc(asPlayer(), "rooms", ROOM_ID), bombPassPayload(PLAYER_ID, OTHER_PLAYER_ID, "elma"))
      );
    });

    it("buzzer ve cevap", async () => {
      await seed({ status: "sensor_active", sensor_buzzer_player_id: null });
      await assertSucceeds(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), sensorBuzzPayload(PLAYER_ID)));
      await assertSucceeds(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), sensorAnswerPayload("  Kahve  ")));
    });

    it("overload savuşturma", async () => {
      await seed({ status: "playing", overload_target_id: PLAYER_ID });
      await assertSucceeds(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), overloadDeflectPayload(PLAYER_ID)));
    });

    it("emoji tepkisi", async () => {
      await seed({ status: "playing" });
      await assertSucceeds(
        setDoc(doc(asPlayer(), "rooms", ROOM_ID, "transient", "emojiPulse"), emojiPulsePayload("🔥", PLAYER_ID))
      );
    });
  });

  // Çark için hiç kural yoktu: sırası gelen oyuncunun "çevir" düğmesi her
  // seferinde reddediliyordu.
  describe("çark", () => {
    beforeEach(() => seed({ status: "wheel_active", wheel_spinner_id: PLAYER_ID, wheel_result_index: null }));

    it("sırası gelen oyuncu çarkı çevirebilir", async () => {
      await assertSucceeds(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), wheelSpinPayload(3)));
    });

    it("sırası gelmeyen oyuncu çeviremez", async () => {
      await assertFails(updateDoc(doc(asStranger(), "rooms", ROOM_ID), wheelSpinPayload(3)));
    });

    it("çark ikinci kez çevrilemez", async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), { wheel_result_index: 1 });
      });
      await assertFails(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), wheelSpinPayload(3)));
    });

    it("geçersiz dilim ya da ek alan yazılamaz", async () => {
      await assertFails(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), wheelSpinPayload(-1)));
      await assertFails(updateDoc(doc(asPlayer(), "rooms", ROOM_ID), wheelSpinPayload(1.5)));
      await assertFails(
        updateDoc(doc(asPlayer(), "rooms", ROOM_ID), { ...wheelSpinPayload(2), status: "finished" })
      );
    });
  });

  describe("giriş kayıtları", () => {
    const ROUND = 11;
    const myInput = (db: ReturnType<typeof asPlayer>) => doc(db, "rooms", ROOM_ID, "inputs", PLAYER_ID);

    it("echo oyu", async () => {
      await seed({ status: "echo_active", input_round: ROUND });
      await assertSucceeds(setDoc(myInput(asPlayer()), echoInputPayload(ROUND, OTHER_PLAYER_ID)));
    });

    it("pulse dokunuşu", async () => {
      await seed({ status: "pulse_active", input_round: ROUND });
      await assertSucceeds(setDoc(myInput(asPlayer()), pulseInputPayload(ROUND, Date.now())));
    });

    // Unity dokunuşları oda dokümanına yazılıyordu ve kural yoktu: her
    // dokunuş reddediliyordu.
    describe("unity", () => {
      beforeEach(() => seed({ status: "unity_active", input_round: ROUND }));

      it("oyuncu bu turdaki toplamını artırarak yazabilir", async () => {
        await assertSucceeds(setDoc(myInput(asPlayer()), unityInputPayload(ROUND, 12)));
        await assertSucceeds(setDoc(myInput(asPlayer()), unityInputPayload(ROUND, 12 + UNITY_MAX_STEP)));
      });

      it("bir yazmada sınırdan fazla artış reddedilir", async () => {
        await assertFails(setDoc(myInput(asPlayer()), unityInputPayload(ROUND, UNITY_MAX_STEP + 1)));
      });

      it("toplam geriye gidemez", async () => {
        await assertSucceeds(setDoc(myInput(asPlayer()), unityInputPayload(ROUND, 20)));
        await assertFails(setDoc(myInput(asPlayer()), unityInputPayload(ROUND, 5)));
      });

      it("başka oyuncunun kaydına ya da oyun bitince yazılamaz", async () => {
        await assertFails(
          setDoc(doc(asPlayer(), "rooms", ROOM_ID, "inputs", OTHER_PLAYER_ID), unityInputPayload(ROUND, 5))
        );
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
          await updateDoc(doc(ctx.firestore(), "rooms", ROOM_ID), { status: "unity_reveal" });
        });
        await assertFails(setDoc(myInput(asPlayer()), unityInputPayload(ROUND, 5)));
      });
    });
  });

  // Renk ve spektrum sayaçları sınırı aşınca reddediliyor, geri eklenip bir
  // dahaki sefere daha büyük olarak deneniyordu: sayaç bir daha yazılamıyordu.
  describe("oyuncu sayaçları", () => {
    beforeEach(() => seed({ status: "playing" }));

    for (const field of Object.keys(COUNTER_MAX_STEP) as PlayerCounter[]) {
      it(`${field}: tek yazmada sınıra kadar artabilir, fazlası reddedilir`, async () => {
        const max = COUNTER_MAX_STEP[field];
        await assertSucceeds(
          updateDoc(doc(asPlayer(), "players", PLAYER_ID), counterIncrementPayload(field, max))
        );
        await assertFails(
          updateDoc(doc(asPlayer(), "players", PLAYER_ID), counterIncrementPayload(field, max + 1))
        );
      });
    }
  });

  describe("host ve personel", () => {
    it("personel hesabı oda açar", async () => {
      await seedStaff(HOST_UID);
      await assertSucceeds(
        setDoc(
          doc(asHost(), "rooms", "room-contract"),
          roomCreatePayload({
            code: "ZXCV",
            hostUid: HOST_UID,
            locale: "tr",
            venue: { name: "Mekan", logo_url: undefined, primary_color: undefined },
          })
        )
      );
    });

    it("personel ödülü kullanıldı işaretler", async () => {
      await seedStaff();
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), "rewards", "r-contract"), {
          uid: PLAYER_UID,
          nickname: "OYUNCU",
          type: "drink",
          title: "Espresso",
          description: "",
          status: "available",
          code: "QWERTY",
          earned_at: Date.now(),
        });
      });
      await assertSucceeds(updateDoc(doc(asVenueOwner(), "rewards", "r-contract"), rewardClaimPayload()));
    });

    it("host oyuncunun aktarım işaretçisini yazar, oyuncu kendisininkini yazamaz", async () => {
      await seed();
      await assertSucceeds(updateDoc(doc(asHost(), "players", PLAYER_ID), lifetimeMarkerPayload(120)));
      await assertFails(updateDoc(doc(asPlayer(), "players", PLAYER_ID), lifetimeMarkerPayload(0)));
    });
  });
});
