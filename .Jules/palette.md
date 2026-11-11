## 2026-09-17 - Adding ARIA Labels to Language Selectors and Country Selection Options
**Learning:** Icon-only or abbreviation-based interactive elements (like the country flag select and DE/TR/EN buttons) lack screen-reader context for visually impaired users. In multi-lingual apps, explicitly exposing the purpose and state using `aria-label` alongside `aria-pressed` greatly improves navigational confidence.
**Action:** Always add descriptive `aria-label` attributes to abbreviation-based toggle buttons, including dial codes for clarity where appropriate.

## 2024-10-04 - Language Switcher Focus Visibility
**Learning:** Found that custom stylized buttons (like the `LanguageSwitcher` gradient buttons) often lack built-in browser focus rings because `outline-none` or custom borders override them. Keyboard users relying on `Tab` to navigate were losing their place.
**Action:** Always append explicit `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white` utility classes to custom interactive components to guarantee an accessible focus state without impacting pointer/mouse interactions.
## 2024-10-27 - Custom Buttons without Focus Visible
**Learning:** We noticed custom buttons (e.g. `Quick Mute`, `Leave Game` in `PlayerHeader.tsx`) had their default focus indicators removed or hidden without explicitly providing a visible focus state. While standard buttons may have browser defaults, custom-styled utility buttons need to handle this manually for keyboard users relying on 'Tab' navigation.
**Action:** Always append the `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white` Tailwind utilities to custom interactables to guarantee an accessible outline state for keyboard users that won't disrupt pointing device interactions.
