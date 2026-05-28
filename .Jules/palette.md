## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-04-08 - High-Contrast Focus Rings in Dark Themes
**Learning:** In the MediSade high-contrast dark theme (e.g., bg-gray-800 backgrounds), standard browser focus states are completely invisible to keyboard users. Interactive elements cannot just rely on `hover` states; they require explicit, distinct keyboard focus indicators. Furthermore, when dynamically rendering simulation text (like the scanned results), the container needs `role="status"` and `aria-live="polite"` to ensure screen readers reliably announce the updates without interrupting the user.
**Action:** Always explicitly define high-contrast focus rings (e.g., `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) for interactive elements in dark theme setups. Apply polite live regions for non-urgent content updates.
