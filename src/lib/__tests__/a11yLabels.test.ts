import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
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

/**
 * Yapısal erişilebilirlik taraması (docs/roadmap.md, 2.11) — TS AST ile.
 * İlk taramada 5 adsız ikon düğmesi, 3 `alt`'sız görsel, 6 klavyeyle
 * erişilemeyen tıklanabilir öğe ve 11 etiketle ilişkilendirilmemiş girdi
 * çıktı; hepsi düzeltildi ve bu test geri gelmelerini engelliyor.
 */
const STRUCTURAL_ROOTS = [...GUEST_FACING, join("src", "pages", "auth")];

interface Finding {
  rule: string;
  where: string;
}

function structuralFindings(): Finding[] {
  const findings: Finding[] = [];
  for (const root of STRUCTURAL_ROOTS) {
    for (const file of sourceFiles(root)) {
      const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const where = (node: ts.Node) => `${file}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;

      const visit = (node: ts.Node, insideForm: boolean) => {
        const open = ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
        let form = insideForm;
        if (open) {
          const tag = open.tagName.getText();
          const props = open.attributes.properties;
          const spread = props.some(ts.isJsxSpreadAttribute);
          const has = (name: string) => props.some((p) => ts.isJsxAttribute(p) && p.name.getText() === name);
          const named = has("aria-label") || has("aria-labelledby") || has("title");
          if (tag === "form") form = true;

          if (!spread && (tag === "button" || tag === "motion.button")) {
            if (!named && !(ts.isJsxElement(node) && hasTextContent(node))) {
              findings.push({ rule: "ikon düğmesinin erişilebilir adı yok", where: where(node) });
            }
            // Form içindeki tipsiz düğme "gönder" sayılır: takma adda Enter
            // oyuncunun oturumunu kapatıyordu (2.1'de bulunan hata).
            if (form && !has("type")) findings.push({ rule: "form içinde tipsiz düğme", where: where(node) });
          }
          if (!spread && (tag === "img" || tag === "motion.img") && !has("alt")) {
            findings.push({ rule: "görselde alt yok (süs ise alt=\"\")", where: where(node) });
          }
          if (/^(motion\.)?(div|span|li|p)$/.test(tag) && has("onClick") && !has("role")) {
            findings.push({ rule: "tıklanabilir öğe klavyeyle erişilemiyor (role/tabIndex)", where: where(node) });
          }
          if (!spread && (tag === "input" || tag === "motion.input") && !named && !has("id")) {
            findings.push({ rule: "girdinin erişilebilir adı yok", where: where(node) });
          }
        }
        ts.forEachChild(node, (child) => visit(child, form));
      };
      visit(sf, false);
    }
  }
  return findings;
}

/** Düğmenin görünür metni var mı (JSX metni ya da `{ifade}` çocuk). */
function hasTextContent(element: ts.JsxElement): boolean {
  let found = false;
  const visit = (node: ts.Node) => {
    if (found || ts.isJsxAttributes(node)) return;
    if (ts.isJsxText(node) && node.getText().trim()) found = true;
    else if (ts.isJsxExpression(node) && node.expression && !ts.isJsxAttribute(node.parent)) found = true;
    else ts.forEachChild(node, visit);
  };
  element.children.forEach(visit);
  return found;
}

describe("misafir ekranlarında yapısal erişilebilirlik", () => {
  const findings = structuralFindings();
  const byRule = (rule: string) => findings.filter((f) => f.rule === rule).map((f) => f.where);

  it("ikon düğmelerinin erişilebilir adı var", () => {
    expect(byRule("ikon düğmesinin erişilebilir adı yok")).toEqual([]);
  });

  it("görsellerde alt özniteliği var", () => {
    expect(byRule('görselde alt yok (süs ise alt="")')).toEqual([]);
  });

  it("tıklanabilir div/span'ler role taşıyor", () => {
    expect(byRule("tıklanabilir öğe klavyeyle erişilemiyor (role/tabIndex)")).toEqual([]);
  });

  it("girdilerin erişilebilir adı var", () => {
    expect(byRule("girdinin erişilebilir adı yok")).toEqual([]);
  });

  it("form içindeki düğmelerin tipi açık", () => {
    expect(byRule("form içinde tipsiz düğme")).toEqual([]);
  });
});
