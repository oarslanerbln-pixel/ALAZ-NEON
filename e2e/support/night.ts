import { expect, type Browser, type Page } from "@playwright/test";

import { createStaffAccount, readDoc } from "./emulator";
import { LOCALE_INIT_SCRIPT, t } from "./i18n";
import { WAKE_LOCK_INIT_SCRIPT } from "./wakeLock";
import { CSP_INIT_SCRIPT } from "./csp";

export const STAFF_EMAIL = "personel@hengame.test";
export const STAFF_PASSWORD = "e2e-sifre-123";

/** Ayrı tarayıcı bağlamı = ayrı cihaz (ayrı anonim oturum, ayrı önbellek). */
export async function newDevice(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  await context.addInitScript(LOCALE_INIT_SCRIPT);
  await context.addInitScript(WAKE_LOCK_INIT_SCRIPT);
  await context.addInitScript(CSP_INIT_SCRIPT);
  return context.newPage();
}

export interface HostedNight {
  host: Page;
  roomId: string;
  code: string;
}

/**
 * TV: personel hesabıyla giriş yapıp geceyi (odayı) açar. Giriş, kurulum
 * ekranındaki personel kapısından geçiyor — "girişten sonra aynı ekrana
 * dönüş" akışı da böylece sınanıyor.
 */
export async function openNight(browser: Browser): Promise<HostedNight> {
  await createStaffAccount(STAFF_EMAIL, STAFF_PASSWORD);
  const host = await newDevice(browser);

  await host.goto("/host/setup");
  await host.getByRole("link", { name: t("staff.login") }).click();
  await host.locator('input[type="email"]').fill(STAFF_EMAIL);
  await host.locator('input[type="password"]').fill(STAFF_PASSWORD);
  await host.locator('input[type="password"]').press("Enter");
  await expect(host).toHaveURL(/\/host\/setup$/);

  await host.getByRole("button", { name: t("setup.startNight", "GECEYİ BAŞLAT →") }).click();
  await expect(host).toHaveURL(/\/host\/display\?roomId=/);
  const roomId = new URL(host.url()).searchParams.get("roomId");
  if (!roomId) throw new Error("Oda kimliği adreste yok");

  const room = await readDoc(`rooms/${roomId}`);
  const code = room?.code;
  if (typeof code !== "string") throw new Error("Oda kodu okunamadı");
  return { host, roomId, code };
}

/** Telefon: QR bağlantısıyla (`/join?code=…`) odaya katılır. */
export async function joinAsPlayer(browser: Browser, code: string, nickname: string): Promise<Page> {
  const phone = await newDevice(browser);
  await phone.goto(`/join?code=${code}`);
  const nicknameInput = phone.getByPlaceholder(t("join.nicknamePlaceholderShort"));
  await nicknameInput.fill(nickname);
  await nicknameInput.press("Enter");
  await expect(phone).toHaveURL(/\/play/);
  return phone;
}
