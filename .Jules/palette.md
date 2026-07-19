## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-07-19 - Dynamic Content Screen Reader Accessibility
**Learning:** When dynamically rendering non-urgent content updates (e.g., scan results), they are often missed by screen readers if not properly marked.
**Action:** Always wrap dynamically appearing non-urgent content containers in `role="status"` and `aria-live="polite"` so they are reliably announced without interrupting the user.
