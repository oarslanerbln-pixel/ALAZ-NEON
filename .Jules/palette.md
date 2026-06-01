## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-06-01 - Invisible Focus States in High-Contrast Themes
**Learning:** In high-contrast dark themes (e.g., bg-gray-800 backgrounds), standard focus states on interactive elements like buttons and links are often invisible. This prevents keyboard navigation from being properly accessible. Furthermore, non-urgent dynamic content updates require `role="status"` and `aria-live="polite"` so screen readers can announce them without interrupting the user.
**Action:** Always explicitly define high-contrast focus rings (e.g., `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) for all interactive elements to ensure clear keyboard accessibility, especially in dark mode. Wrap dynamic text updates (like scan results) with polite ARIA live regions.
