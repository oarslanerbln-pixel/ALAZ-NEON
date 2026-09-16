import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Misafir gören ekranlarda `aria-label` ve `title` sabit metin olamaz.
 *
 * Bu testin somut bir sebebi var: ses açma/kapama düğmesi hem oyuncunun
 * telefonunda hem TV başlığında `title={isMuted ? "Sesi Aç" : "Sesi Kapat"}`
 * yazıyordu. Düğmenin içinde yalnızca bir ikon var, metin yok — yani ekran
 * okuyucunun okuyabileceği tek şey o başlıktı, ve o başlık dil TR/DE/EN ne
 * seçilirse seçilsin Türkçeydi. Berlin'deki Alman misafir kendi telefonunda
 * "Sesi Kapat" duyuyordu.
 *
 * Aynı hata sınıfı daha önce de yaşandı (bkz. i18nKeys.test.ts'teki sensör
 * notu). Gözle yakalanmıyor çünkü geliştirici zaten Türkçe okuyor.
 *
 * `src/pages/admin/` kapsam dışı: oranın kullanıcısı mekan personeli, misafir
 * değil. Orada Türkçe sabit metin bilinçli bir tercih olabilir.
 */

const GUEST_FACING = [
  join("src", "components"),
  join("src", "pages", "host"),
  join("src", "pages", "player"),
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx$/.test(full) && !full.includes("__tests__") ? [full] : [];
  });
}

/** `aria-label="..."` / `title="..."` — süslü parantezli ifade değil, düz metin. */
const HARDCODED = /\s(aria-label|title)="([^"]*)"/g;

describe("misafir ekranlarında erişilebilir adlar", () => {
  it("aria-label ve title sabit metin değil, t() üzerinden geliyor", () => {
    const offenders: string[] = [];

    for (const root of GUEST_FACING) {
      for (const file of sourceFiles(root)) {
        const src = readFileSync(file, "utf8");
        for (const [, attr, value] of src.matchAll(HARDCODED)) {
          offenders.push(`${file}: ${attr}="${value}"`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
