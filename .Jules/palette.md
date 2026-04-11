## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-04-09 - Accessible Form Error Handling in React
**Learning:** Dynamic error messages in forms built with React (or animation libraries like Framer Motion) are not automatically announced by screen readers when they appear on the screen.
**Action:** Always add `role="alert"` and `aria-live="assertive"` to dynamic error message containers so that screen readers can prioritize and announce the error immediately when it renders.
