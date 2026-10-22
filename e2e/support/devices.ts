import { devices, type Browser, type BrowserContext, type BrowserContextOptions, type Page } from "@playwright/test";

/**
 * Kafedeki telefon karışımı: iPhone ve Android. Hepsi Chromium üzerinde
 * cihaz emülasyonuyla (görüntü alanı, dokunma, user-agent, DPR) koşar;
 * gerçek Safari motoru bu pakette yok (bkz. e2e/README.md).
 */
const PHONE_MODELS = ["iPhone 13", "Pixel 7", "iPhone SE", "Galaxy S9+", "iPhone 14 Pro Max", "Pixel 5"] as const;

export const TV_VIEWPORT = { width: 1920, height: 1080 };

function deviceOptions(name: string): BrowserContextOptions {
  const { defaultBrowserType: _ignored, ...rest } = devices[name] as (typeof devices)[string];
  void _ignored;
  return rest;
}

/** Yalnızca bu makineye (localhost / özel ağ) giden isteklere izin ver. */
function isLocal(url: URL): boolean {
  const h = url.hostname;
  return (
    url.protocol === "data:" ||
    url.protocol === "blob:" ||
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  );
}

export interface Tracked {
  context: BrowserContext;
  page: Page;
  /** Sayfa içi yakalanmamış hatalar ve console.error satırları. */
  errors: string[];
  /** Engellenen dış istekler (üretim Firebase, ücretli TTS, CDN...). */
  blocked: string[];
}

async function track(context: BrowserContext): Promise<Tracked> {
  const blocked: string[] = [];
  await context.route(
    (url) => !isLocal(url),
    (route) => {
      blocked.push(route.request().url());
      return route.abort("blockedbyclient");
    },
  );
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  return { context, page, errors, blocked };
}

export async function openTv(browser: Browser): Promise<Tracked> {
  const context = await browser.newContext({ viewport: TV_VIEWPORT, deviceScaleFactor: 1 });
  return track(context);
}

export async function openPhone(
  browser: Browser,
  index: number,
  extra: BrowserContextOptions = {},
): Promise<Tracked & { model: string }> {
  const model = PHONE_MODELS[index % PHONE_MODELS.length];
  const context = await browser.newContext({ ...deviceOptions(model), ...extra });
  return { ...(await track(context)), model };
}

export async function openDesktop(browser: Browser): Promise<Tracked> {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  return track(context);
}
