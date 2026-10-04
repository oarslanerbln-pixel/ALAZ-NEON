import { expect, test } from "@playwright/test";

import { expectAccessible } from "./support/a11y";
import { t } from "./support/i18n";
import { freshStart, newDevice } from "./support/night";

test.beforeEach(freshStart);

// Gece akışındaki ekranlar (telefon lobisi, TV, echo kumandası) night.spec.ts'te
// denetleniyor; burada oda gerektirmeyen giriş ekranları.
test("açılış ve katılım ekranlarında WCAG A/AA ihlali yok", async ({ browser }) => {
  const visitor = await newDevice(browser);

  await visitor.goto("/");
  await expect(visitor.locator("#root")).not.toBeEmpty();
  await expectAccessible(visitor, "açılış");

  await visitor.goto("/join");
  await expect(visitor.getByPlaceholder(t("join.nicknamePlaceholderShort"))).toBeVisible();
  await expectAccessible(visitor, "katılım");
});
