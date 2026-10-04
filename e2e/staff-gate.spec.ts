import { expect, test } from "@playwright/test";

import { resetEmulators } from "./support/emulator";
import { t } from "./support/i18n";
import { newDevice } from "./support/night";

test.beforeEach(resetEmulators);

// Karar D1: oda yalnızca personel hesabıyla açılır. Anonim ziyaretçi kurulum
// ekranı yerine giriş bağlantısını görür.
test("anonim ziyaretçi oda açamaz, giriş bağlantısı görür", async ({ browser }) => {
  const visitor = await newDevice(browser);
  await visitor.goto("/host/setup");

  await expect(visitor.getByRole("link", { name: t("staff.login") })).toBeVisible();
  await expect(
    visitor.getByRole("button", { name: t("setup.startNight", "GECEYİ BAŞLAT →") }),
  ).toHaveCount(0);
});
