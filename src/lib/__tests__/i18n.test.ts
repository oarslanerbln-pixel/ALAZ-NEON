import { describe, it, expect, afterEach, vi } from "vitest";

import { t, setLocale, getLocale, loadLocale, type Locale } from "../i18n";
import { de } from "../i18n/de";
import { tr } from "../i18n/tr";
import { en } from "../i18n/en";

describe("t()", () => {
  const original = getLocale();
  afterEach(() => setLocale(original));

  it("seçili dilde çeviriyi döndürüyor", () => {
    setLocale("de");
    expect(t("common.back")).toBe("STARTSEITE");
    setLocale("tr");
    expect(t("common.back")).toBe("ANA SAYFA");
  });

  it("üç dilin tamamında tanımlı", () => {
    for (const locale of ["tr", "de", "en"] as Locale[]) {
      setLocale(locale);
      expect(t("common.back").length).toBeGreaterThan(0);
    }
  });

  it("interpolasyonlu anahtarlar argümanı kullanıyor", () => {
    setLocale("tr");
    expect(t("dashboard.playersCount", 7)).toContain("7");
  });

  it("tanımsız anahtarda verilen yedek metni döndürüyor", () => {
    // Kod tabanında `t("x", "Yedek")` deseni 44 yerde kullanılıyor ve
    // çağıranlar ikinci argümanı yedek sanıyor. Yazım hatasında ekrana ham
    // anahtar basılmasın diye niyete uyuluyor.
    expect(t("yok.boyle.bir.anahtar" as never, "Yedek Metin")).toBe("Yedek Metin");
  });

  it("yedek metin yoksa anahtarın kendisini döndürüyor", () => {
    expect(t("yok.boyle.bir.anahtar" as never)).toBe("yok.boyle.bir.anahtar");
  });
});

/**
 * Parametreli çevirilerin hepsi üç dilde de çalıştırılıyor. Anahtar
 * denetimi (i18nKeys.test.ts) yalnızca varlığa bakıyor; bir çeviri
 * fonksiyonundaki eksik parametre ya da yanlış metot çağrısı ancak o ekran
 * açılınca "undefined"/"NaN" basıyor ya da çöküyordu.
 */
describe("parametreli çeviriler", () => {
  const dictionaries: Record<Locale, Record<string, unknown>> = { de, tr, en };
  const functionEntries = (Object.entries(dictionaries) as [Locale, Record<string, unknown>][]).flatMap(
    ([locale, dictionary]) =>
      Object.entries(dictionary)
        .filter(([, value]) => typeof value === "function")
        .map(([key, fn]) => ({ key, locale, fn: fn as (...a: unknown[]) => unknown })),
  );

  it("en az bir parametreli çeviri var (dedektör çalışıyor)", () => {
    expect(functionEntries.length).toBeGreaterThan(10);
  });

  it.each(functionEntries.map((e) => [`${e.locale}:${e.key}`, e] as const))("%s", (_name, { fn }) => {
    // Parametre türü çeviriden çeviriye değişiyor (sayı ya da metin): sayıyla
    // dene, metin metodu çağıran çeviri için metinle dene.
    const arity = Math.max(fn.length, 1);
    const attempt = (arg: (i: number) => unknown) => {
      try {
        return fn(...Array.from({ length: arity }, (_, i) => arg(i)));
      } catch {
        return undefined;
      }
    };
    const result = attempt((i) => i + 2) ?? attempt((i) => `X${i}`);
    expect(typeof result).toBe("string");
    expect(result).not.toMatch(/undefined|NaN|\[object Object\]/);
    expect((result as string).trim().length).toBeGreaterThan(0);
  });
});

describe("dil başına tembel yükleme", () => {
  it("üç sözlük aynı anahtar kümesine sahip", () => {
    const keys = Object.keys(de).sort();
    expect(Object.keys(tr).sort()).toEqual(keys);
    expect(Object.keys(en).sort()).toEqual(keys);
  });

  it("yüklenmiş dile geçiş anında olur ve tercih kaydedilir", async () => {
    await loadLocale("en");
    await setLocale("en");
    expect(getLocale()).toBe("en");
    expect(localStorage.getItem("alaz_neon_locale")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });

  /** Sözlükleri henüz inmemiş, taze bir i18n modülü (uygulamanın açılış hâli). */
  async function freshI18n() {
    vi.resetModules();
    return import("../i18n");
  }

  it("inmemiş dil indirilene kadar ekran eski dilde kalır; arka arkaya seçimde sonuncusu kazanır", async () => {
    const i18n = await freshI18n();
    expect(i18n.getLocale()).toBe("de");

    const first = i18n.setLocale("tr");
    const second = i18n.setLocale("en");
    expect(i18n.getLocale()).toBe("de"); // henüz inmedi
    expect(i18n.t("common.back")).toBe("STARTSEITE");

    await Promise.all([first, second]);
    expect(i18n.getLocale()).toBe("en");
    expect(i18n.t("common.back")).toBe("HOME");
  });

  it("sözlük indirilemezse dil değişmez ve hata fırlatılmaz", async () => {
    vi.doMock("../i18n/tr", () => {
      throw new Error("ağ yok");
    });
    try {
      const i18n = await freshI18n();
      await expect(i18n.setLocale("tr")).resolves.toBeUndefined();
      expect(i18n.getLocale()).toBe("de");
    } finally {
      vi.doUnmock("../i18n/tr");
    }
  });

  it("kayıtlı dil açılışta yüklenir (localeReady)", async () => {
    localStorage.setItem("alaz_neon_locale", "tr");
    const i18n = await freshI18n();
    await i18n.localeReady;
    expect(i18n.getLocale()).toBe("tr");
    expect(i18n.t("common.back")).toBe("ANA SAYFA");
  });
});
