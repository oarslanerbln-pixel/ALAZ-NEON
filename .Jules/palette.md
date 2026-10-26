## 2026-09-17 - Adding ARIA Labels to Language Selectors and Country Selection Options
**Learning:** Icon-only or abbreviation-based interactive elements (like the country flag select and DE/TR/EN buttons) lack screen-reader context for visually impaired users. In multi-lingual apps, explicitly exposing the purpose and state using `aria-label` alongside `aria-pressed` greatly improves navigational confidence.
**Action:** Always add descriptive `aria-label` attributes to abbreviation-based toggle buttons, including dial codes for clarity where appropriate.

## 2024-10-04 - Language Switcher Focus Visibility
**Learning:** Found that custom stylized buttons (like the `LanguageSwitcher` gradient buttons) often lack built-in browser focus rings because `outline-none` or custom borders override them. Keyboard users relying on `Tab` to navigate were losing their place.
**Action:** Always append explicit `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white` utility classes to custom interactive components to guarantee an accessible focus state without impacting pointer/mouse interactions.

## 2024-10-26 - Form Input and Label Associations
**Learning:** In React components like `PlayerJoin`, standard `<label>` elements were being styled as text wrappers without the `htmlFor` attribute, meaning screen readers and click-to-focus behaviors were broken. Although the visual UI looks identical, not having this explicit connection harms accessibility and mobile usability.
**Action:** Always verify that every `<label>` has an `htmlFor` property matching its target `<input>`'s `id` attribute in form components.
