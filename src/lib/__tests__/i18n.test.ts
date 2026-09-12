import { describe, it, expect, afterEach } from "vitest";

import { t, setLocale, getLocale, type Locale } from "../i18n";

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
