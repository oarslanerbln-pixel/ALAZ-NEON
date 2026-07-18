## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-18 - Accessible Dynamically Rendered Results
**Learning:** When dynamically rendering non-urgent content updates like scan results, screen readers may not announce them automatically, leading to a poor experience for visually impaired users. Wrapping the container in `role="status"` and `aria-live="polite"` ensures they are reliably announced without interrupting the user.
**Action:** Always add `role="status"` and `aria-live="polite"` to dynamically rendered content containers that provide non-urgent updates to users.
