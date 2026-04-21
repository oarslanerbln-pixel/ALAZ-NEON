## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-04-21 - Accessible Form Inputs and Error States
**Learning:** In forms using customized inputs and Framer Motion components, explicit `htmlFor` and `id` linking is often missed because visual grouping makes it seem obvious. Furthermore, dynamically rendered `motion.div` error messages do not announce to screen readers by default.
**Action:** Always ensure strict `id`/`htmlFor` pairings for custom inputs, and apply `role="alert"` alongside `aria-live="assertive"` to conditional error notification components (like `motion.div`) so they are announced upon entering the DOM.
