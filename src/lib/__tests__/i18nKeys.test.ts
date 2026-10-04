import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

import { de } from "../i18n/de";

/**
 * Kaynak ağacındaki her `t("düz.anahtar")` çağrısının i18n.ts'te gerçekten
 * tanımlı olduğunu doğrular (kaynak sözlük i18n/de.ts).
 *
 * Bu testin var olma sebebi somut: sensör modunda iki çağrı
 * `t("sensor.watchMainScreen" as never) || "Ana Ekranı Takip Edin"`
 * şeklinde yazılmıştı. Yazan kişi anahtar yoksa `||` devreye girer sanmış,
 * ama t() tanımsız anahtarda ANAHTARIN KENDİSİNİ döndürüyor — truthy, yani
 * yedek hiç çalışmıyor. Misafirin telefonunda ekranda düz metin olarak
 * "sensor.watchMainScreen" yazıyordu.
 */

const SRC = "src";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    // i18n.ts'in kendisi hariç: doküman yorumlarında örnek t() çağrıları var.
    const isSource = /\.tsx?$/.test(entry) && !full.includes("__tests__");
    return isSource && !full.startsWith(join(SRC, "lib", "i18n")) ? [full] : [];
  });
}

function definedKeys(): Set<string> {
  return new Set(Object.keys(de));
}

describe("i18n anahtar bütünlüğü", () => {
  it("t() ile çağrılan her düz anahtar tanımlı", () => {
    const keys = definedKeys();
    // `\bt(` sınırı önemli: aksi hâlde getContext("2d"), searchParams.get("code")
    // gibi çağrılar da eşleşir.
    const call = /(?<![a-zA-Z0-9_$.])t\(\s*"([a-zA-Z0-9_.]+)"/g;
    const missing: string[] = [];

    for (const file of sourceFiles(SRC)) {
      const content = readFileSync(file, "utf8");
      for (const m of content.matchAll(call)) {
        if (!keys.has(m[1])) missing.push(`${file}: ${m[1]}`);
      }
    }

    expect(missing).toEqual([]);
  });

  // "Her anahtar üç dilde de tanımlı" denetimi derleme zamanına taşındı:
  // tr.ts ve en.ts `satisfies Dictionary` ile de.ts'in anahtarlarını ve
  // türlerini birebir karşılamak zorunda. Çalışma zamanı eşitliği i18n.test.ts'te.
});
