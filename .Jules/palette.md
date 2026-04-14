## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-04-14 - Framer Motion Dynamic Validation Accessibility
**Learning:** Animated components in Framer Motion (like `<motion.div>`) that are used for dynamic states, such as conditional form validation error messages, do not automatically announce themselves to screen readers upon rendering.
**Action:** Always explicitly define `role="alert"` and `aria-live="assertive"` on dynamically rendered animated elements to ensure screen readers immediately announce validation feedback.
