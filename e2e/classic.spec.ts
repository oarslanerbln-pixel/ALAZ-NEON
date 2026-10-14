import { expect, test, type Page } from "@playwright/test";

import { cleanAnswerData } from "../src/lib/answerText";
import { calculateRoundScores } from "../src/lib/scoring";
import type { Answer, Player, Room } from "../src/types/database";
import { queryDocs, readDoc, resetEmulators } from "./support/emulator";
import { t } from "./support/i18n";
import { joinAsPlayer, openNight } from "./support/night";

test.beforeEach(resetEmulators);

const CATEGORIES = ["Şehir", "Hayvan"];

async function waitForStatus(roomId: string, status: string, timeout = 90_000): Promise<Record<string, unknown>> {
  await expect.poll(async () => (await readDoc(`rooms/${roomId}`))?.status, { timeout }).toBe(status);
  return (await readDoc(`rooms/${roomId}`))!;
}

/** HoldButton: basılı tutunca gönderir. */
async function holdToSubmit(phone: Page): Promise<void> {
  const button = phone.getByRole("button", { name: t("game.submitEarly") });
  const box = await button.boundingBox();
  if (!box) throw new Error("gönder düğmesi görünmüyor");
  await phone.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await phone.mouse.down();
  await phone.waitForTimeout(1_600);
  await phone.mouse.up();
}

async function fill(phone: Page, answers: Record<string, string>): Promise<void> {
  for (const [category, value] of Object.entries(answers)) {
    await phone.getByLabel(new RegExp(`${category}$`)).fill(value);
  }
}

/**
 * Klasik harf oyunu uçtan uca (docs/roadmap.md, 2.7 kalkanı). HostDisplay
 * ayrıştırılırken akışın ve puan yazımının değişmediğini kanıtlıyor:
 * host'un yazdığı toplam puan, odadaki gerçek cevaplardan saf puanlama
 * fonksiyonuyla hesaplananla birebir aynı ve tur bir kez kapanıyor.
 */
test("klasik oyun: tur akışı, puanların tek ve doğru yazılması, sonraki tur", async ({ browser }) => {
  const { host, roomId, code } = await openNight(browser);
  const alfa = await joinAsPlayer(browser, code, "ALFA");
  const beta = await joinAsPlayer(browser, code, "BETA");

  await host.getByRole("button", { name: "HENGAME ARENA", exact: true }).click();
  await host.getByRole("button", { name: /^HENGAME ARENA .+/ }).click();
  await host.locator("textarea").fill(CATEGORIES.join(", "));
  await host.getByRole("button", { name: t("gameSettings.startSession") }).click();

  await host.getByRole("button", { name: t("lobby.startGame") }).click({ timeout: 30_000 });

  // Anlatım ekranı → sinematik → harf çarkı → tur.
  const tutorialButton = host.getByRole("button", {
    name: new RegExp(`^(${t("tutorial.next")}|${t("tutorial.startGame")})$`),
  });
  await expect(tutorialButton).toBeVisible({ timeout: 20_000 });
  // Host durumu önce yerelde (iyimser) günceller: ekran göründüğünde odada
  // durum henüz "lobby" olabilir. Önce odanın anlatıma geçmesini bekle.
  await waitForStatus(roomId, "tutorial", 20_000);
  for (let i = 0; i < 20 && (await readDoc(`rooms/${roomId}`))?.status === "tutorial"; i++) {
    await tutorialButton.click({ timeout: 2_000 }).catch(() => {});
  }
  const playing = await waitForStatus(roomId, "playing");
  const letter = String(playing.active_letter);
  expect(playing.current_round).toBe(1);

  await test.step("iki telefon cevap gönderir; herkes gönderince tur erken kapanır", async () => {
    await fill(alfa, { Şehir: `${letter}elina`, Hayvan: `${letter}orano` });
    await fill(beta, { Şehir: `${letter}elina` });
    await holdToSubmit(alfa);
    await holdToSubmit(beta);
    await waitForStatus(roomId, "review", 30_000);
  });

  await test.step("yazılan puan = saf puanlama fonksiyonunun sonucu, bir kez", async () => {
    const room = (await readDoc(`rooms/${roomId}`)) as unknown as Room;
    const answers = (await queryDocs("answers", "room_id", roomId)) as unknown as Answer[];
    const players = (await queryDocs("players", "room_id", roomId)) as unknown as Player[];
    const before = players.map((p) => ({ ...p, total_score: 0 }));
    const expected = calculateRoundScores(
      room,
      before,
      answers.map((a) => ({ ...a, data: cleanAnswerData(a.data) })),
      letter,
    );
    expect(expected).toHaveLength(2);

    const scoreOf = async (id: string) => Number((await readDoc(`players/${id}`))?.total_score ?? 0);
    for (const result of expected) {
      await expect.poll(() => scoreOf(result.playerId), { timeout: 20_000 }).toBe(result.totalScore);
    }
    const alfaResult = expected.find((r) => players.find((p) => p.id === r.playerId)?.nickname === "ALFA")!;
    const betaResult = expected.find((r) => players.find((p) => p.id === r.playerId)?.nickname === "BETA")!;
    expect(alfaResult.totalScore).toBeGreaterThan(betaResult.totalScore);

    // Tur bir kez kapanır: bir süre sonra puan hâlâ aynı.
    await host.waitForTimeout(4_000);
    for (const result of expected) expect(await scoreOf(result.playerId)).toBe(result.totalScore);
  });

  await test.step("inceleme → sıralama → ikinci tur", async () => {
    await host.getByRole("button", { name: t("review.nextRound") }).click({ timeout: 30_000 });
    await waitForStatus(roomId, "standings", 30_000);
    await host.getByRole("button", { name: t("standings.nextRound") }).click({ timeout: 30_000 });
    const next = await waitForStatus(roomId, "playing", 90_000);
    expect(next.current_round).toBe(2);
    expect(next.active_letter).not.toBe(letter);
  });
});
