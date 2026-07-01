## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-01 - Dynamic Accessibility and Keyboard Focus
**Learning:** High contrast focus rings and ARIA live regions are essential for visually impaired users. Dynamic content rendering (like scan results) needs 'role="status"' and 'aria-live="polite"' so screen readers announce it naturally.
**Action:** Always apply 'focus-visible' utility rings on interactive elements in high-contrast themes and wrap dynamic results in aria-live regions.
