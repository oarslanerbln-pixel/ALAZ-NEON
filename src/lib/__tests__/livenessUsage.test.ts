import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * "Oyuncu hâlâ burada mı" kararı yalnızca lib/liveness.ts'te verilir.
 *
 * Sinyal aralığı 15 → 30 sn'ye çıkınca bomba ve echo ekranlarındaki elle
 * yazılmış `now - p.last_active < 30000` kontrolleri canlı oyuncuları
 * aralıklı olarak hayalet saymaya başladı. Eşik tek yerde kalsın diye
 * `last_active` üzerinden süre hesabı başka dosyada yasak.
 */
const SRC = "src";
const LIVENESS = join(SRC, "lib", "liveness.ts");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "__tests__" ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry) && full !== LIVENESS ? [full] : [];
  });
}

describe("canlılık eşiği tek yerde", () => {
  it("last_active ile süre hesabı yalnızca lib/liveness.ts'te yapılıyor", () => {
    const offenders = sourceFiles(SRC).filter((file) =>
      /-\s*[\w.?]*\blast_active\b/.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
