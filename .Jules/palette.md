## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-06-21 - High-Contrast Focus & Disabled States
**Learning:** In high-contrast dark themes, default focus rings are often invisible. Explicit focus-visible styling (e.g., ring-yellow-400) is crucial for keyboard accessibility. Also, opacity alone is insufficient for disabled states; cursor-not-allowed adds necessary visual feedback.
**Action:** Always explicitly define high-contrast focus rings and cursor-not-allowed for disabled interactive elements.
