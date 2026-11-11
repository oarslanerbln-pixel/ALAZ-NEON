## 2024-05-18 - Added ARIA labels to icon-only Host buttons
**Learning:** The project uses a custom strict i18n implementation (`src/lib/i18n.ts`) where missing translation keys or incorrectly adding them causes the `i18nKeys.test.ts` test to fail.
**Action:** Always ensure that when adding ARIA labels requiring translations to UI elements, the new translation keys are meticulously added to all three supported languages (DE, TR, EN) in `src/lib/i18n.ts` and verify with `pnpm test`.
