import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

import { expectAccessible } from "./support/a11y";
import { readDoc } from "./support/emulator";
import { t } from "./support/i18n";
import { freshStart, openNight } from "./support/night";

test.beforeEach(freshStart);

/**
 * Mekan/kurum soru paketleri (docs/roadmap.md, 3.4): personel JSON paketi
 * yükler, hatalı dosya sorunlarıyla reddedilir, TV quiz ayarlarında paketi
 * seçer ve sorular paketten gelir.
 */
const SAMPLE = JSON.parse(readFileSync("src/content/quiz/sample-pack.json", "utf8")) as {
  title: string;
  questions: { id: string }[];
};

const file = (name: string, data: unknown) => ({
  name,
  mimeType: "application/json",
  buffer: Buffer.from(typeof data === "string" ? data : JSON.stringify(data)),
});

/** TV'nin personel oturumuyla aynı tarayıcıda yönetim sayfasını açar ve paketi yükler. */
async function uploadPack(admin: Page, title: string) {
  await admin.goto("/admin/content");
  const input = admin.getByLabel(t("content.upload"));

  await test.step("hatalı dosya sorunlarıyla reddedilir", async () => {
    await input.setInputFiles(file("bozuk.json", "{ bu json değil"));
    await expect(admin.getByRole("alert")).toContainText(t("content.issue.notJson"));

    const broken = { ...SAMPLE, locale: "fr", questions: SAMPLE.questions.slice(0, 2) };
    await input.setInputFiles(file("eksik.json", broken));
    await expect(admin.getByRole("alert")).toContainText(t("content.issue.locale"));
    await expect(admin.getByRole("alert")).toContainText(t("content.issue.count", 5, 200));
    await expect(admin.getByRole("button", { name: t("content.save") })).toHaveCount(0);
  });

  await test.step("geçerli paket önizlenir ve kaydedilir", async () => {
    await input.setInputFiles(file("paket.json", { ...SAMPLE, title }));
    await expect(admin.getByText(t("content.preview", title, 5, "tr"))).toBeVisible();
    await admin.getByRole("button", { name: t("content.save") }).click();
    await expect(admin.getByRole("status")).toHaveText(t("content.saved"));
    await expect(admin.getByRole("listitem").filter({ hasText: title })).toBeVisible();
    await expectAccessible(admin, "soru paketleri");
  });
}

test("personel paket yükler; TV quiz ayarında seçilen paketten soru gelir", async ({ browser }) => {
  const { host, roomId } = await openNight(browser);
  const admin = await host.context().newPage();
  await uploadPack(admin, "Firma Gecesi");
  await admin.close();

  await test.step("TV ayar penceresi paketi listeler ve seçtirir", async () => {
    await host.getByRole("button", { name: "HENGAME QUIZ", exact: true }).click();
    await host.getByRole("button", { name: /^HENGAME QUIZ .+/ }).click();
    await host.getByRole("button", { name: t("gameSettings.quizPackLabel", "Firma Gecesi", 5) }).click();
    await expect(host.getByText(t("gameSettings.quizPackHint"))).toBeVisible();
    await host.getByRole("button", { name: `5 ${t("gameSettings.quizQuestionsSuffix")}`, exact: true }).click();
    await host.getByRole("button", { name: t("gameSettings.startSession") }).click();
  });

  await test.step("odaya yazılan sorular paketten", async () => {
    await expect.poll(async () => (await readDoc(`rooms/${roomId}`))?.active_game, { timeout: 15_000 }).toBe("quiz");
    const room = await readDoc(`rooms/${roomId}`);
    const ids = (room?.quiz_questions as { id: string }[]).map((q) => q.id).sort();
    expect(ids).toEqual(SAMPLE.questions.map((q) => q.id).sort());
    expect(typeof room?.quiz_pack_id).toBe("string");
  });
});
