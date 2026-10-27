import { test, expect, type Browser } from "@playwright/test";
import {
  closeAll,
  expectTvPlayerCount,
  joinFromQr,
  newPhone,
  openNight,
  realErrors,
  scanTvQr,
  startGameFromDashboard,
  type Phone,
} from "./support/cafe";
import { playQuiz, returnToNightLobby, skipHostTutorial, wrongOption } from "./support/games";
import { adminGet, adminQuery, adminUpdate, clearAuth, clearFirestore } from "./support/emulator";

/**
 * Katalogda açık olan her mod en az bir tur: HENGAME ARENA (klasik isim-şehir),
 * HENGAME QUIZ, HENGAME BOMB. YÖRÜNGE SAPANI kodda duruyor ama "BALD
 * VERFÜGBAR" kilitli; TV onu başlatmayı reddeder (son test). Sapanın tur
 * testi kilit açılınca yeniden etkinleştirilecek.
 */
test.beforeEach(async () => {
  await clearFirestore();
  await clearAuth();
});

async function night(browser: Browser, n: number) {
  const tv = await openNight(browser);
  const joinUrl = await scanTvQr(tv);
  const phones: Phone[] = [];
  for (let i = 0; i < n; i++) phones.push(await newPhone(browser, i, `SPIELER${i + 1}`));
  await Promise.all(phones.map((p) => joinFromQr(p, joinUrl)));
  await expectTvPlayerCount(tv.page, n);
  return { tv, phones };
}

const roomOf = (id: string) => adminGet(`rooms/${id}`);

test("HENGAME ARENA: bir tur oynanır, cevaplar puanlanır, podyumda kazanan", async ({ browser }) => {
  test.setTimeout(6 * 60_000);
  const { tv, phones } = await night(browser, 3);
  try {
    await startGameFromDashboard(tv.page, "ARENA", async (m) => {
      await m.getByRole("button", { name: "30 Sek" }).click();
      await m.getByRole("button", { name: "3 Runden" }).click();
    });
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 15_000 }).toMatch(/lobby|tutorial/);
    if ((await roomOf(tv.roomId))?.status === "tutorial") await skipHostTutorial(tv);
    await tv.page.getByRole("button", { name: /SPIEL STARTEN →/ }).click({ timeout: 30_000 });
    // Gecenin ilk klasik turunda host eğitimi araya girer.
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 30_000 }).not.toBe("lobby");
    if ((await roomOf(tv.roomId))?.status === "tutorial") await skipHostTutorial(tv);

    // Harf çarkı ve geri sayım kendiliğinden; telefonlarda kategori kutuları açılır.
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 60_000 }).toBe("playing");
    const letter = String((await roomOf(tv.roomId))?.active_letter ?? "");
    expect(letter, "turun harfi").toMatch(/^[A-ZÄÖÜ]$/);
    // SPIELER1 her kutuya harfle başlayan farklı bir kelime yazar, diğerleri boş bırakır.
    const inputs = phones[0].page.getByPlaceholder(`${letter}...`);
    await expect(inputs.first()).toBeVisible({ timeout: 20_000 });
    const count = await inputs.count();
    for (let i = 0; i < count; i++) await inputs.nth(i).fill(`${letter}${"abcdefghij"[i]}wort${i}`);
    // SPIELER2 parantezli bir cevap yazar: eskiden host'un puanlaması bu
    // girdide istisna fırlatıp turu hiç puanlamıyordu (bulgu B15).
    await phones[1].page.getByPlaceholder(`${letter}...`).first().fill("(Berlin)");

    // Süre dolunca cevaplar gönderilir, TV değerlendirmeye geçer.
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 90_000 }).toBe("review");
    await expect.poll(async () => (await adminQuery("answers", "room_id", tv.roomId)).length, { timeout: 20_000 }).toBeGreaterThanOrEqual(1);
    await expect.poll(async () => Number((await adminGet(`players/${phones[0].playerId}`))?.total_score), { timeout: 30_000 }).toBeGreaterThan(0);

    // Host oyunu erken bitirir → podyum, kazanan SPIELER1.
    tv.page.once("dialog", (d) => d.accept());
    await tv.page.getByRole("button", { name: "VORZEITIG BEENDEN" }).click();
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 20_000 }).toBe("finished");
    await expect(tv.page.getByText("SPIELER1").first()).toBeVisible();
    for (const p of [tv, ...phones]) expect(realErrors(p), p.page.url()).toEqual([]);
  } finally {
    await closeAll(tv, ...phones);
  }
});

test("HENGAME BOMB gecenin ilk oyunu: bomba paslanır, patlar, sonraki tura geçilir", async ({ browser }) => {
  test.setTimeout(4 * 60_000);
  const { tv, phones } = await night(browser, 3);
  try {
    await startGameFromDashboard(tv.page, "BOMB");
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 15_000 }).toBe("tutorial");
    await skipHostTutorial(tv);
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 30_000 }).toBe("bomb_active");

    // Bombayı tutan telefon bir kelime yazıp atar.
    const holderId = String((await roomOf(tv.roomId))?.bomb_target_player);
    const holder = phones.find((p) => p.playerId === holderId)!;
    expect(holder, "bomba bir telefonda").toBeTruthy();
    await expect(holder.page.getByText("DU HAST DIE BOMBE!")).toBeVisible();
    await holder.page.getByPlaceholder("WORT EINGEBEN").fill("Apfelbaum");
    await holder.page.getByRole("button", { name: /BOMBE WERFEN/ }).click();
    await expect.poll(async () => (await roomOf(tv.roomId))?.used_words, { timeout: 10_000 }).toContain("Apfelbaum");
    const victimId = String((await roomOf(tv.roomId))?.bomb_target_player);
    expect(victimId).not.toBe(holderId);

    // Kimse paslamaz: fitil yanar, bomba patlar, sahibi TEK can kaybeder.
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 40_000 }).toBe("bomb_explosion");
    const victimNow = String((await roomOf(tv.roomId))?.bomb_target_player);
    // expect.soft: çift can kaybı ayrı bir bulgu (B2); tur geçişini de görmek istiyoruz.
    await expect
      .soft(async () => expect(Number((await adminGet(`players/${victimNow}`))?.lives)).toBe(2))
      .toPass({ timeout: 10_000 });

    // Patlama ekranı ~6 sn sonra sonraki tura geçmeli.
    await expect
      .poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 20_000, message: "TV patlama ekranında kaldı" })
      .toMatch(/bomb_intro|bomb_active/);
    expect(Number((await roomOf(tv.roomId))?.current_round)).toBe(2);
    expect(realErrors(tv)).toEqual([]);
  } finally {
    await closeAll(tv, ...phones);
  }
});

test("aynı gece ikinci quiz: eski cevaplar yeni oyunu bozmaz", async ({ browser }) => {
  test.setTimeout(8 * 60_000);
  const { tv, phones } = await night(browser, 3);
  try {
    const opts = async (m: import("@playwright/test").Page) => {
      await m.getByRole("button", { name: "5 Fragen" }).click();
      await m.getByRole("button", { name: "15 Sek" }).click();
    };
    await startGameFromDashboard(tv.page, "QUIZ", opts);
    await playQuiz(tv, phones, 5, (_p, _q, correct) => correct);
    await expect(tv.page.getByText("HENGAME CHAMPION")).toBeVisible({ timeout: 30_000 });
    await returnToNightLobby(tv);

    // İkinci quiz: önceki oyunun cevapları, skoru ve tur sayacı taşınmamalı.
    // Bu kez SPIELER2 hep doğru, SPIELER1 hep yanlış: kazanan SPIELER2 olmalı.
    await startGameFromDashboard(tv.page, "QUIZ", opts);
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 20_000 }).toMatch(/quiz_intro|question_intro|tutorial/);
    // Sıfırlama TV'yi bekletmeden arka planda sunucuya gidiyor.
    await expect.poll(async () => (await adminQuery("answers", "room_id", tv.roomId)).length, { message: "eski cevaplar silinmeli" }).toBe(0);
    for (const p of phones) {
      await expect.poll(async () => Number((await adminGet(`players/${p.playerId}`))?.total_score), { message: "oyun skoru sıfırlanmalı" }).toBe(0);
    }
    expect(Number((await roomOf(tv.roomId))?.current_round), "tur sayacı sıfırlanmalı (yoksa 1. soru final ×2 sayılır)").toBe(0);

    // playQuiz, ilk telefonun cevabının TV sayacında "1 / 3" olarak görünmesini
    // bekliyor: eski cevaplar sayılsaydı soru anında kapanırdı.
    await playQuiz(tv, phones, 5, (p, q, correct) => (p === 1 ? correct : wrongOption(correct, p + q)));
    await expect(tv.page.getByText("HENGAME CHAMPION")).toBeVisible({ timeout: 30_000 });
    const scores = Object.fromEntries(
      await Promise.all(phones.map(async (p) => [p.nickname, Number((await adminGet(`players/${p.playerId}`))?.total_score)])),
    );
    expect(scores.SPIELER1, "hep yanlış cevap veren bu oyunda 0 puan").toBe(0);
    expect(scores.SPIELER2).toBeGreaterThan(scores.SPIELER3);
    // Gecelik lig: 1. oyunda herkes eşit (hep doğru), 2. oyunu SPIELER2 kazandı.
    // Gecelik puan oyun bitişinde arka planda transaction'la yazılıyor
    // (lib/nightAwards); TV'nin "finished" ve "night_lobby" yazımları aynı oda
    // belgesine düştüğü için transaction yeniden denenebiliyor. TV lobiye
    // dönmüş olsa da puan sunucuya henüz ulaşmamış olabilir: bekle.
    await returnToNightLobby(tv);
    const nightLead = async () => {
      const night = Object.fromEntries(
        await Promise.all(phones.map(async (p) => [p.nickname, Number((await adminGet(`players/${p.playerId}`))?.night_score)])),
      );
      return night.SPIELER2 - night.SPIELER1;
    };
    await expect.poll(nightLead, { timeout: 30_000, message: "2. oyunu kazanan SPIELER2 gecelik ligde öne geçmeli" }).toBeGreaterThan(0);
  } finally {
    await closeAll(tv, ...phones);
  }
});

// Kilitli (gameCatalog: isComingSoon). Kilidi açarken bu testi de açın.
test.skip("YÖRÜNGE SAPANI: telefonun şutu TV'ye ulaşır, sonuçlanır, gol puanlanır, gecelik puan dağıtılır", async ({ browser }) => {
  test.setTimeout(4 * 60_000);
  const { tv, phones } = await night(browser, 2);
  try {
    await startGameFromDashboard(tv.page, "YÖRÜNGE SAPANI");
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 30_000 }).toBe("slingshot_active");
    const roundKey = `slingshot-${(await roomOf(tv.roomId))?.slingshot_end_time}`;

    // SPIELER1 sapanı ortadan aşağı çekip bırakır.
    const pad = phones[0].page.locator(".cursor-grab");
    await expect(pad).toBeVisible({ timeout: 20_000 });
    const box = (await pad.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height * 0.4;
    await phones[0].page.mouse.move(x, y);
    await phones[0].page.mouse.down();
    await phones[0].page.mouse.move(x, y + 140, { steps: 8 });
    await phones[0].page.mouse.up();
    // Eskiden şut oyuncu belgesine yazılıyor, kural reddediyordu.
    await expect(phones[0].page.getByText("Ball wird geladen…")).toBeVisible();
    await expect
      .poll(async () => (await adminQuery("answers", "room_id", tv.roomId)).filter((a) => a.round_letter === roundKey).length, { timeout: 15_000 })
      .toBe(1);

    // TV şutu fırlatır ve sonucunu gösterir; gol olduysa puan yazılır.
    const result = tv.page.getByText(/^(TOOOOOR! ⚽|GEHALTEN! 🧤|AN DEN PFOSTEN! 💥|DANEBEN 💨)$/);
    await expect(result).toBeVisible({ timeout: 15_000 });
    const goal = (await result.textContent())?.startsWith("TOOOOOR") ?? false;
    await expect
      .poll(async () => Number((await adminGet(`players/${phones[0].playerId}`))?.total_score ?? 0), { timeout: 15_000 })
      .toBe(goal ? 100 : 0);

    // Süreyi bitir: sonuç ekranı ve gecelik lig puanı (katılım puanı dahil).
    await adminUpdate(`rooms/${tv.roomId}`, { slingshot_end_time: Date.now() - 1_000 });
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 30_000 }).toBe("slingshot_reveal");
    await expect.poll(async () => (await roomOf(tv.roomId))?.night_awarded, { timeout: 15_000 }).toBe(true);
    for (const p of phones) {
      await expect.poll(async () => Number((await adminGet(`players/${p.playerId}`))?.night_score ?? 0), { timeout: 15_000 }).toBeGreaterThan(0);
    }
    for (const p of [tv, ...phones]) expect(realErrors(p), p.page.url()).toEqual([]);
  } finally {
    await closeAll(tv, ...phones);
  }
});

test("kilitli mod (BALD VERFÜGBAR) TV'den başlatılamaz; karuselde yalnız 3 oynanabilir mod var", async ({ browser }) => {
  const tv = await openNight(browser);
  try {
    // Karusel noktaları: üç oynanabilir mod, sonda tek kilitli mod.
    for (const name of ["HENGAME ARENA", "HENGAME QUIZ", "HENGAME BOMB"]) {
      await expect(tv.page.getByRole("button", { name, exact: true })).toHaveCount(1);
    }
    const locked = tv.page.getByRole("button", { name: /\(Locked\)$/ });
    await expect(locked).toHaveCount(1);
    await expect(locked).toHaveAccessibleName("YÖRÜNGE SAPANI (Locked)");
    await locked.first().click();
    await expect(tv.page.getByRole("button", { name: "SPIEL STARTEN" })).toHaveCount(0);
    expect((await roomOf(tv.roomId))?.status).toBe("night_lobby");
  } finally {
    await closeAll(tv);
  }
});
