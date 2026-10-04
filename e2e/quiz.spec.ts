import { expect, test, type Page } from "@playwright/test";

import { readDoc, resetEmulators } from "./support/emulator";
import { t } from "./support/i18n";
import { joinAsPlayer, openNight } from "./support/night";

test.beforeEach(resetEmulators);

type Option = "A" | "B" | "C" | "D";

async function playerId(phone: Page): Promise<string> {
  const id = await phone.evaluate(() => localStorage.getItem("cafe_game_playerId"));
  if (!id) throw new Error("oyuncu kimliği yok");
  return id;
}

async function score(id: string): Promise<number> {
  return Number((await readDoc(`players/${id}`))?.total_score ?? 0);
}

async function currentCorrectOption(roomId: string): Promise<Option> {
  const room = await readDoc(`rooms/${roomId}`);
  const index = Number(room?.current_question_index ?? 0);
  const questions = room?.quiz_questions as { correctOption: Option }[];
  return questions[index].correctOption;
}

const wrong = (correct: Option): Option => (correct === "A" ? "B" : "A");
const answer = (phone: Page, option: Option) =>
  phone.getByRole("button", { name: new RegExp(`^${option}\\b`) }).click({ timeout: 30_000 });

/**
 * Quiz puanlaması uçtan uca (docs/roadmap.md, 2.7 kalkanı): doğru cevap 1000,
 * en hızlı doğruya +500, üst üste ikinci doğruya ×1.2. HostQuizDisplay
 * ayrıştırılırken puanların değişmediğini bu test kanıtlıyor.
 */
test("quiz: doğru/yanlış, hız bonusu ve seri çarpanı puana yansır", async ({ browser }) => {
  const { host, roomId, code } = await openNight(browser);
  const alfa = await joinAsPlayer(browser, code, "ALFA");
  const beta = await joinAsPlayer(browser, code, "BETA");
  const [alfaId, betaId] = [await playerId(alfa), await playerId(beta)];

  await host.getByRole("button", { name: "HENGAME QUIZ", exact: true }).click();
  await host.getByRole("button", { name: /^HENGAME QUIZ .+/ }).click();
  await host.getByRole("button", { name: t("gameSettings.startSession") }).click();

  // İlk oyunda anlatım ekranı geliyor: soru ekranı gelene kadar ilerle.
  // Aynı düğmenin metni son adımda "başla"ya dönüyor; geçişte ikisi de
  // görünmeyebilir, bu yüzden tıklama denemesi başarısız olabilir.
  const startTimer = host.getByRole("button", { name: t("quiz.startTimer") });
  const tutorialButton = host.getByRole("button", {
    name: new RegExp(`^(${t("tutorial.next")}|${t("tutorial.startGame")})$`),
  });
  await expect(tutorialButton.or(startTimer)).toBeVisible({ timeout: 20_000 });
  for (let i = 0; i < 20 && !(await startTimer.isVisible()); i++) {
    await tutorialButton.click({ timeout: 2_000 }).catch(() => {});
  }

  await test.step("1. soru: ALFA doğru, BETA yanlış", async () => {
    await startTimer.click({ timeout: 30_000 });
    const correct = await currentCorrectOption(roomId);
    await answer(alfa, correct);
    await answer(beta, wrong(correct));
    await expect.poll(() => score(alfaId), { timeout: 30_000 }).toBe(1500);
    expect(await score(betaId)).toBe(0);
  });

  await test.step("2. soru: ALFA üst üste doğru → ×1.2", async () => {
    await host.getByRole("button", { name: t("quiz.seeRanking") }).click({ timeout: 30_000 });
    await host.getByRole("button", { name: t("quiz.nextQuestion") }).click({ timeout: 30_000 });
    await startTimer.click({ timeout: 30_000 });
    const correct = await currentCorrectOption(roomId);
    await answer(alfa, correct);
    await answer(beta, wrong(correct));
    await expect.poll(() => score(alfaId), { timeout: 30_000 }).toBe(1500 + 1800);
    expect(await score(betaId)).toBe(0);
  });
});
