import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Kurulabilir uygulama sözleşmesi (docs/roadmap.md, 2.8). Lighthouse'un PWA
 * kategorisi kaldırıldı; tarayıcıların kurulum için baktığı alanlar burada
 * doğrudan denetleniyor.
 */
interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}
const manifest = JSON.parse(readFileSync("public/manifest.json", "utf8")) as Record<string, unknown> & {
  icons: ManifestIcon[];
};
const indexHtml = readFileSync("index.html", "utf8");

/** PNG başlığından gerçek boyut (IHDR: genişlik 16., yükseklik 20. bayttan). */
function pngSize(publicPath: string): string {
  const bytes = readFileSync(join("public", publicPath));
  expect(bytes.subarray(1, 4).toString("ascii")).toBe("PNG");
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

describe("PWA manifest", () => {
  it("kurulum için gereken alanlar tanımlı", () => {
    for (const key of ["id", "name", "short_name", "start_url", "scope", "display", "theme_color", "background_color"]) {
      expect(manifest[key], key).toBeTruthy();
    }
    expect(manifest.display).toBe("standalone");
  });

  it("yön kilitli değil: yatay TV/tablet ve dik telefon aynı kurulu uygulamayı kullanıyor", () => {
    expect(manifest.orientation).toBe("any");
  });

  it("192 ve 512 px PNG ikonlar var ve beyan edilen boyutta", () => {
    for (const size of ["192x192", "512x512"]) {
      const icon = manifest.icons.find((i) => i.type === "image/png" && i.sizes === size && i.purpose !== "maskable");
      expect(icon, size).toBeDefined();
      expect(pngSize(icon!.src)).toBe(size);
    }
  });

  it("maskable ikon var", () => {
    const maskable = manifest.icons.find((i) => i.purpose?.split(" ").includes("maskable"));
    expect(maskable).toBeDefined();
    expect(pngSize(maskable!.src)).toBe(maskable!.sizes);
  });

  it("iOS ana ekran ikonu 180 px PNG", () => {
    const href = indexHtml.match(/<link rel="apple-touch-icon"[^>]*href="([^"]+)"/)?.[1];
    expect(href).toMatch(/\.png$/);
    expect(pngSize(href!)).toBe("180x180");
  });
});
