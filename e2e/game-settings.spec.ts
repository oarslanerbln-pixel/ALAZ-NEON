import { expect, test, type Page } from "@playwright/test";

import { readDoc } from "./support/emulator";
import { t } from "./support/i18n";
import { freshStart, joinAsPlayer, openNight } from "./support/night";

test.beforeEach(freshStart);

/**
 * Oyun ayarları modalının odaya yazdığı ayarlar (docs/roadmap.md, 2.7).
 * Modal ayrıştırılırken davranışın değişmediğini bu test kanıtlıyor.
 */
async function openSettings(host: Page, title: string): Promise<void> {
  await host.getByRole("button", { name: title, exact: true }).click();
  await host.getByRole("button", { name: new RegExp(`${title} .+`) }).click();
  await expect(host.getByRole("button", { name: t("gameSettings.startSession") })).toBeVisible();
}

const option = (host: Page, label: string) => host.getByRole("button", { name: label, exact: true });

test("klasik oyun: seçilen süre, tur ve kategoriler odaya yazılır", async ({ browser }) => {
  const { host, roomId } = await openNight(browser);
  await openSettings(host, "HENGAME ARENA");

  await option(host, `45 ${t("gameSettings.secondsSuffix")}`).click();
  await option(host, `5 ${t("gameSettings.roundsSuffix")}`).click();
  await host.locator("textarea").fill(" Şehir ,, Ülke , Meslek ");
  await host.getByRole("button", { name: t("gameSettings.startSession") }).click();

  await expect
    .poll(async () => (await readDoc(`rooms/${roomId}`))?.active_game, { timeout: 15_000 })
    .toBe("scattegories");
  const room = await readDoc(`rooms/${roomId}`);
  expect(room).toMatchObject({
    timer_setting: 45,
    total_rounds: 5,
    categories: ["Şehir", "Ülke", "Meslek"],
    game_mode: "individual",
  });
});

test("quiz: soru sayısı, süre ve konu seçimi odaya yazılır", async ({ browser }) => {
  const { host, roomId } = await openNight(browser);
  await openSettings(host, "HENGAME QUIZ");

  await option(host, `12 ${t("gameSettings.quizQuestionsSuffix")}`).click();
  await option(host, `15 ${t("gameSettings.secondsSuffix")}`).click();
  // İki konunun seçimini kaldır.
  await option(host, t("gameSettings.quizTopic.muzik")).click();
  await option(host, t("gameSettings.quizTopic.sinema")).click();
  await host.getByRole("switch", { name: t("gameSettings.quizDoubleFinalTitle") }).click();
  await host.getByRole("button", { name: t("gameSettings.startSession") }).click();

  await expect
    .poll(async () => (await readDoc(`rooms/${roomId}`))?.active_game, { timeout: 15_000 })
    .toBe("quiz");
  const room = await readDoc(`rooms/${roomId}`);
  expect(room).toMatchObject({ total_rounds: 12, timer_setting: 15 });
  expect(room?.quiz_topics).toEqual(["gece", "zeka", "kultur", "bilim"]);
  expect(room?.quiz_double_final).toBe(false);
});

// Aşağıdaki ayarlar önceden yalnızca pencerede görünüyor, oyuna hiç geçmiyordu.

test("bomba: seçilen can odaya ve her oyuncuya yazılır", async ({ browser }) => {
  const { host, roomId, code } = await openNight(browser);
  const phone = await joinAsPlayer(browser, code, "ALFA");
  const playerId = await phone.evaluate(() => localStorage.getItem("cafe_game_playerId"));
  await expect(host.getByText(t("dashboard.playersCount", 1))).toBeVisible();

  await openSettings(host, "HENGAME BOMB");
  await option(host, `1 ${t("gameSettings.livesSuffix")}`).click();
  await host.getByRole("button", { name: t("gameSettings.startSession") }).click();

  await expect.poll(async () => (await readDoc(`rooms/${roomId}`))?.active_game, { timeout: 15_000 }).toBe("bomb");
  expect((await readDoc(`rooms/${roomId}`))?.bomb_lives).toBe(1);
  expect((await readDoc(`players/${playerId}`))?.lives).toBe(1);
});

test("bar: turbo tarif hızı odaya yazılır", async ({ browser }) => {
  const { host, roomId } = await openNight(browser);
  await openSettings(host, "NEON BAR");
  await option(host, t("gameSettings.barRecipeTurbo")).click();
  await host.getByRole("button", { name: t("gameSettings.startSession") }).click();

  await expect.poll(async () => (await readDoc(`rooms/${roomId}`))?.active_game, { timeout: 15_000 }).toBe("bar");
  expect((await readDoc(`rooms/${roomId}`))?.bar_recipe_seconds).toBe(3);
});

test("renk savaşları: süreli düello seçilince TV geri sayar", async ({ browser }) => {
  const { host, roomId } = await openNight(browser);
  await openSettings(host, "NEON SAVAŞLARI");
  await host.getByRole("button", { name: new RegExp(t("gameSettings.colorsTimed")) }).click();
  await host.getByRole("button", { name: t("gameSettings.startSession") }).click();

  await expect.poll(async () => (await readDoc(`rooms/${roomId}`))?.status, { timeout: 15_000 }).toBe("colors_intro");
  expect((await readDoc(`rooms/${roomId}`))?.colors_win_condition).toBe("timed");

  await host.getByRole("button", { name: new RegExp(t("colors.startGame")) }).click();
  await expect.poll(async () => Number((await readDoc(`rooms/${roomId}`))?.colors_end_time)).toBeGreaterThan(Date.now());
  await expect(host.getByText(/⏱/)).toBeVisible();
});
