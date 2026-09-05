## 2026-09-05 - i18n support for Mute/Unmute aria-labels
**Learning:** The Mute/Unmute buttons use hardcoded Turkish titles ("Sesi Aç" / "Sesi Kapat") despite being part of an i18n-supported app (English, German, Turkish). Also, they lack proper `aria-label` for screen reader accessibility on the icon-only button.
**Action:** Replaced hardcoded Turkish text with `t('common.unmute')` and `t('common.mute')` using the useLocale hook for the title. Extracted to proper translations in `i18n.ts`. Added explicit `aria-label` using the same translations to ensure accessibility for non-sighted users.
