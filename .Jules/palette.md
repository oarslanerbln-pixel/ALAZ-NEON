## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-05-13 - Explicit Focus States in High-Contrast Dark Themes
**Learning:** In high-contrast dark themes (e.g., using `bg-gray-800` or solid color backgrounds like `bg-blue-600`), the browser's default focus indicators are often completely invisible or lack sufficient contrast, making keyboard navigation nearly impossible to track visually.
**Action:** Always explicitly define high-contrast focus rings (e.g., `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) for all interactive elements (buttons, links, custom clickable divs) to ensure clear and undeniable keyboard accessibility.
