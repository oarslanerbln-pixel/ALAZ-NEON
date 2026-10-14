import { expect, type Browser, type Locator, type Page } from "@playwright/test";

import { readDoc } from "./emulator";
import { t } from "./i18n";
import { joinAsPlayer, openNight, type HostedNight } from "./night";

/**
 * Oyun başına duman testlerinin ortak yardımcıları (docs/roadmap.md, 2.1).
 * Her test aynı iskeleti izliyor: TV geceyi açar, iki telefon katılır, TV
 * oyunu panodan başlatır, oyunun bir turu oynanır ve TV lobiye döner.
 */

export interface GameTable extends HostedNight {
  /** Katılım sırasıyla telefonlar ve oyuncu kimlikleri. */
  phones: Page[];
  playerIds: string[];
  phoneOf: (playerId: string) => Page;
}

export const NICKNAMES = ["ALFA", "BETA"] as const;

export async function openTable(browser: Browser): Promise<GameTable> {
  const night = await openNight(browser);
  const phones: Page[] = [];
  for (const nickname of NICKNAMES) {
    phones.push(await joinAsPlayer(browser, night.code, nickname));
  }
  const playerIds = await Promise.all(phones.map(playerIdOf));
  const phoneOf = (playerId: string) => {
    const phone = phones[playerIds.indexOf(playerId)];
    if (!phone) throw new Error(`Oyuncu ${playerId} bu masada değil`);
    return phone;
  };
  // Lobi sayacı odaya yazılmadan oyun başlatılırsa bazı oyunlar (çark,
  // bomba) oyuncu seçerken boş liste görüyor.
  await expect(night.host.getByText(t("dashboard.playersCount", phones.length))).toBeVisible();
  return { ...night, phones, playerIds, phoneOf };
}

export async function playerIdOf(phone: Page): Promise<string> {
  const id = await phone.evaluate(() => localStorage.getItem("cafe_game_playerId"));
  if (!id) throw new Error("oyuncu kimliği yok");
  return id;
}

export async function room(roomId: string): Promise<Record<string, unknown>> {
  const doc = await readDoc(`rooms/${roomId}`);
  if (!doc) throw new Error(`Oda ${roomId} yok`);
  return doc;
}

export async function player(playerId: string): Promise<Record<string, unknown>> {
  const doc = await readDoc(`players/${playerId}`);
  if (!doc) throw new Error(`Oyuncu ${playerId} yok`);
  return doc;
}

/** Oda durumu verilen değere (ya da değerlerden birine) gelene kadar bekler. */
export async function waitForStatus(roomId: string, status: string | string[], timeout = 30_000) {
  const expected = Array.isArray(status) ? status : [status];
  await expect
    .poll(async () => String((await room(roomId)).status), { timeout, message: `oda durumu ${expected.join("|")}` })
    .toMatch(new RegExp(`^(${expected.join("|")})$`));
}

/** TV panosunda oyun kartını seçer ve ayar penceresinden oturumu başlatır. */
export async function startGame(host: Page, title: string) {
  // Karusel göstergesinin adı tam olarak oyun adı; kartın adı açıklamayı da içerir.
  await host.getByRole("button", { name: title, exact: true }).click();
  await host.getByRole("button", { name: new RegExp(`^${title} .+`) }).click();
  await host.getByRole("button", { name: t("gameSettings.startSession") }).click();
}

/** İlk oyundaki anlatım adımlarını (HostTutorial) geçer. */
export async function skipTutorial(host: Page, roomId: string) {
  await waitForStatus(roomId, "tutorial");
  const button = host.getByRole("button", {
    name: new RegExp(`^(${t("tutorial.next")}|${t("tutorial.startGame")})$`),
  });
  for (let i = 0; i < 20 && (await room(roomId)).status === "tutorial"; i++) {
    // Adım geçişinde düğme kısa süre görünmeyebilir; deneme başarısız olabilir.
    await button.click({ timeout: 2_000 }).catch(() => {});
  }
}

/**
 * TV başlığındaki "lobiye dön" düğmesi (onay penceresiyle). Oyun kapanınca
 * pano geri gelir ve telefonlar bekleme ekranına döner.
 */
export async function returnToLobbyFromHeader(table: GameTable) {
  table.host.once("dialog", (dialog) => void dialog.accept());
  await table.host.getByRole("button", { name: t("common.returnToLobby"), exact: true }).click();
  await expectBackInLobby(table);
}

/** Oyun kapandı: oda oyunsuz, TV panoda, telefonlar bekleme ekranında. */
export async function expectBackInLobby(table: GameTable) {
  await expect.poll(async () => (await room(table.roomId)).active_game).toBe("none");
  await expect(table.host.getByText(t("dashboard.playersCount", table.phones.length))).toBeVisible();
  for (const phone of table.phones) {
    await expect(phone.getByText(t("waitingRoom.playersConnected", table.phones.length))).toBeVisible();
  }
}

/** Aynı düğmeye hızlıca çok kez basar (tıklama yarışları, dokunma oyunları). */
export async function tapRepeatedly(target: Locator, times: number, event: "click" | "pointerdown" = "click") {
  await target.waitFor();
  for (let i = 0; i < times; i++) {
    await target.dispatchEvent(event);
  }
}
