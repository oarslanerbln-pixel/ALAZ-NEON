import { test, expect, type Page } from "@playwright/test";
import { closeAll, forceGerman, openNight } from "./support/cafe";
import { openDesktop } from "./support/devices";
import { adminGet, adminSet, clearAuth, clearFirestore, createEmailUser } from "./support/emulator";

/**
 * Personel girişi ve /admin/venue mekân ayarları. Test kullanıcıları yalnızca
 * emülatörde açılır; staff/{uid} kaydı istemciden yazılamadığı için (kural)
 * gerçekte olduğu gibi "konsoldan" — burada emülatör REST'iyle — eklenir.
 */
const OWNER = { email: "owner@e2e.test", password: "e2e-owner-pass" };
const SEEDED_VENUE = {
  name: "LUNA Rooftop",
  logo_url: null,
  primary_color: "#22d3ee",
  rewards_enabled: true,
  reward_title: "Gratis Espresso",
  reward_description: "An der Bar einlösen",
  reward_type: "drink",
  reward_validity_days: 14,
  promo_images: ["http://127.0.0.1:4173/hero-3.png"],
  sponsor_ads: [{ id: "ad1", sponsor: "Club Mate", url: "http://127.0.0.1:4173/hero-3.png", type: "image", duration: 10 }],
  wheel_slices: [{ id: "s1", text: "Shot", color: "#ff0000", weight: 1 }],
  updated_at: 1,
};

test.beforeEach(async () => {
  await clearFirestore();
  await clearAuth();
});

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "ANMELDEN" }).click();
}

test("personel girişi → mekân ayarları kaydı → TV yeni adı gösterir", async ({ browser }) => {
  const uid = await createEmailUser(OWNER.email, OWNER.password);
  await adminSet(`staff/${uid}`, { added_at: Date.now(), note: "e2e" });
  await adminSet("app_config/active_venue", SEEDED_VENUE);

  const admin = await openDesktop(browser);
  await forceGerman(admin);
  try {
    await login(admin.page, OWNER.email, OWNER.password);
    await expect(admin.page).toHaveURL(/\/admin\/venue/, { timeout: 20_000 });
    await expect(admin.page.getByRole("heading", { name: "Mekan Ayarları" })).toBeVisible();
    const nameInput = admin.page.getByPlaceholder("Örn: LUNA Rooftop");
    await expect(nameInput).toHaveValue("LUNA Rooftop");

    await nameInput.fill("LUNA Rooftop Berlin");
    await admin.page.getByRole("button", { name: "Markayı Kaydet" }).click();
    await expect(admin.page.getByText("Kaydedildi — tüm ekranlar güncellendi")).toBeVisible();

    const saved = await adminGet("app_config/active_venue");
    expect(saved?.name).toBe("LUNA Rooftop Berlin");
    // Formun dokunmadığı alanlar korunmalı (sponsor, promo, çark).
    expect(saved?.promo_images).toEqual(SEEDED_VENUE.promo_images);
    expect((saved?.sponsor_ads as unknown[]).length).toBe(1);
    expect(saved?.reward_title).toBe("Gratis Espresso");

    // TV: yeni oda, mekânın anlık adını taşır.
    const tv = await openNight(browser);
    try {
      expect((await adminGet(`rooms/${tv.roomId}`))?.venue_name).toBe("LUNA Rooftop Berlin");
    } finally {
      await closeAll(tv);
    }
  } finally {
    await closeAll(admin);
  }
});

test("personel /admin/venue'yu doğrudan açınca (yer imi) form gerçek ayarlarla dolar", async ({ browser }) => {
  const uid = await createEmailUser(OWNER.email, OWNER.password);
  await adminSet(`staff/${uid}`, { added_at: Date.now() });
  await adminSet("app_config/active_venue", SEEDED_VENUE);

  const admin = await openDesktop(browser);
  await forceGerman(admin);
  try {
    await login(admin.page, OWNER.email, OWNER.password);
    await expect(admin.page).toHaveURL(/\/admin\/venue/, { timeout: 20_000 });
    // Mekân sahibi sayfayı yer iminden / yenileyerek açıyor: oturum açık,
    // marka verisi henüz gelmemiş olabilir.
    await admin.page.reload();
    await expect(admin.page.getByRole("heading", { name: "Mekan Ayarları" })).toBeVisible({ timeout: 20_000 });
    await expect(admin.page.getByPlaceholder("Örn: LUNA Rooftop")).toHaveValue("LUNA Rooftop", { timeout: 5_000 });
  } finally {
    await closeAll(admin);
  }
});

test("kayıt olan sıradan hesap personel değildir: ayar yazamaz", async ({ browser }) => {
  await createEmailUser("guest@e2e.test", "e2e-guest-pass");
  await adminSet("app_config/active_venue", SEEDED_VENUE);
  const guest = await openDesktop(browser);
  await forceGerman(guest);
  try {
    await login(guest.page, "guest@e2e.test", "e2e-guest-pass");
    await expect(guest.page.getByText(/personeli hesabı değil/)).toBeVisible({ timeout: 20_000 });
    await expect(guest.page.getByRole("button", { name: "Markayı Kaydet" })).toHaveCount(0);
    // Doğrudan yazma denemesini kural reddeder: test/firestore.rules.test.ts
    // → "KAYIT OLAN HERHANGİ BİRİ markayı değiştiremez".
    expect((await adminGet("app_config/active_venue"))?.name).toBe("LUNA Rooftop");
  } finally {
    await closeAll(guest);
  }
});

test("barda ödül kodu doğrulama: bir kez kullanılır", async ({ browser }) => {
  const uid = await createEmailUser(OWNER.email, OWNER.password);
  await adminSet(`staff/${uid}`, { added_at: Date.now() });
  await adminSet("rewards/r1", {
    uid: "guest-uid",
    nickname: "GAST01",
    type: "drink",
    title: "Gratis Espresso",
    status: "available",
    code: "A3F9K2",
    earned_at: Date.now(),
    expires_at: Date.now() + 86_400_000,
  });
  const bar = await openDesktop(browser);
  await forceGerman(bar);
  try {
    await login(bar.page, OWNER.email, OWNER.password);
    await expect(bar.page).toHaveURL(/\/admin\/venue/, { timeout: 20_000 });
    await bar.page.goto("/admin/rewards");
    await bar.page.locator("#reward-code").fill("A3F9K2");
    await bar.page.getByRole("button", { name: "Bul" }).click();
    await bar.page.getByRole("button", { name: "Ödülü Onayla ve Kullan" }).click();
    await expect(bar.page.getByText("Onaylandı")).toBeVisible();
    expect((await adminGet("rewards/r1"))?.status).toBe("claimed");

    await bar.page.locator("#reward-code").fill("A3F9K2");
    await bar.page.getByRole("button", { name: "Bul" }).click();
    await expect(bar.page.getByText("Bu ödül zaten kullanılmış")).toBeVisible();
  } finally {
    await closeAll(bar);
  }
});
