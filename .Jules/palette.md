## 2026-09-01 - [Icon-only Buttons and i18n]
**Learning:** In multi-language applications, tooltips and screen reader announcements for icon-only buttons need to be dynamic. The 'title' attribute was hardcoded to English in 'PlayerHeader.tsx', and the 'aria-label' was missing entirely, which is a major accessibility oversight.
**Action:** Always add 'aria-label' attributes to icon-only buttons, and ensure both 'title' and 'aria-label' use the localization hook 't()' for multi-language support.
