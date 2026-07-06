## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-06 - High Contrast Focus & Aria-Live Updates
**Learning:** Dynamic non-urgent content updates (like scan results) require `role="status"` and `aria-live="polite"` so screen readers announce them without interrupting the user. Additionally, interactive elements in high-contrast or dark modes need explicit, high-visibility focus indicators (like a yellow ring) because default browser outlines can be invisible.
**Action:** Always wrap dynamically rendered text containers with `role="status" aria-live="polite"` and explicitly add `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none` to all interactive buttons and links in dark mode UIs.
