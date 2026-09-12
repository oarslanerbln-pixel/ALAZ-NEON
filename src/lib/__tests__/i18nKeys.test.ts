import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Kaynak ağacındaki her `t("düz.anahtar")` çağrısının i18n.ts'te gerçekten
 * tanımlı olduğunu doğrular.
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
    return isSource && full !== join(SRC, "lib", "i18n.ts") ? [full] : [];
  });
}

function definedKeys(): Set<string> {
  const src = readFileSync(join(SRC, "lib", "i18n.ts"), "utf8");
  return new Set([...src.matchAll(/^ {2}"([a-zA-Z0-9_.]+)":/gm)].map((m) => m[1]));
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

  it("her anahtar üç dilde de tanımlı", () => {
    const src = readFileSync(join(SRC, "lib", "i18n.ts"), "utf8");
    const incomplete: string[] = [];

    // Değerler fonksiyon da olabiliyor (interpolasyonlu anahtarlar), bu
    // yüzden süslü parantezler sayılarak dengeli okunuyor — düz regex
    // ok fonksiyonlarının içindeki `}` yüzünden erken kapanıyordu.
    for (const m of src.matchAll(/^ {2}"([a-zA-Z0-9_.]+)":\s*\{/gm)) {
      let depth = 0;
      let i = m.index! + m[0].length - 1;
      for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}" && --depth === 0) break;
      }
      const value = src.slice(m.index! + m[0].length, i);
      if (!/\btr\s*:/.test(value) || !/\bde\s*:/.test(value) || !/\ben\s*:/.test(value)) {
        incomplete.push(m[1]);
      }
    }

    expect(incomplete).toEqual([]);
  });
});
