import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

/**
 * Yayın yapılandırması sözleşmesi (docs/roadmap.md, 2.10). Tek hedef Vercel;
 * başlıklar vercel.json'da. Uçtan uca testler aynı CSP'yi zorlayıcı kipte
 * uygulayıp ihlal olmadığını doğruluyor (e2e/support/csp.ts).
 */
interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}
const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as { headers: HeaderRule[] };
const firebase = JSON.parse(readFileSync("firebase.json", "utf8")) as Record<string, unknown>;

function header(source: string, key: string): string | undefined {
  return vercel.headers.find((r) => r.source === source)?.headers.find((h) => h.key === key)?.value;
}

const csp = header("/(.*)", "Content-Security-Policy-Report-Only") ?? header("/(.*)", "Content-Security-Policy") ?? "";
const directive = (name: string) =>
  csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? "";

describe("yayın başlıkları", () => {
  it("tek yayın hedefi: Firebase Hosting tanımlı değil (yanlışlıkla `firebase deploy` yayın yapmasın)", () => {
    expect(firebase).not.toHaveProperty("hosting");
  });

  it("parmak izli paketler bir yıl, değişmez olarak önbelleklenir", () => {
    expect(header("/assets/(.*)", "Cache-Control")).toBe("public, max-age=31536000, immutable");
  });

  it("temel güvenlik başlıkları her yanıtta", () => {
    expect(header("/(.*)", "X-Content-Type-Options")).toBe("nosniff");
    expect(header("/(.*)", "X-Frame-Options")).toBe("DENY");
    expect(header("/(.*)", "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header("/(.*)", "Strict-Transport-Security")).toMatch(/max-age=\d{8,}/);
  });

  it("Permissions-Policy ekran kilidine izin verir (2.5), kamera/mikrofon/konumu kapatır", () => {
    const policy = header("/(.*)", "Permissions-Policy") ?? "";
    expect(policy).toContain("screen-wake-lock=(self)");
    for (const feature of ["camera=()", "microphone=()", "geolocation=()"]) expect(policy).toContain(feature);
  });

  it("CSP betikleri kısıtlar: satır içi/eval yok, eklenti yok, çerçevelenemez", () => {
    expect(directive("script-src")).not.toMatch(/'unsafe-inline'|'unsafe-eval'|\*/);
    expect(directive("object-src")).toBe("object-src 'none'");
    expect(directive("frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive("base-uri")).toBe("base-uri 'self'");
  });

  it("CSP uygulamanın gerçekten konuştuğu yerlere izin verir", () => {
    expect(directive("connect-src")).toContain("https://*.googleapis.com"); // Firestore, Auth, App Check
    expect(directive("connect-src")).toContain("https://*.sentry.io");
    expect(directive("script-src")).toContain("https://www.google.com/recaptcha/"); // App Check, telefon girişi
    expect(directive("style-src")).toContain("https://fonts.googleapis.com");
    expect(directive("font-src")).toContain("https://fonts.gstatic.com");
  });
});
