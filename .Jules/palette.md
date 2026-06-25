## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-06-25 - High-Contrast Focus & Disabled States
**Learning:** In MediSade's dark theme, default focus rings are invisible, disabled buttons lack cursor feedback, and dynamically loaded scan results are missed by screen readers.
**Action:** Apply `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none` to interactive elements, `disabled:cursor-not-allowed` to disabled buttons, and `role="status" aria-live="polite"` to dynamically rendered results.
