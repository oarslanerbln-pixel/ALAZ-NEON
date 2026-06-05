## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-06-05 - High Contrast Focus and Dynamic Regions
**Learning:** In high-contrast dark themes (e.g., bg-gray-800 backgrounds), standard browser focus rings are often completely invisible, breaking keyboard accessibility. Additionally, conditionally rendered async content (like scan results) will not be announced by screen readers.
**Action:** Always explicitly define high-contrast focus styles using Tailwind (e.g., `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) on all interactive elements. For dynamic content containers (like search or scan results), ensure they include `role="status"` and `aria-live="polite"` so screen readers are reliably updated without disrupting the user.
