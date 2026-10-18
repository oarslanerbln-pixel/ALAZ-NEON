## 2026-09-17 - Adding ARIA Labels to Language Selectors and Country Selection Options
**Learning:** Icon-only or abbreviation-based interactive elements (like the country flag select and DE/TR/EN buttons) lack screen-reader context for visually impaired users. In multi-lingual apps, explicitly exposing the purpose and state using `aria-label` alongside `aria-pressed` greatly improves navigational confidence.
**Action:** Always add descriptive `aria-label` attributes to abbreviation-based toggle buttons, including dial codes for clarity where appropriate.

## 2024-10-04 - Language Switcher Focus Visibility
**Learning:** Found that custom stylized buttons (like the `LanguageSwitcher` gradient buttons) often lack built-in browser focus rings because `outline-none` or custom borders override them. Keyboard users relying on `Tab` to navigate were losing their place.
**Action:** Always append explicit `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white` utility classes to custom interactive components to guarantee an accessible focus state without impacting pointer/mouse interactions.

## $(date +%Y-%m-%d) - Adding accessibility to map-rendered elements
**Learning:** When adding accessibility properties like `aria-label` to elements generated dynamically via a loop (e.g., `EMOJIS.map(emoji => ...)`), it's important to map each dynamic item directly to a translation key. If there isn't a direct structural way to embed descriptive data, using a static dictionary to map values to translation keys works effectively, ensuring each item has a unique, localized accessible name.
**Action:** Always verify that mapped, icon-only buttons receive individualized, translated `aria-label` attributes to ensure screen reader users receive context for each specific interactive element rather than relying on default system behavior.
