## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-06-22 - MediSade High Contrast & ARIA Live Regions
**Learning:** In MediSade's high-contrast dark theme, standard focus states are invisible. Explicitly defining `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none` and `disabled:cursor-not-allowed` is crucial for keyboard navigation and feedback. Furthermore, dynamically rendered scan results must be wrapped in `role="status"` and `aria-live="polite"` to ensure screen readers reliably announce the text summary updates without interrupting the user.
**Action:** Always include high-contrast focus rings for interactive elements and use `role="status"` on dynamic result containers in dark theme UI.
