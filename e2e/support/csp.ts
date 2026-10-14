import type { Page } from "@playwright/test";

/**
 * Önizleme sunucusu üretimdeki CSP'yi zorlayıcı kipte uyguluyor
 * (vite.config.ts → previewHeaders). Bu betik engellenen her isteği kaydeder;
 * testler sonunda listenin boş olduğunu doğrular — politika bir gün
 * Report-Only'den zorlamaya geçince hiçbir akışın kırılmayacağının kanıtı.
 */
export const CSP_INIT_SCRIPT = `(() => {
  const violations = [];
  Object.defineProperty(window, "__e2eCspViolations", { value: violations });
  document.addEventListener("securitypolicyviolation", (e) => {
    violations.push(e.violatedDirective + " ← " + (e.blockedURI || "inline"));
  });
})();`;

export function cspViolations(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __e2eCspViolations: string[] }).__e2eCspViolations);
}
