## 2026-09-17 - Adding ARIA Labels to Language Selectors and Country Selection Options
**Learning:** Icon-only or abbreviation-based interactive elements (like the country flag select and DE/TR/EN buttons) lack screen-reader context for visually impaired users. In multi-lingual apps, explicitly exposing the purpose and state using `aria-label` alongside `aria-pressed` greatly improves navigational confidence.
**Action:** Always add descriptive `aria-label` attributes to abbreviation-based toggle buttons, including dial codes for clarity where appropriate.
## 2025-03-02 - Icon-only buttons lacking ARIA labels
**Learning:** Found an icon-only `<button>` wrapping a `<X />` icon used as a close action in `GameSettingsModal.tsx` that lacked an `aria-label`. This pattern often hinders screen readers which announce only "button".
**Action:** Added `aria-label={t("common.close") || "Close"}` and added the translation string to `src/lib/i18n.ts` for localization. It is critical to ensure translations exist for ARIA labels in multilingual applications.
