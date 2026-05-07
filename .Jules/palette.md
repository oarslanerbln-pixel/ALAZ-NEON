## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-05-07 - Dynamic States and Form Accessibility
**Learning:** Animated dynamic messages (like Framer Motion's `motion.div` for error messages) are not automatically announced by screen readers when they appear on screen. Furthermore, forms rely on explicit connections between `<label>` and `<input>` using `htmlFor` and `id`.
**Action:** Always add `role="alert"` and `aria-live="assertive"` to dynamically rendered error or success messages. Ensure all `<input>` elements have a unique `id` explicitly matched by their `<label>`'s `htmlFor` attribute.
