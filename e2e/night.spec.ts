import { expect, test, type Page } from "@playwright/test";

import { readDoc, resetEmulators } from "./support/emulator";
import { t } from "./support/i18n";
import { joinAsPlayer, openNight } from "./support/night";
import { activeWakeLocks } from "./support/wakeLock";

test.beforeEach(resetEmulators);

/**
 * Çekirdek gece akışı: TV odayı açar, üç telefon katılır, lobi sayacı
 * güncellenir (1.1), echo oylaması oyuncu giriş kayıtları üzerinden (1.3)
 * tamamlanır ve sonuç TV'de ilan edilir. Ekranlar boyunca uyanık kalır (2.5).
 */
test("TV odayı açar, üç oyuncu katılır ve echo oylaması tamamlanır", async ({ browser }) => {
  const { host, roomId, code } = await openNight(browser);

  const nicknames = ["ALFA", "BETA", "GAMA"] as const;
  const phones: Page[] = [];
  for (const nickname of nicknames) {
    phones.push(await joinAsPlayer(browser, code, nickname));
  }
  const [alfa, beta, gama] = phones;

  await test.step("lobi sayacı telefonlarda ve TV'de üç oyuncu gösterir", async () => {
    for (const phone of phones) {
      await expect(phone.getByText(t("waitingRoom.playersConnected", 3))).toBeVisible();
    }
    await expect(host.getByText(t("dashboard.playersCount", 3))).toBeVisible();
    expect((await readDoc(`rooms/${roomId}`))?.player_count).toBe(3);
  });

  await test.step("telefon arka planı optimize görselden yüklenir (2.2)", async () => {
    const backdrop = alfa.locator("picture img").first();
    await expect
      .poll(() => backdrop.evaluate((img: HTMLImageElement) => (img.complete ? img.naturalWidth : 0)))
      .toBeGreaterThan(0);
    expect(await backdrop.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(/\.(avif|webp)$/);
  });

  await test.step("TV ve telefonlar ekranı uyanık tutar (2.5)", async () => {
    for (const page of [host, ...phones]) {
      await expect.poll(() => activeWakeLocks(page)).toBe(1);
    }
  });

  await test.step("TV echo oyununu başlatır", async () => {
    // Karusel göstergesinin adı tam olarak oyun adı; kartın adı açıklamayı da içerir.
    await host.getByRole("button", { name: "HENGAME ECHO", exact: true }).click();
    await host.getByRole("button", { name: /^HENGAME ECHO .+/ }).click();
    await host.getByRole("button", { name: t("gameSettings.startSession") }).click();
  });

  await test.step("her telefon oyunu kendi giriş kaydına yazar", async () => {
    await alfa.getByRole("button", { name: "BETA" }).click({ timeout: 30_000 });
    await beta.getByRole("button", { name: "ALFA" }).click();
    await gama.getByRole("button", { name: "ALFA" }).click();
  });

  await test.step("süre bitince TV sonucu ilan eder: ALFA iki oyla önde", async () => {
    await expect(host.getByText("2 OY")).toBeVisible({ timeout: 45_000 });
    await expect(host.getByText("ALFA").first()).toBeVisible();

    // Sonuç odaya host tarafından yazıldı (oyuncular odaya yazamıyor).
    const room = await readDoc(`rooms/${roomId}`);
    const votes = room?.echo_votes as Record<string, string>;
    expect(Object.keys(votes)).toHaveLength(3);
  });
});
