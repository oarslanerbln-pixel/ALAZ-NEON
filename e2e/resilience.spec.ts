import { test, expect, type CDPSession } from "@playwright/test";
import {
  closeAll,
  expectTvPlayerCount,
  joinFromQr,
  newPhone,
  openNight,
  scanTvQr,
  startGameFromDashboard,
  type Phone,
  type Tv,
} from "./support/cafe";
import { quizAnswerKey, skipHostTutorial, tapOption, waitForReveal, wrongOption } from "./support/games";
import { adminGet, adminQuery, clearAuth, clearFirestore } from "./support/emulator";

/**
 * Kafede olan şeyler: wifi kopar, misafir sayfayı yeniler, biri geç gelir,
 * iki kişi aynı takma adı yazar, telefon cebe girip kilitlenir.
 * Her test 4 telefonla kısa bir quiz (5 soru, 30 sn) üzerinde koşar.
 */
test.beforeEach(async () => {
  await clearFirestore();
  await clearAuth();
});

async function nightWithPhones(browser: import("@playwright/test").Browser, names: string[]) {
  const tv = await openNight(browser);
  const joinUrl = await scanTvQr(tv);
  const phones: Phone[] = [];
  for (const [i, n] of names.entries()) phones.push(await newPhone(browser, i, n));
  await Promise.all(phones.map((p) => joinFromQr(p, joinUrl)));
  await expectTvPlayerCount(tv.page, names.length);
  return { tv, phones, joinUrl };
}

async function startQuiz(tv: Tv) {
  await startGameFromDashboard(tv.page, "QUIZ", async (m) => {
    await m.getByRole("button", { name: "5 Fragen" }).click();
    await m.getByRole("button", { name: "30 Sek" }).click();
  });
  await expect.poll(async () => (await adminGet(`rooms/${tv.roomId}`))?.status, { timeout: 15_000 }).toMatch(/tutorial|quiz_intro|question_intro/);
  if ((await adminGet(`rooms/${tv.roomId}`))?.status === "tutorial") await skipHostTutorial(tv);
}

async function openQuestion(tv: Tv) {
  await tv.page.getByRole("button", { name: "TIMER STARTEN" }).click({ timeout: 60_000 });
}

async function answersFor(roomId: string, q: number) {
  return (await adminQuery("answers", "room_id", roomId)).filter((a) => a.round_letter === String(q));
}

test("wifi kopar: çevrimdışı verilen cevap bağlantı gelince TV'ye ulaşır", async ({ browser }) => {
  const { tv, phones } = await nightWithPhones(browser, ["ANNA", "BEN", "CEM", "DENIZ"]);
  try {
    await startQuiz(tv);
    await openQuestion(tv);
    const key = await quizAnswerKey(tv.roomId);
    const [anna, ...rest] = phones;
    await expect(anna.page.getByTestId("quiz-option-A")).toBeEnabled();
    await anna.context.setOffline(true);
    await anna.page.getByTestId(`quiz-option-${key[0]}`).click();
    await expect(anna.page.getByText("ANTWORT GESPEICHERT 🔒")).toBeVisible();
    await anna.page.waitForTimeout(3_000);
    expect((await answersFor(tv.roomId, 0)).length, "çevrimdışıyken sunucuya gitmemeli").toBe(0);
    await anna.context.setOffline(false);
    await expect.poll(async () => (await answersFor(tv.roomId, 0)).length, { timeout: 20_000 }).toBe(1);
    await expect(tv.page.getByText("1 / 4 SPIELER BEREIT")).toBeVisible({ timeout: 20_000 });
    await Promise.all(rest.map((p, i) => tapOption(p, wrongOption(key[0], i))));
    await waitForReveal(tv, 0);
    await expect.poll(async () => Number((await adminGet(`players/${anna.playerId}`))?.total_score)).toBeGreaterThan(0);
  } finally {
    await closeAll(tv, ...phones);
  }
});

test("sayfa yenileme: misafir aynı kayda döner ve cevap verebilir", async ({ browser }) => {
  const { tv, phones } = await nightWithPhones(browser, ["ANNA", "BEN", "CEM", "DENIZ"]);
  try {
    await startQuiz(tv);
    await openQuestion(tv);
    const ben = phones[1];
    await ben.page.reload();
    await expect(ben.page).toHaveURL(/\/play/);
    expect(await ben.page.evaluate(() => localStorage.getItem("cafe_game_playerId"))).toBe(ben.playerId);
    const key = await quizAnswerKey(tv.roomId);
    await Promise.all(phones.map((p) => tapOption(p, key[0])));
    await waitForReveal(tv, 0);
    expect(await adminQuery("players", "room_id", tv.roomId)).toHaveLength(4);
  } finally {
    await closeAll(tv, ...phones);
  }
});

test("geç katılan misafir: oyun sürerken QR'dan girer, sıradaki soruya katılır", async ({ browser }) => {
  const { tv, phones, joinUrl } = await nightWithPhones(browser, ["ANNA", "BEN", "CEM"]);
  const late = await newPhone(browser, 7, "SPAET");
  try {
    await startQuiz(tv);
    await openQuestion(tv);
    const key = await quizAnswerKey(tv.roomId);
    await joinFromQr(late, joinUrl);
    await Promise.all(phones.map((p) => tapOption(p, key[0])));
    // Geç gelen ilk soruyu kaçırdı: sayaç 3/4'te kalır, host süreyi bitirir.
    await tv.page.getByRole("button", { name: "TIMER BEENDEN" }).click({ timeout: 30_000 }).catch(() => undefined);
    await waitForReveal(tv, 0);
    await tv.page.getByRole("button", { name: "RANGLISTE ANZEIGEN" }).click({ timeout: 40_000 });
    await tv.page.getByRole("button", { name: "NÄCHSTE FRAGE →" }).click();
    await openQuestion(tv);
    await tapOption(late, key[1]);
    await expect.poll(async () => (await answersFor(tv.roomId, 1)).map((a) => a.player_id)).toContain(late.playerId);
    expect(await adminQuery("players", "room_id", tv.roomId)).toHaveLength(4);
  } finally {
    await closeAll(tv, ...phones, late);
  }
});

test("aynı takma ad: iki misafir de oynar, kayıtlar ve puanlar karışmaz", async ({ browser }) => {
  const { tv, phones } = await nightWithPhones(browser, ["AYSE", "AYSE", "MAX"]);
  try {
    const players = await adminQuery("players", "room_id", tv.roomId);
    const ayses = players.filter((p) => p.nickname === "AYSE");
    expect(ayses).toHaveLength(2);
    expect(new Set(ayses.map((p) => p._id)).size).toBe(2);
    await startQuiz(tv);
    await openQuestion(tv);
    const key = await quizAnswerKey(tv.roomId);
    await tapOption(phones[0], key[0]);
    await tapOption(phones[1], wrongOption(key[0], 1));
    await tapOption(phones[2], wrongOption(key[0], 2));
    await waitForReveal(tv, 0);
    await tv.page.getByRole("button", { name: "RANGLISTE ANZEIGEN" }).click({ timeout: 30_000 });
    await expect.poll(async () => Number((await adminGet(`players/${phones[0].playerId}`))?.total_score)).toBeGreaterThan(0);
    expect(Number((await adminGet(`players/${phones[1].playerId}`))?.total_score)).toBe(0);
  } finally {
    await closeAll(tv, ...phones);
  }
});

/**
 * Telefonu kilitle: sayfa gizlenir ve dondurulur (JS ve zamanlayıcılar durur).
 * iOS/Android kilitli ekranda bağlantıyı da bir süre sonra keser; açılınca
 * Firestore yeniden bağlanır ve aradaki durumları değil yalnızca SON durumu
 * tek bir snapshot olarak teslim eder. Bunu çevrimdışı ile taklit ediyoruz.
 */
async function lockPhone(phone: Phone): Promise<CDPSession> {
  const cdp = await phone.context.newCDPSession(phone.page);
  await phone.context.setOffline(true);
  await phone.page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await cdp.send("Page.setWebLifecycleState", { state: "frozen" });
  return cdp;
}

async function unlockPhone(phone: Phone, cdp: CDPSession): Promise<void> {
  await cdp.send("Page.setWebLifecycleState", { state: "active" });
  await phone.context.setOffline(false);
  await phone.page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

test("telefon kilitlenip açılır: soru değişmişse yeni soruya cevap verebilir", async ({ browser }) => {
  const { tv, phones } = await nightWithPhones(browser, ["ANNA", "BEN", "CEM"]);
  try {
    await startQuiz(tv);
    await openQuestion(tv);
    const key = await quizAnswerKey(tv.roomId);
    const [anna, ...rest] = phones;
    // 1. soruyu cevapla; cevap sunucuya ulaşınca cebe koy (kilitle).
    await tapOption(anna, key[0]);
    await expect.poll(async () => (await answersFor(tv.roomId, 0)).map((a) => a.player_id)).toContain(anna.playerId);
    const cdp = await lockPhone(anna);
    await Promise.all(rest.map((p) => tapOption(p, key[0])));
    await waitForReveal(tv, 0);
    await tv.page.getByRole("button", { name: "RANGLISTE ANZEIGEN" }).click({ timeout: 30_000 });
    await tv.page.getByRole("button", { name: "NÄCHSTE FRAGE →" }).click();
    await openQuestion(tv);
    // 2. soru açıkken telefonu aç.
    await unlockPhone(anna, cdp);
    await expect(anna.page.getByTestId("quiz-option-A"), "yeni soruda şıklar açık olmalı").toBeEnabled({ timeout: 15_000 });
    await tapOption(anna, key[1]);
    await expect.poll(async () => (await answersFor(tv.roomId, 1)).map((a) => a.player_id)).toContain(anna.playerId);
  } finally {
    await closeAll(tv, ...phones);
  }
});
