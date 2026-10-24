## 2026-09-17 - Adding ARIA Labels to Language Selectors and Country Selection Options
**Learning:** Icon-only or abbreviation-based interactive elements (like the country flag select and DE/TR/EN buttons) lack screen-reader context for visually impaired users. In multi-lingual apps, explicitly exposing the purpose and state using `aria-label` alongside `aria-pressed` greatly improves navigational confidence.
**Action:** Always add descriptive `aria-label` attributes to abbreviation-based toggle buttons, including dial codes for clarity where appropriate.

## 2024-10-04 - Language Switcher Focus Visibility
**Learning:** Found that custom stylized buttons (like the `LanguageSwitcher` gradient buttons) often lack built-in browser focus rings because `outline-none` or custom borders override them. Keyboard users relying on `Tab` to navigate were losing their place.
**Action:** Always append explicit `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white` utility classes to custom interactive components to guarantee an accessible focus state without impacting pointer/mouse interactions.
## 2023-10-24 - [Keyboard A11y] Keyboard support on custom pointer-event HoldButton components
**Learning:** Custom components using `onPointerDown`/`onPointerUp` (like `HoldButton`) often fail to fire events for keyboard users who press 'Space' or 'Enter'. In typical web flow, 'click' catches keyboard enters natively, but pointer events specifically bypass them.
**Action:** When building interactive components using raw pointer events (e.g. for games or multi-touch), explicitly add `onKeyDown` and `onKeyUp` listeners targeting `Enter` and ` ` to simulate the same start/stop behavior.
