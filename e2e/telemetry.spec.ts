import { expect, test } from "@playwright/test";

import { queryDocs } from "./support/emulator";
import { openTable, returnToLobbyFromHeader, startGame, waitForStatus } from "./support/games";
import { t } from "./support/i18n";
import { freshStart } from "./support/night";

test.beforeEach(freshStart);

/**
 * Oyun telemetrisi (docs/roadmap.md, 3.2): TV her oyunun başında ve
 * sonunda bir olay yazar; gecelik rapor KPI'ları bu olaylardan hesaplar.
 */
test("TV oyunun başlangıcını ve bitişini kaydeder; rapor KPI'ları gösterir", async ({ browser }) => {
  const table = await openTable(browser);
  await startGame(table.host, "HENGAME ÇARK");
  await waitForStatus(table.roomId, "wheel_active");
  await returnToLobbyFromHeader(table);

  await test.step("başlangıç ve bitiş olayı aynı başlangıç anıyla yazıldı", async () => {
    await expect.poll(async () => (await queryDocs("events", "room_id", table.roomId)).length).toBe(2);
    const events = await queryDocs("events", "room_id", table.roomId);
    expect(events.map((e) => e.type).sort()).toEqual(["game_ended", "game_started"]);
    for (const e of events) {
      expect(e).toMatchObject({ game: "wheel", player_count: 2 });
    }
    expect(new Set(events.map((e) => e.started_at)).size).toBe(1);
    const ended = events.find((e) => e.type === "game_ended")!;
    expect(Number(ended.ended_at)).toBeGreaterThan(Number(ended.started_at));
  });

  await test.step("gecelik rapor oyunu, oyuncuyu ve misafirleri gösterir", async () => {
    const report = await table.host.context().newPage();
    await report.goto("/admin/report");
    const panel = report.getByRole("region", { name: t("report.kpiTitle") });
    await expect(panel).toBeVisible();
    await expect(panel.getByText("HENGAME ÇARK")).toBeVisible();
    await expect(panel.getByText(t("report.gamesPerNight", 1))).toBeVisible();
    await expect(panel.getByText(t("report.uniqueGuests")).locator("..")).toContainText("2");
  });
});
