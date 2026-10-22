import { test, expect } from "@playwright/test";
import { closeAll, expectTvPlayerCount, joinFromQr, newPhone, openNight, scanTvQr, type Phone } from "./support/cafe";
import { clearAuth, clearFirestore, meterRead, meterReset } from "./support/emulator";
import { recordMetric } from "./support/metrics";

/**
 * Firestore maliyeti (bkz. docs/audit-2026-10.md K3/P1). Lobide telefonlar
 * yalnızca nabız atar; eskiden her nabız odadaki her telefonun oyuncu listesi
 * dinleyicisine düşüyor, dakikada 4N(N+2) faturalı okuma ediyordu (20 kişide
 * Spark'ın günlük 50.000 okuması ~27 dakikada bitiyordu).
 */
test.beforeEach(async () => {
  await clearFirestore();
  await clearAuth();
});

test("lobide nabız telefonların listesine düşmez: okuma oyuncu sayısıyla doğrusal", async ({ browser }) => {
  const N = 6;
  const WAIT_MS = 40_000;
  const tv = await openNight(browser);
  const phones: Phone[] = [];
  try {
    const joinUrl = await scanTvQr(tv);
    for (let i = 0; i < N; i++) phones.push(await newPhone(browser, i, `NABIZ${i + 1}`));
    await Promise.all(phones.map((p) => joinFromQr(p, joinUrl)));
    await expectTvPlayerCount(tv.page, N);
    // Katılımın ilk okumaları sayılmasın.
    await tv.page.waitForTimeout(3_000);
    await meterReset();
    await tv.page.waitForTimeout(WAIT_MS);
    const m = await meterRead();
    recordMetric("lobbyIdle40s_6players", m);
    // Nabız: 6 telefon × 40/15 ≈ 16 yazma (+ TV'nin 30 sn'lik nabzı).
    expect(m.writes, "telefonlar nabız atmaya devam etmeli").toBeGreaterThanOrEqual(N);
    // Eski model bu sürede ≈ 4N(N+2) × 40/60 ≈ 128 okuma; nabız yalnızca TV'ye
    // düşünce ≈ 16 + TV nabzının N+1 dinleyicisi ≈ 25.
    expect(m.reads, `40 sn lobide ${m.reads} faturalı okuma`).toBeLessThan(60);
  } finally {
    await closeAll(tv, ...phones);
  }
});
