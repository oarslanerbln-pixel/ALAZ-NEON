import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it, expect } from "vitest";

import { SYNTH_FALLBACK } from "../audio";

/**
 * public/ sözleşmesi (docs/roadmap.md, 2.2).
 *
 * Kodun istediği her dosya public/'te var; public/'teki her dosya bir yerde
 * kullanılıyor; görseller bütçe içinde. Bu test yokken 16 ekran var olmayan
 * `/noise.png` ve `/grid.svg`'yi istiyordu (her yüklemede 404) ve kimsenin
 * kullanmadığı ~8 MB görsel her dağıtımda taşınıyordu.
 */
const PUBLIC = "public";
const SOURCES = ["src", "index.html", join(PUBLIC, "manifest.json")];

const IMAGE_BUDGET = 150 * 1024;
const PUBLIC_BUDGET = 4 * 1024 * 1024;

/** Ses dosyası yoksa synth karşılığı çalar (lib/audio.ts); eksikliği hata değil. */
const OPTIONAL = new Set(Object.keys(SYNTH_FALLBACK));
/** Kodun değil insanların okuduğu dosyalar. */
const NOT_SERVED = /\.md$/;

const ASSET_REF =
  /(?<=["'`(])\/[\w./-]+\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp3|wav|ogg|m4a|mp4|webm|json)(?=["'`)?#])/g;

function walk(path: string): string[] {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path).flatMap((entry) =>
    entry === "__tests__" ? [] : walk(join(path, entry)),
  );
}

function referencedAssets(): Set<string> {
  const refs = new Set<string>();
  for (const file of SOURCES.flatMap(walk)) {
    if (!/\.(tsx?|css|html|json)$/.test(file)) continue;
    for (const match of readFileSync(file, "utf8").matchAll(ASSET_REF)) refs.add(match[0]);
  }
  return refs;
}

const publicFiles = walk(PUBLIC).map((file) => ({
  url: `/${relative(PUBLIC, file).split("\\").join("/")}`,
  size: statSync(file).size,
}));

describe("public/ varlıkları", () => {
  const refs = referencedAssets();
  const served = new Set(publicFiles.map((f) => f.url));

  it("kodun istediği her dosya public/'te var (404 yok)", () => {
    const missing = [...refs].filter((url) => !served.has(url) && !OPTIONAL.has(url));
    expect(missing).toEqual([]);
  });

  it("public/'teki her dosya bir yerde kullanılıyor (ölü varlık yok)", () => {
    const unused = publicFiles
      .filter((f) => !NOT_SERVED.test(f.url) && !refs.has(f.url))
      .map((f) => f.url);
    expect(unused).toEqual([]);
  });

  it("her görsel ≤ 150 KB (scripts/optimize-images.mjs)", () => {
    const heavy = publicFiles
      .filter((f) => /\.(png|jpe?g|webp|avif|gif)$/.test(f.url) && f.size > IMAGE_BUDGET)
      .map((f) => `${f.url}: ${Math.round(f.size / 1024)} KB`);
    expect(heavy).toEqual([]);
  });

  it("public/ toplamı < 4 MB", () => {
    const total = publicFiles.reduce((sum, f) => sum + f.size, 0);
    expect(total).toBeLessThan(PUBLIC_BUDGET);
  });

  it("dedektör gerçekten referans buluyor (boş küme testleri anlamsızlaştırır)", () => {
    expect(refs.has("/noise.png")).toBe(true);
    expect(refs.has("/bg-shisha-1.avif")).toBe(true);
  });
});
