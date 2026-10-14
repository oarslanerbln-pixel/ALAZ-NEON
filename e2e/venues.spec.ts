import { expect, test, type Page } from "@playwright/test";

import { createAccount, readDoc, writeDoc } from "./support/emulator";
import { t } from "./support/i18n";
import { freshStart, newDevice } from "./support/night";

test.beforeEach(freshStart);

/**
 * Çok mekan (docs/design/3.1-cok-mekan.md): iki mekan, mekan başına personel.
 * Mekanı ve sahibini HENGAME ekibi açar (burada tohum veri; yayında
 * scripts/venue-admin.mjs). Çapraz erişim reddi kural testlerinde; burada
 * arayüzün seçili mekana bağlı kaldığı sınanıyor.
 */
const KADIKOY = { id: "kadikoy-neon", name: "Kadıköy Neon" };
const BERLIN = { id: "berlin-mitte", name: "Berlin Mitte" };
const PASSWORD = "e2e-sifre-123";

async function seedVenues() {
  for (const venue of [KADIKOY, BERLIN]) {
    await writeDoc(`venues/${venue.id}`, { name: venue.name, rewards_enabled: false });
  }
}

async function addMember(venueId: string, uid: string, role: "owner" | "staff") {
  await writeDoc(`venues/${venueId}/staff/${uid}`, { uid, role, added_by: "platform-script", added_at: Date.now() });
}

/** Personel kapısındaki giriş bağlantısından girer ve aynı ekrana döner. */
async function signIn(page: Page, path: string, email: string) {
  await page.goto(path);
  await page.getByRole("link", { name: t("staff.login") }).click();
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('input[type="password"]').press("Enter");
  await expect(page).toHaveURL(new RegExp(`${path}$`));
}

async function startNight(page: Page): Promise<Record<string, unknown>> {
  await page.getByRole("button", { name: t("setup.startNight", "GECEYİ BAŞLAT →") }).click();
  await expect(page).toHaveURL(/\/host\/display\?roomId=/);
  const roomId = new URL(page.url()).searchParams.get("roomId");
  const room = roomId ? await readDoc(`rooms/${roomId}`) : null;
  if (!room) throw new Error("Oda okunamadı");
  return room;
}

test("sahip personel ekler; yeni personel o mekanın gecesini açar", async ({ browser }) => {
  await seedVenues();
  const ownerUid = await createAccount("sahip@kadikoy.test", PASSWORD);
  await addMember(KADIKOY.id, ownerUid, "owner");
  const waiterUid = await createAccount("garson@kadikoy.test", PASSWORD);

  const waiter = await newDevice(browser);
  await test.step("yetkisiz hesap kurulumda kimliğini görür, gece açamaz", async () => {
    await signIn(waiter, "/host/setup", "garson@kadikoy.test");
    await expect(waiter.getByText(waiterUid, { exact: true })).toBeVisible();
    await expect(waiter.getByRole("button", { name: t("setup.startNight", "GECEYİ BAŞLAT →") })).toHaveCount(0);
  });

  await test.step("sahip kimliği personel listesine ekler", async () => {
    const owner = await newDevice(browser);
    await signIn(owner, "/admin/staff", "sahip@kadikoy.test");
    await owner.getByLabel(t("staffAdmin.addLabel")).fill(waiterUid);
    await owner.getByRole("button", { name: t("staffAdmin.add") }).click();
    await expect(owner.getByRole("status")).toHaveText(t("staffAdmin.added"));
    await expect(owner.getByText(waiterUid, { exact: true })).toBeVisible();
  });

  await test.step("garsonun ekranı kendiliğinden açılır; oda mekanın markasıyla", async () => {
    const room = await startNight(waiter);
    expect(room).toMatchObject({ venue_id: KADIKOY.id, venue_name: KADIKOY.name });
  });
});

test("iki mekanlı personel mekan seçer; rapor ve gece seçili mekanın", async ({ browser }) => {
  await seedVenues();
  const uid = await createAccount("bolge@hengame.test", PASSWORD);
  await addMember(KADIKOY.id, uid, "staff");
  await addMember(BERLIN.id, uid, "staff");
  const now = Date.now();
  await writeDoc("rooms/kadikoy-1", { code: "KDK1", status: "finished", host_uid: uid, venue_id: KADIKOY.id, created_at: now });
  await writeDoc("rooms/berlin-1", { code: "BRL1", status: "finished", host_uid: uid, venue_id: BERLIN.id, created_at: now });
  await writeDoc("rooms/berlin-2", { code: "BRL2", status: "finished", host_uid: uid, venue_id: BERLIN.id, created_at: now });

  const device = await newDevice(browser);
  const switcher = device.getByRole("combobox", { name: t("venue.switch") });
  const gamesPlayed = device.getByText("Oyun Sayısı").locator("xpath=following-sibling::p[1]");

  await test.step("seçili mekanın personeli değil: mekan seçtirir", async () => {
    await signIn(device, "/admin/report", "bolge@hengame.test");
    await expect(device.getByText(t("staff.otherVenue"))).toBeVisible();
    await switcher.selectOption({ label: BERLIN.name });
  });

  await test.step("rapor yalnızca seçili mekanın odalarını sayar", async () => {
    await expect(gamesPlayed).toHaveText("2");
    await switcher.selectOption({ label: KADIKOY.name });
    await expect(gamesPlayed).toHaveText("1");
  });

  await test.step("TV seçimi hatırlar; değiştirilen mekanda gece açılır", async () => {
    await device.goto("/host/setup");
    await expect(switcher).toHaveValue(KADIKOY.id);
    await switcher.selectOption({ label: BERLIN.name });
    const room = await startNight(device);
    expect(room).toMatchObject({ venue_id: BERLIN.id, venue_name: BERLIN.name });
  });
});
