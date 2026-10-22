import { test, expect } from "@playwright/test";
import {
  closeAll,
  expectTvPlayerCount,
  joinFromQr,
  newPhone,
  openNight,
  knownErrors,
  realErrors,
  scanTvQr,
  startGameFromDashboard,
  type Phone,
} from "./support/cafe";
import { playQuiz, returnToNightLobby, wrongOption } from "./support/games";
import { adminGet, adminQuery, clearAuth, clearFirestore } from "./support/emulator";
import { recordMetric, trace } from "./support/metrics";

/**
 * Gerçek bir kafe gecesinin omurgası: TV gece lobisini açar, misafirler
 * TV'deki QR'ı telefonla okutup katılır, quiz oynanır, skor ve kazanan
 * TV'ye yansır, gece lobisine dönülür ve misafirler QR'ı yeniden
 * okutmadan bir sonraki oyuna aynı profille geçer.
 *
 * Telefon sayısı: E2E_PHONES (varsayılan 10, CI'da 8, yerel tam tur 30).
 */
const PHONES = Number(process.env.E2E_PHONES ?? 10);
const QUESTIONS = 5;

test.beforeEach(async () => {
  await clearFirestore();
  await clearAuth();
});

test("kafe gecesi: QR → lobi → quiz → kazanan TV'de → lobiye dönüş → aynı profille yeni oyun", async ({ browser }) => {
  test.setTimeout(Number(process.env.E2E_TEST_TIMEOUT ?? 10 * 60_000));
  const tv = await openNight(browser);
  const phones: Phone[] = [];
  try {
    trace("1) QR");
    // 1) TV'deki QR'ı ekrandan okut.
    const joinUrl = await scanTvQr(tv);

    trace("2) katılım");
    // 2) Misafirler gruplar hâlinde gelir (kafede herkes aynı saniyede okutmaz).
    for (let i = 0; i < PHONES; i++) phones.push(await newPhone(browser, i, `GAST${String(i + 1).padStart(2, "0")}`));
    const BATCH = 5;
    for (let i = 0; i < phones.length; i += BATCH) {
      await Promise.all(phones.slice(i, i + BATCH).map((p) => joinFromQr(p, joinUrl)));
    }
    await expectTvPlayerCount(tv.page, PHONES);
    for (const p of phones) await expect(p.page.getByText("Du bist dabei!")).toBeVisible();

    // Firestore: her telefon tam bir kayıt açtı, doğru odada, skor 0.
    const players = await adminQuery("players", "room_id", tv.roomId);
    expect(players).toHaveLength(PHONES);
    for (const p of players) {
      expect(p.total_score).toBe(0);
      expect(phones.map((ph) => ph.playerId)).toContain(p._id);
    }

    trace("3) quiz");
    // 3) Quiz: 5 soru, 15 sn. GAST01 hep doğru, diğerleri karışık.
    await startGameFromDashboard(tv.page, "QUIZ", async (modal) => {
      await modal.getByRole("button", { name: "5 Fragen" }).click();
      await modal.getByRole("button", { name: "15 Sek" }).click();
    });
    const quiz = await playQuiz(tv, phones, QUESTIONS, (p, q, correct) =>
      p === 0 || (p + q) % 3 === 0 ? correct : wrongOption(correct, p + q),
    );
    recordMetric("quiz.answerLatencyMs", quiz.answerLatencyMs);
    recordMetric("quiz.burstLatencyMs", quiz.burstLatencyMs);

    trace("4) kazanan");
    // 4) Kazanan TV'de: şampiyon ekranında GAST01.
    await expect(tv.page.getByText("HENGAME CHAMPION")).toBeVisible({ timeout: 30_000 });
    await expect(tv.page.getByText("GAST01").first()).toBeVisible();
    await expect.poll(async () => (await adminGet(`rooms/${tv.roomId}`))?.status).toBe("finished");
    const scored = await adminQuery("players", "room_id", tv.roomId);
    const top = [...scored].sort((a, b) => Number(b.total_score) - Number(a.total_score))[0];
    expect(top.nickname).toBe("GAST01");
    // Telefonda da oyun bitti ve kendi puanı görünüyor.
    await expect(phones[0].page.getByText("SPIEL VORBEI")).toBeVisible();

    trace("5) lobiye dönüş");
    // 5) Gece lobisine dönüş: TV'de gecenin lideri GAST01 (F1: 25 puan).
    await returnToNightLobby(tv);
    await expect.poll(async () => Number((await adminGet(`players/${phones[0].playerId}`))?.night_score)).toBe(25);
    await expect(tv.page.getByText("GAST01").first()).toBeVisible();

    trace("6) aynı profil");
    // 6) QR'ı yeniden okutmadan: telefonlar aynı sayfada, aynı oyuncu kaydıyla lobide.
    for (const p of phones) {
      await expect(p.page).toHaveURL(/\/play/);
      await expect(p.page.getByText("Du bist dabei!")).toBeVisible();
      expect(await p.page.evaluate(() => localStorage.getItem("cafe_game_playerId"))).toBe(p.playerId);
    }

    trace("7) arena");
    // 7) Sonraki oyun (Arena — klasik): telefonlar kendiliğinden oyuna geçer.
    await startGameFromDashboard(tv.page, "ARENA");
    await expect.poll(async () => (await adminGet(`rooms/${tv.roomId}`))?.active_game).toBe("scattegories");
    for (const p of phones.slice(0, 3)) {
      await expect(p.page.getByText(/KAYDIN BULUNAMADI|DEIN EINTRAG/)).toHaveCount(0);
    }
    const after = await adminQuery("players", "room_id", tv.roomId);
    expect(after, "oyun değişince yeni oyuncu kaydı açılmamalı").toHaveLength(PHONES);

    // Telefonlarda yakalanmamış hata yok.
    for (const p of [tv, ...phones]) expect(realErrors(p), p.page.url()).toEqual([]);
    recordMetric("knownConsoleErrors", [...new Set([tv, ...phones].flatMap(knownErrors))]);
    // Hiçbir istek dışarı (üretim Firebase, TTS, CDN) gitmedi ya da engellendi.
    recordMetric("blockedExternalRequests", [tv, ...phones].flatMap((t) => t.blocked));
  } finally {
    await closeAll(tv, ...phones);
  }
});
