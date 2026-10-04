import { expect, test, type Page } from "@playwright/test";

import { readDoc, resetEmulators } from "./support/emulator";
import { t } from "./support/i18n";
import { openNight } from "./support/night";

test.beforeEach(resetEmulators);

/**
 * Oyun ayarları modalının odaya yazdığı ayarlar (docs/roadmap.md, 2.7).
 * Modal ayrıştırılırken davranışın değişmediğini bu test kanıtlıyor.
 */
async function openSettings(host: Page, title: string): Promise<void> {
  await host.getByRole("button", { name: title, exact: true }).click();
  await host.getByRole("button", { name: new RegExp(`^${title} .+`) }).click();
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
  // Konu düğmeleri emoji + etiket taşıyor; ikisinin seçimini kaldır.
  await host.getByRole("button", { name: /MUSIK/ }).click();
  await host.getByRole("button", { name: /KINO/ }).click();
  await host.getByRole("button", { name: t("gameSettings.startSession") }).click();

  await expect
    .poll(async () => (await readDoc(`rooms/${roomId}`))?.active_game, { timeout: 15_000 })
    .toBe("quiz");
  const room = await readDoc(`rooms/${roomId}`);
  expect(room).toMatchObject({ total_rounds: 12, timer_setting: 15 });
  expect(room?.quiz_topics).toEqual(["gece", "zeka", "kultur", "bilim"]);
});
