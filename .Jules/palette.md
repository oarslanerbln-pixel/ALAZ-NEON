## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-06-13 - High-Contrast Focus Rings for Accessibility
**Learning:** In the MediSade high-contrast dark theme, standard browser focus states are often invisible on dark backgrounds (like bg-gray-800). Users relying on keyboard navigation cannot see which interactive element is focused.
**Action:** Always explicitly define high-contrast focus rings (`focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) for interactive elements to ensure clear keyboard accessibility.
