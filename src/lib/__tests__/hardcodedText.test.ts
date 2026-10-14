import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, it, expect } from "vitest";

/**
 * Misafirin ve TV'nin gördüğü ekranlarda JSX içine sabit metin yazılmaz;
 * metin `t()` ile gelir. Bu tarama yazıldığında 60'tan fazla sabit metin
 * vardı: Alman misafirin telefonu "HIZLA BAS!", "Senin Katkın:" gösteriyor,
 * giriş sayfası Türk misafire "JETZT BEITRETEN" diyordu. aria-label/title
 * için aynı kural a11yLabels.test.ts'te.
 *
 * İzinli olanlar dilden bağımsız süs öğeleri: oyun ve marka adları, birimler,
 * "hacker" açılışındaki terminal satırları. `src/pages/admin/` kapsam dışı
 * (kullanıcısı mekan personeli).
 */
const GUEST_FACING = [
  join("src", "components"),
  join("src", "pages", "host"),
  join("src", "pages", "player"),
  join("src", "pages", "LandingPage.tsx"),
];

/** Dilden bağımsız süs metinleri (tam eşleşme, boşluklar sadeleştirilmiş). */
const DECORATIVE = new Set([
  // Marka ve oyun adları
  "HENGAME", "QUIZ", "BOMB", "SENSÖR", "SENSOR", "ÇARK", "NEON", "SAVAŞLARI", "NEON WAR",
  "ECHO: Vibe Check", "ALAZ NEON PARTY • BOMB PARTY", "BUZZER!", "OVERCHARGE!", "JOKER",
  // Rozet ve birimler
  "XP", "VS", "⚡ MVP:", "👑 CHAMPION", "GOLD", "SILVER", "BRONZE", "ms", "LIVE TV",
  // Terminal / teşhis satırları (TV açılış animasyonu, hata ekranı)
  "SECURITY BREACH", "CRITICAL SYSTEM FAILURE", "REMOTE IP: 192.168.1.", "PORT: 8080",
  "STATUS: BREACHED", "LIVE TELEMETRY", "AI-TELEMETRY", "> HEDEF_HARF_ÇÖZÜLÜYOR...",
  "DB:", "roomId:", "staff/", "ERR:",
]);

function sourceFiles(path: string): string[] {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path).flatMap((entry) => {
    const full = join(path, entry);
    if (statSync(full).isDirectory()) return entry === "__tests__" ? [] : sourceFiles(full);
    return full.endsWith(".tsx") ? [full] : [];
  });
}

const HAS_WORD = /[A-Za-zÇĞİÖŞÜçğıöşüÄäÖöÜüß]{2,}/u;

function hardcodedTexts(file: string): string[] {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const text = node.getText().replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
      if (HAS_WORD.test(text) && !DECORATIVE.has(text)) {
        const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        found.push(`${file}:${line} "${text}"`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

describe("sabit metin taraması", () => {
  it("misafir ve TV ekranlarında JSX metni t() üzerinden gelir", () => {
    const offenders = GUEST_FACING.flatMap(sourceFiles).flatMap(hardcodedTexts);
    expect(offenders).toEqual([]);
  });
});
