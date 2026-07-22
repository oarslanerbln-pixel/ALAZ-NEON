## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-07-22 - Enhance High Contrast Focus & A11y States
**Learning:** In Next.js App Router, footers need explicit 'text-base' for WCAG 2.1 AA (16px minimum), interactive elements need 'focus-visible' rings for high contrast, and dynamic results should use 'aria-live="polite"'.
**Action:** Apply 'text-base', 'disabled:cursor-not-allowed', 'focus-visible:ring-4 focus-visible:ring-yellow-400', and 'role="status" aria-live="polite"' on dynamic containers.
