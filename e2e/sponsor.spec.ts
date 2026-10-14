import { expect, test } from "@playwright/test";

import { queryDocs, writeDoc } from "./support/emulator";
import { openTable, waitForStatus } from "./support/games";
import { t } from "./support/i18n";
import { freshStart } from "./support/night";

test.beforeEach(freshStart);

/**
 * Sponsor reklam arası ve gösterim kaydı (proof-of-play, docs/roadmap.md 3.3):
 * TV panodan reklam arası verir, reklam bitince gösterim kaydı yazılır ve
 * gecelik rapor sponsoru gösterir.
 */
const AD = { id: "ad-cola", type: "image", url: "/noise.png", duration_seconds: 2, sponsor_name: "Neon Cola" };

test("pano reklam arası verir; gösterim kaydı ve sponsor raporu", async ({ browser }) => {
  // Mekan ayarları ekranının yazdığı belge: tek bir görsel reklam.
  await writeDoc("app_config/active_venue", { name: "HENGAME", rewards_enabled: false, sponsor_ads: [AD] });
  const table = await openTable(browser);

  await test.step("TV reklam arası verir, telefonlar reklam ekranını gösterir", async () => {
    await table.host.getByRole("button", { name: t("hostHeader.adBreak") }).click();
    await waitForStatus(table.roomId, "ad_break");
    await expect(table.host.getByText("Neon Cola")).toBeVisible();
    for (const phone of table.phones) {
      await expect(phone.getByText(t("game.adBreakTitle"))).toBeVisible();
    }
  });

  await test.step("reklam bitince pano geri gelir; tam gösterim kaydı yazılır", async () => {
    await waitForStatus(table.roomId, "night_lobby", 15_000);
    await expect.poll(async () => (await queryDocs("ad_impressions", "room_id", table.roomId)).length).toBe(1);
    const [impression] = await queryDocs("ad_impressions", "room_id", table.roomId);
    expect(impression).toMatchObject({
      ad_id: "ad-cola",
      sponsor_name: "Neon Cola",
      ad_type: "image",
      completed: true,
      audience: 2,
      planned_ms: 2000,
    });
    expect(Number(impression.shown_ms)).toBeGreaterThanOrEqual(1900);
  });

  await test.step("gecelik rapor sponsoru gösterir", async () => {
    const report = await table.host.context().newPage();
    await report.goto("/admin/report");
    const panel = report.getByRole("region", { name: t("report.sponsorTitle") });
    await expect(panel.getByRole("rowheader", { name: "Neon Cola" })).toBeVisible();
    await expect(panel.getByRole("button", { name: t("report.sponsorCsv") })).toBeVisible();
  });
});
