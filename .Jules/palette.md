## 2026-09-17 - Adding ARIA Labels to Language Selectors and Country Selection Options
**Learning:** Icon-only or abbreviation-based interactive elements (like the country flag select and DE/TR/EN buttons) lack screen-reader context for visually impaired users. In multi-lingual apps, explicitly exposing the purpose and state using `aria-label` alongside `aria-pressed` greatly improves navigational confidence.
**Action:** Always add descriptive `aria-label` attributes to abbreviation-based toggle buttons, including dial codes for clarity where appropriate.

## 2026-09-28 - Added explicit keyboard navigation and screen-reader context to custom numeric keypads
**Learning:** In highly customized, interactive game components like custom keypads/numpads (e.g., `PlayerVaultController`), native `focus-visible` states are often omitted in favor of mouse/touch `active` or `hover` states. Furthermore, dynamically generated interactive elements (like mapping over keys "0"-"9") might lack explicit `aria-label`s, causing screen readers to misinterpret or skip them entirely.
**Action:** Always add explicit `focus-visible` utility classes (e.g., `focus-visible:ring-2 focus-visible:outline-none`) and assign `aria-label` attributes to all interactive grid elements to ensure consistent keyboard navigability and screen-reader accessibility for visually impaired users.
