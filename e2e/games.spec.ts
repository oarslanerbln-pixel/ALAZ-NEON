import { expect, test } from "@playwright/test";

import {
  expectBackInLobby,
  openTable,
  player,
  returnToLobbyFromHeader,
  room,
  skipTutorial,
  startGame,
  tapRepeatedly,
  waitForStatus,
} from "./support/games";
import { queryDocs, readDoc } from "./support/emulator";
import { t } from "./support/i18n";
import { freshStart } from "./support/night";

test.beforeEach(freshStart);

/**
 * Oyun başına duman testleri (docs/roadmap.md, 2.1): her mod TV panosundan
 * başlar, telefonlarda kendi kumandası açılır, bir turu oynanır ve TV
 * lobiye döner. Echo, quiz ve klasik oyun kendi dosyalarında.
 */

test("bomba: hedef oyuncu kelimeyi yazıp bombayı fırlatır", async ({ browser }) => {
  const table = await openTable(browser);
  await startGame(table.host, "HENGAME BOMB");
  await skipTutorial(table.host, table.roomId);
  await waitForStatus(table.roomId, "bomb_active");

  const target = String((await room(table.roomId)).bomb_target_player);
  const phone = table.phoneOf(target);
  await phone.getByPlaceholder(t("bomb.wordPlaceholder")).fill("kaplan");
  await phone.getByRole("button", { name: new RegExp(t("bomb.throwBomb")) }).click();

  await expect.poll(async () => (await room(table.roomId)).bomb_target_player).not.toBe(target);
  expect((await room(table.roomId)).used_words).toContain("kaplan");

  await table.host.getByRole("button", { name: t("hostHeader.endEarly") }).click();
  await waitForStatus(table.roomId, "finished");
  await returnToLobbyFromHeader(table);
});

test("sensör: buzzer'a basan doğru cevapla ayardaki 1000 puanı alır", async ({ browser }) => {
  const table = await openTable(browser);
  const [alfa] = table.phones;
  await startGame(table.host, "HENGAME SENSÖR");
  await waitForStatus(table.roomId, "sensor_intro");

  await table.host.getByRole("button", { name: new RegExp(t("sensor.openImage")) }).click();
  await waitForStatus(table.roomId, "sensor_active");
  await alfa.getByRole("button", { name: /BUZZER!/ }).click();
  await expect.poll(async () => (await room(table.roomId)).sensor_buzzer_player_id).toBe(table.playerIds[0]);

  const answer = String((await room(table.roomId)).sensor_media_answer);
  await alfa.getByLabel(t("sensor.writeAndSend")).fill(answer);
  await alfa.getByRole("button", { name: t("sensor.send") }).click();
  await expect.poll(async () => (await room(table.roomId)).sensor_player_answer).toBeTruthy();

  await table.host.getByRole("button", { name: new RegExp(t("sensor.correct")) }).click();
  await waitForStatus(table.roomId, "sensor_reveal");
  expect((await player(table.playerIds[0])).total_score).toBe(1000);

  await table.host.getByRole("button", { name: t("hostHeader.endEarly") }).click();
  await waitForStatus(table.roomId, "finished");
  await returnToLobbyFromHeader(table);
});

test("çark: TV çeviren oyuncuyu seçer, telefon çarkı çevirir", async ({ browser }) => {
  const table = await openTable(browser);
  await startGame(table.host, "HENGAME ÇARK");
  await waitForStatus(table.roomId, "wheel_active");

  await table.host.getByRole("button", { name: new RegExp(t("wheel.pickRandom")) }).click();
  await expect.poll(async () => (await room(table.roomId)).wheel_spinner_id).toBeTruthy();
  const spinner = table.phoneOf(String((await room(table.roomId)).wheel_spinner_id));

  await spinner.getByRole("button", { name: new RegExp(t("wheel.spin")) }).click();
  await waitForStatus(table.roomId, "wheel_result");
  await expect(spinner.getByText(t("wheel.prizeWonColon"))).toBeVisible();

  await returnToLobbyFromHeader(table);
});

test("overload: hedef yükü savuşturur, savuşturamayan elenir", async ({ browser }) => {
  const table = await openTable(browser);
  await startGame(table.host, "NEON OVERLOAD");
  await waitForStatus(table.roomId, "playing");

  const firstTarget = async () => {
    const id = (await room(table.roomId)).overload_target_id;
    return typeof id === "string" && id !== "passing" ? id : null;
  };
  await expect.poll(firstTarget).toBeTruthy();
  const survivor = (await firstTarget())!;
  await table.phoneOf(survivor).getByRole("button", { name: new RegExp(t("overload.deflect")) }).click();

  // Yük öbür oyuncuya geçti; o savuşturmayınca süre dolar ve elenir.
  const loser = table.playerIds.find((id) => id !== survivor)!;
  await waitForStatus(table.roomId, "finished", 45_000);
  expect((await room(table.roomId)).overload_eliminated_ids).toEqual([loser]);
  await expect(table.phoneOf(survivor).getByText(t("overload.champion"))).toBeVisible();

  await returnToLobbyFromHeader(table);
});

test("pulse: telefonların dokunuşları sonuçta toplanır", async ({ browser }) => {
  const table = await openTable(browser);
  await startGame(table.host, "NEON PULSE");
  await waitForStatus(table.roomId, "pulse_active");

  for (const phone of table.phones) {
    await phone.getByRole("button", { name: "PULSE" }).click();
  }
  await waitForStatus(table.roomId, "pulse_reveal");
  expect(Object.keys((await room(table.roomId)).pulse_clicks as object)).toHaveLength(2);
  for (const phone of table.phones) {
    await expect(phone.getByText(t("pulse.yourResult"))).toBeVisible();
  }

  await table.host.getByRole("button", { name: t("common.back") }).click();
  await expectBackInLobby(table);
});

test("renk savaşları: bir takım hedefe ulaşınca oyun biter", async ({ browser }) => {
  const table = await openTable(browser);
  const [alfa] = table.phones;
  await startGame(table.host, "NEON SAVAŞLARI");
  await waitForStatus(table.roomId, "colors_intro");

  // Panodan başlatılan oyun takımları dengeler: iki oyuncu ayrı takımlarda.
  const teams = (await room(table.roomId)).colors_team_assignments as Record<string, string>;
  expect(new Set(table.playerIds.map((id) => teams[id]))).toEqual(new Set(["red", "blue"]));

  await table.host.getByRole("button", { name: new RegExp(t("colors.startGame")) }).click();
  await waitForStatus(table.roomId, "colors_active");

  // Dokunuşlar saniyede bir toplu yazılıyor; hedefe ulaşana dek bas.
  const pad = alfa.getByRole("button", { name: /HIZLA BAS!/ });
  for (let i = 0; i < 20 && (await room(table.roomId)).status === "colors_active"; i++) {
    await tapRepeatedly(pad, 20);
    await alfa.waitForTimeout(1_100);
  }
  await waitForStatus(table.roomId, "colors_reveal");
  expect(Number((await player(table.playerIds[0])).colors_clicks)).toBeGreaterThan(0);

  await returnToLobbyFromHeader(table);
});

test("şifre: doğru kodu giren kasayı açar ve 500 puan alır", async ({ browser }) => {
  const table = await openTable(browser);
  const [alfa] = table.phones;
  await startGame(table.host, "NEON ŞİFRE");
  await waitForStatus(table.roomId, "vault_active", 20_000);

  // Kod oda belgesinde yok (misafir okuyabiliyordu); yalnızca host'un belgesinde.
  expect((await room(table.roomId)).vault_code).toBe("");
  const secret = await readDoc(`rooms/${table.roomId}/secrets/vault`);
  const code = String(secret?.code);
  expect(code).toMatch(/^\d{4}$/);

  const enter = async (guess: string) => {
    for (const digit of guess) await alfa.getByRole("button", { name: digit, exact: true }).click();
    await alfa.getByRole("button", { name: t("player.vaultSubmit") }).click();
  };

  // Yanlış tahminin ipucunu TV hesaplayıp cevap belgesine yazıyor.
  const wrong = String(((Number(code[0]) + 1) % 10)) + code.slice(1);
  await enter(wrong);
  await expect
    .poll(async () => (await queryDocs("answers", "room_id", table.roomId)).find((a) => (a.data as { guess?: string })?.guess === wrong)?.feedback)
    .toEqual(["absent", "correct", "correct", "correct"]);

  await enter(code);
  await waitForStatus(table.roomId, "vault_reveal");
  expect((await room(table.roomId)).vault_winner_id).toBe(table.playerIds[0]);
  expect((await room(table.roomId)).vault_code).toBe(code);
  await expect.poll(async () => (await player(table.playerIds[0])).total_score).toBe(500);

  await returnToLobbyFromHeader(table);
});

test("birlik: iki telefonun toplam dokunuşu hedefi doldurur", async ({ browser }) => {
  const table = await openTable(browser);
  await startGame(table.host, "NEON BİRLİK");
  await waitForStatus(table.roomId, "unity_active", 20_000);

  // Hedef oyuncu başına 100 dokunuş.
  for (const phone of table.phones) {
    await tapRepeatedly(phone.getByRole("button", { name: /^BAS!/ }), 110, "pointerdown");
  }
  await waitForStatus(table.roomId, "unity_reveal");
  for (const phone of table.phones) {
    await expect(phone.getByText(t("unity.success"))).toBeVisible();
  }

  await returnToLobbyFromHeader(table);
});

const BOTTLE_EMOJI: Record<string, string> = {
  "#ff0055": "🍓",
  "#00e5ff": "🫐",
  "#aeff00": "🍏",
  "#ffaa00": "🍊",
  "#b700ff": "🍇",
};

test("bar: tarifi doğru sırayla dolduran bir kokteyl kazanır", async ({ browser }) => {
  const table = await openTable(browser);
  const [alfa] = table.phones;
  await startGame(table.host, "NEON BAR");
  await waitForStatus(table.roomId, "bar_active", 20_000);

  // Tarif birkaç saniyede bir değişiyor: yeni tarif gelir gelmez doldur ki
  // giriş yarıda kalmasın; yine de kaçarsa bir sonraki tarifte tekrar dene.
  const recipeNow = async () => JSON.stringify((await room(table.roomId)).bar_active_recipe);
  for (let attempt = 0; attempt < 3 && !(await player(table.playerIds[0])).bar_score; attempt++) {
    const previous = await recipeNow();
    await expect.poll(recipeNow, { timeout: 15_000 }).not.toBe(previous);
    const recipe = JSON.parse(await recipeNow()) as string[];
    for (const color of recipe) {
      await alfa.getByRole("button", { name: new RegExp(BOTTLE_EMOJI[color]) }).click();
    }
    await alfa.waitForTimeout(1_000);
  }
  await expect.poll(async () => (await player(table.playerIds[0])).bar_score).toBe(1);

  await table.host.getByRole("button", { name: t("hostHeader.endEarly") }).click();
  await waitForStatus(table.roomId, "bar_reveal");
  await returnToLobbyFromHeader(table);
});

test("kablo: telefonda devre açılır, TV turu bitirir", async ({ browser }) => {
  const table = await openTable(browser);
  const [alfa] = table.phones;
  await startGame(table.host, "NEON KABLO");
  await waitForStatus(table.roomId, "kablo_active", 20_000);

  await expect(alfa.getByText(t("kablo.connectCircuit"))).toBeVisible();
  await expect(alfa.getByText(t("kablo.totalSolved"))).toBeVisible();

  await table.host.getByRole("button", { name: t("hostHeader.endEarly") }).click();
  await waitForStatus(table.roomId, "kablo_reveal");
  await returnToLobbyFromHeader(table);
});

test("ayna: anket ve tahminler sonrası tur puanlanır", async ({ browser }) => {
  const table = await openTable(browser);
  await startGame(table.host, "HENGAME AYNA");
  await waitForStatus(table.roomId, ["ayna_survey", "ayna_active"], 20_000);

  // Salon anketi: her telefon soruları yanıtlar (süre dolmadan biter).
  for (let i = 0; i < 30 && (await room(table.roomId)).status === "ayna_survey"; i++) {
    for (const phone of table.phones) {
      await phone.getByRole("button", { name: t("ayna.yes"), exact: true }).click({ timeout: 1_000 }).catch(() => {});
    }
  }
  await waitForStatus(table.roomId, "ayna_active", 40_000);

  for (const phone of table.phones) {
    await phone.getByRole("button", { name: t("ayna.lockIn") }).click();
  }
  await waitForStatus(table.roomId, "ayna_reveal");
  const points = (await room(table.roomId)).ayna_round_points as Record<string, number>;
  expect(Object.keys(points).sort()).toEqual([...table.playerIds].sort());
  // Gerçek değer yalnızca açıklamada odaya yazılıyor (telefon kodunda yok).
  expect(typeof (await room(table.roomId)).ayna_round_truth).toBe("number");
});
