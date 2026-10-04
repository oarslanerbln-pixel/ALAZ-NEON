import { describe, it, expect, afterEach } from "vitest";

import { t, setLocale, getLocale, translations, type Locale } from "../i18n";

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
  const functionEntries = Object.entries(translations).flatMap(([key, entry]) =>
    (["tr", "de", "en"] as const)
      .filter((locale) => typeof (entry as Record<Locale, unknown>)[locale] === "function")
      .map((locale) => ({ key, locale, fn: (entry as Record<Locale, unknown>)[locale] as (...a: unknown[]) => unknown })),
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
