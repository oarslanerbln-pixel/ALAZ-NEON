import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * axe-core ile WCAG 2.1 A/AA denetimi (docs/roadmap.md, 2.11). İhlal testi
 * kırar. Kontrast denetimleri neon arka plan görselleri ve gradyanlar
 * yüzünden çoğunlukla "incomplete" (otomatik karar verilemedi) çıkıyor;
 * bunlar testi kırmaz ama rapora not düşülür (elle gözden geçirme listesi).
 */
export async function expectAccessible(page: Page, screen: string): Promise<void> {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const undecided = result.incomplete.reduce((sum, item) => sum + item.nodes.length, 0);
  if (undecided > 0) {
    test.info().annotations.push({
      type: "a11y-elle-kontrol",
      description: `${screen}: ${result.incomplete.map((i) => `${i.id}×${i.nodes.length}`).join(", ")}`,
    });
  }

  const violations = result.violations.map(
    (v) => `${screen}: ${v.id} (${v.impact}) ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
  );
  expect(violations).toEqual([]);
}
