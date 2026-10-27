import { expect, type Browser, type BrowserContextOptions, type Page } from "@playwright/test";
import { adminGet, adminQuery } from "./emulator";
import { decodeQrFromScreen } from "./qr";
import { openPhone, openTv, type Tracked } from "./devices";

/**
 * Kafe senaryosunun yapı taşları: TV'de gece açmak, QR'dan telefonla
 * katılmak, karuselden oyun seçip başlatmak. Arayüz Almanca (mekân dili);
 * metinler src/lib/i18n.ts'teki `de` değerleri.
 */

export const LOCALE_KEY = "alaz_neon_locale";

export async function forceGerman(t: Tracked): Promise<void> {
  await t.context.addInitScript((key) => {
    try {
      if (!localStorage.getItem(key)) localStorage.setItem(key, "de");
    } catch {
      /* gizli mod */
    }
  }, LOCALE_KEY);
}

export interface Tv extends Tracked {
  roomId: string;
  code: string;
}

/** TV: /host/setup → gece lobisi (night_lobby). */
export async function openNight(browser: Browser): Promise<Tv> {
  const tv = await openTv(browser);
  await forceGerman(tv);
  await tv.page.goto("/host/setup");
  // Anonim oturum hazır olmadan oda açılırsa kural host_uid'i reddeder;
  // misafirin göreceği gibi butona basıp yönlendirmeyi bekliyoruz.
  const start = tv.page.getByRole("button", { name: /SITZUNG STARTEN/ });
  await expect(start).toBeVisible();
  // İlk tıklama anonim oturum açılmadan gelirse kural reddeder ve TV hata
  // bildirir; personel gibi bir kez daha basıyoruz.
  await expect(async () => {
    if (await start.isVisible()) await start.click({ timeout: 2_000 });
    await expect(tv.page).toHaveURL(/\/host\/display\?roomId=/, { timeout: 4_000 });
  }).toPass({ timeout: 30_000 });
  const roomId = new URL(tv.page.url()).searchParams.get("roomId")!;
  const room = await adminGet(`rooms/${roomId}`);
  expect(room?.status).toBe("night_lobby");
  return { ...tv, roomId, code: String(room!.code) };
}

/** TV'deki QR'ı ekrandan okuyup doğru odaya götürdüğünü doğrular. */
export async function scanTvQr(tv: Tv): Promise<string> {
  const qr = tv.page.getByTestId("join-qr");
  await expect(qr).toBeVisible();
  const url = await decodeQrFromScreen(tv.context, qr);
  const parsed = new URL(url);
  expect(parsed.pathname).toBe("/join");
  expect(parsed.searchParams.get("code")).toBe(tv.code);
  // Kod gerçekten bu odaya mı çıkıyor: aynı kodla canlı tek oda bu olmalı.
  const sameCode = await adminQuery("rooms", "code", tv.code);
  const live = sameCode.filter((r) => r.status !== "closed");
  expect(live.map((r) => r._id)).toEqual([tv.roomId]);
  return url;
}

export interface Phone extends Tracked {
  model: string;
  nickname: string;
  playerId?: string;
  /** QR'ın açıldığı an (Date.now) ve TV'de görünme anı — gecikme ölçümü. */
  scannedAt?: number;
}

export async function newPhone(
  browser: Browser,
  index: number,
  nickname: string,
  extra: BrowserContextOptions = {},
): Promise<Phone> {
  const phone = await openPhone(browser, index, extra);
  await forceGerman(phone);
  return { ...phone, nickname };
}

/** Telefon QR adresini açar, takma ad girer, lobiye düşer. */
export async function joinFromQr(phone: Phone, joinUrl: string): Promise<void> {
  phone.scannedAt = Date.now();
  await phone.page.goto(joinUrl);
  const nick = phone.page.getByPlaceholder("KRIEGER");
  await expect(nick).toBeVisible({ timeout: 30_000 });
  await nick.fill(phone.nickname);
  await phone.page.getByRole("button", { name: "AM KAMPF TEILNEHMEN" }).click();
  await expect(phone.page).toHaveURL(/\/play/, { timeout: 30_000 });
  phone.playerId = await phone.page.evaluate(() => localStorage.getItem("cafe_game_playerId") ?? undefined);
  expect(phone.playerId, `${phone.nickname} oyuncu kaydı`).toBeTruthy();
}

/** TV gece lobisindeki "Spieler (N)" sayacı. */
export async function expectTvPlayerCount(tv: Page, n: number, timeout = 30_000): Promise<void> {
  await expect(tv.getByText(`Spieler (${n})`, { exact: true })).toBeVisible({ timeout });
}

const showcaseHandled = new WeakSet<Page>();

async function dismissShowcaseOnAction(tv: Page): Promise<void> {
  if (showcaseHandled.has(tv)) return;
  showcaseHandled.add(tv);
  const showcase = tv.locator("div.fixed.inset-0.cursor-pointer");
  await tv.addLocatorHandler(showcase, async () => {
    await showcase.click();
    await expect(showcase).toBeHidden();
  });
}

/**
 * Karuselden oyunu seçip ayar penceresinde "SPIEL STARTEN". `configure`
 * pencere açıkken ayar düğmelerine basabilir (soru sayısı, süre...).
 */
export async function startGameFromDashboard(
  tv: Page,
  game: "QUIZ" | "ARENA" | "BOMB" | "YÖRÜNGE SAPANI",
  configure?: (modal: Page) => Promise<void>,
): Promise<void> {
  // Amiral gemisi modlar "HENGAME <AD>", diğerleri kendi iki kelimelik adıyla.
  const [prefix, highlight] = game.includes(" ") ? game.split(" ") : ["HENGAME", game];
  // TV 90 sn dokunulmazsa tanıtım döngüsüne geçer (HostShowcase, tam ekran).
  // Bir kez bakıp kapatmak yetmiyordu: döngü bu adımlar sırasında da açılıp
  // tıklamanın önüne geçebiliyor. Playwright her TV eyleminden önce açıksa
  // personel gibi bir dokunuşla kapatır.
  await dismissShowcaseOnAction(tv);
  // Karusel noktaları oyun adını aria-label olarak taşıyor ("HENGAME QUIZ").
  await tv.getByRole("button", { name: `${prefix} ${highlight}`, exact: true }).click();
  const card = tv
    .locator("button:not([disabled])")
    .filter({ hasText: new RegExp(`${prefix}[\\s\\S]{0,40}${highlight}`) })
    .filter({ hasText: /SESSION STARTEN/i })
    .first();
  await expect(card).toBeVisible();
  await card.click();
  const start = tv.getByRole("button", { name: "SPIEL STARTEN" });
  await expect(start).toBeVisible();
  if (configure) await configure(tv);
  await start.click();
}

export async function closeAll(...all: Tracked[]): Promise<void> {
  await Promise.all(all.map((t) => t.context.close().catch(() => undefined)));
}

/** Gürültü: engellenen dış istekler, tarayıcının otomatik oynatma uyarıları. */
const NOISE = /ERR_BLOCKED_BY_CLIENT|net::ERR_FAILED|Failed to load resource|favicon|play\(\) request|NotAllowedError|AudioContext/i;

/**
 * Denetimde doğrulanmış ve rapora yazılmış hatalar (docs/audit-2026-10.md).
 * Düzeltilene kadar testi kırmasınlar diye ayrı sayılıyorlar; düzeltilince
 * buradan silinmeli. Şu an boş: O5 (emoji transient) ve O6 (round_logs)
 * özellikleriyle birlikte kaldırıldı.
 */
export const KNOWN_ERRORS: Array<{ id: string; pattern: RegExp }> = [];

export function realErrors(t: Tracked): string[] {
  return t.errors.filter((e) => !NOISE.test(e) && !KNOWN_ERRORS.some((k) => k.pattern.test(e)));
}

export function knownErrors(t: Tracked): string[] {
  return KNOWN_ERRORS.filter((k) => t.errors.some((e) => k.pattern.test(e))).map((k) => k.id);
}

export { openTv, openPhone };
