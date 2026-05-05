## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-05-05 - Form Accessibility and State Announcements
**Learning:** In dynamically rendered React components (like the PlayerJoin form), input validation errors that appear conditionally are often missed by screen readers if they lack semantic meaning. Furthermore, dynamic loading states on submit buttons must be explicitly announced.
**Action:** Always link form `<label>`s and `<input>`s with `htmlFor` and `id`. Conditionally rendered error messages must use `role="alert"` and `aria-live="assertive"`. Form submit buttons toggling loading states should leverage `aria-busy={isLoading}`.
