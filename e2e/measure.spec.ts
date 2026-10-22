import { test, expect, type Browser, type Page } from "@playwright/test";
import {
  closeAll,
  expectTvPlayerCount,
  joinFromQr,
  newPhone,
  openNight,
  scanTvQr,
  startGameFromDashboard,
  type Phone,
} from "./support/cafe";
import { playQuiz, skipHostTutorial, wrongOption } from "./support/games";
import { adminGet, clearAuth, clearFirestore, meterRead, meterReset } from "./support/emulator";
import { recordMetric, summarize } from "./support/metrics";

/**
 * Ölçüm turu (`npm run test:e2e:measure`). Sonuçlar e2e-results/metrics.json.
 *
 * - Firestore okuma/yazma: emülatör önündeki sayaçlı vekilden (bkz.
 *   e2e/support/firestore-meter.mjs). Gece lobisinde bekleme, katılım ve
 *   5 soruluk quiz ayrı ayrı; 20 ve 40 oyuncu (E2E_MEASURE_PLAYERS).
 * - QR → TV'de görünme ve cevap → TV gecikmesi: aynı makinenin saatiyle.
 *   Emülatör yerel; üretimde buna Firestore bölgesine gidiş-dönüş eklenir.
 * - TV kare hızı ve taşma: 1080p ve 4K, CPU kısıtsız ve 4× yavaş (TV kutusu).
 */
const SIZES = (process.env.E2E_MEASURE_PLAYERS ?? "20,40").split(",").map(Number);
const LOBBY_IDLE_MS = 60_000;

test.beforeEach(async () => {
  await clearFirestore();
  await clearAuth();
});

/** Ölçüm telefonları: görsel/medya indirmez, animasyon azaltılmış — bellek için. */
async function lightPhone(browser: Browser, i: number): Promise<Phone> {
  const p = await newPhone(browser, i, `M${String(i + 1).padStart(2, "0")}`);
  await p.context.route(/\.(png|jpe?g|webp|mp4|webm|mp3)(\?|$)/, (r) => r.abort());
  return p;
}

for (const N of SIZES) {
  test(`Firestore yükü ve gecikme — ${N} oyuncu`, async ({ browser }) => {
    test.setTimeout(20 * 60_000);
    const tv = await openNight(browser);
    const phones: Phone[] = [];
    try {
      const joinUrl = await scanTvQr(tv);
      for (let i = 0; i < N; i++) phones.push(await lightPhone(browser, i));

      // Katılım: ilk 8 telefon tek tek (QR → TV sayacı gecikmesi), kalanı 8'li gruplar.
      await meterReset();
      const joinMs: number[] = [];
      for (let i = 0; i < Math.min(8, N); i++) {
        await armCountProbe(tv.page, i + 1);
        const t0 = Date.now();
        await joinFromQr(phones[i], joinUrl);
        joinMs.push((await countProbe(tv.page)) - t0);
      }
      for (let i = 8; i < N; i += 8) await Promise.all(phones.slice(i, i + 8).map((p) => joinFromQr(p, joinUrl)));
      await expectTvPlayerCount(tv.page, N, 60_000);
      const joinOps = await meterRead();

      // Gece lobisinde 60 sn bekleme: yalnızca nabız (heartbeat) trafiği.
      await meterReset();
      await tv.page.waitForTimeout(LOBBY_IDLE_MS);
      const idle = await meterRead();

      // 5 soruluk quiz, herkes cevaplar.
      await meterReset();
      await startGameFromDashboard(tv.page, "QUIZ", async (m) => {
        await m.getByRole("button", { name: "5 Fragen" }).click();
        await m.getByRole("button", { name: "30 Sek" }).click();
      });
      const quiz = await playQuiz(tv, phones, 5, (p, q, c) => ((p + q) % 2 ? c : wrongOption(c, p)));
      await expect(tv.page.getByText("HENGAME CHAMPION")).toBeVisible({ timeout: 60_000 });
      const quizOps = await meterRead();

      recordMetric(`players${N}`, {
        joinLatencyMs: summarize(joinMs),
        answerLatencyMs: summarize(quiz.answerLatencyMs),
        burstLatencyMs: summarize(quiz.burstLatencyMs),
        joinPhase: joinOps,
        lobbyIdle60s: idle,
        lobbyReadsPerMinute: Math.round((idle.reads / idle.elapsedMs) * 60_000),
        quiz5Questions: quizOps,
      });
    } finally {
      await closeAll(tv, ...phones);
    }
  });
}

async function armCountProbe(tv: Page, n: number): Promise<void> {
  await tv.evaluate((n) => {
    const want = `Spieler (${n})`;
    const w = window as unknown as { __count?: number | null };
    w.__count = null;
    const obs = new MutationObserver(() => {
      if (w.__count == null && document.body.innerText.includes(want)) {
        w.__count = Date.now();
        obs.disconnect();
      }
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true });
  }, n);
}

async function countProbe(tv: Page): Promise<number> {
  const h = await tv.waitForFunction(() => (window as unknown as { __count?: number | null }).__count ?? null, undefined, { timeout: 30_000 });
  return (await h.jsonValue()) as number;
}

/** Sayfada `ms` boyunca requestAnimationFrame sayar; ortalama ve en kötü kare. */
async function measureFps(page: Page, ms = 5_000) {
  return page.evaluate(async (ms) => {
    const frames: number[] = [];
    let last = performance.now();
    const end = last + ms;
    await new Promise<void>((resolve) => {
      const tick = (t: number) => {
        frames.push(t - last);
        last = t;
        if (t < end) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    const sorted = [...frames].sort((a, b) => a - b);
    return {
      fps: Math.round((frames.length / ms) * 1000),
      p95FrameMs: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
      longFrames: frames.filter((f) => f > 50).length,
    };
  }, ms);
}

/** TV taşması: tuval dışına çıkan görünür öğe ve kaydırma çubuğu. */
async function measureOverflow(page: Page) {
  return page.evaluate(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width === 0 || r.height === 0 || cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
      if (cs.position === "fixed" && el.closest("[aria-hidden='true']")) continue;
      if ((r.right > W + 2 || r.bottom > H + 2) && el.innerText?.trim() && el.children.length === 0) {
        out.push(`${el.tagName.toLowerCase()} "${el.innerText.trim().slice(0, 30)}" ${Math.round(r.right)}x${Math.round(r.bottom)}`);
      }
    }
    const se = document.scrollingElement!;
    return { pageScroll: se.scrollHeight > H + 2 || se.scrollWidth > W + 2, outside: out.slice(0, 10) };
  });
}

test("TV kare hızı ve taşma — 1080p ve 4K", async ({ browser }) => {
  test.setTimeout(10 * 60_000);
  const results: Record<string, unknown> = {};
  const tv = await openNight(browser);
  const joinUrl = await scanTvQr(tv);
  const phones: Phone[] = [];
  for (let i = 0; i < 12; i++) phones.push(await lightPhone(browser, i));
  const cdp = await tv.context.newCDPSession(tv.page);
  // Aynı TV sayfası iki çözünürlükte: ikinci bir sekme host olmadığı için
  // oyunu ilerletemez, ölçüm gerçek host ekranında yapılıyor.
  const sample = async (key: string) => {
    for (const [label, viewport] of [
      ["1080p", { width: 1920, height: 1080 }],
      ["4K", { width: 3840, height: 2160 }],
    ] as const) {
      await tv.page.setViewportSize(viewport);
      await tv.page.waitForTimeout(1_500);
      const free = await measureFps(tv.page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      const cpu4x = await measureFps(tv.page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      results[`${key}_${label}`] = { free, cpu4x, overflow: await measureOverflow(tv.page) };
    }
    await tv.page.setViewportSize({ width: 1920, height: 1080 });
  };
  try {
    await Promise.all(phones.map((p) => joinFromQr(p, joinUrl)));
    await expectTvPlayerCount(tv.page, 12);
    await tv.page.waitForTimeout(3_000);
    await sample("nightLobby12");

    await startGameFromDashboard(tv.page, "QUIZ", async (m) => {
      await m.getByRole("button", { name: "5 Fragen" }).click();
      await m.getByRole("button", { name: "30 Sek" }).click();
    });
    await expect.poll(async () => (await adminGet(`rooms/${tv.roomId}`))?.status, { timeout: 15_000 }).toMatch(/tutorial|quiz_intro/);
    if ((await adminGet(`rooms/${tv.roomId}`))?.status === "tutorial") await skipHostTutorial(tv);
    await tv.page.getByRole("button", { name: "TIMER STARTEN" }).click({ timeout: 60_000 });
    await expect(tv.page.getByText(/SPIELER BEREIT/)).toBeVisible();
    await sample("quizQuestion");
    recordMetric("tvFrames", results);
  } finally {
    await closeAll(tv, ...phones);
  }
});
