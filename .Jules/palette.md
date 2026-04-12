## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2024-04-12 - Missing Semantic Accessibility Attributes in Custom UI
**Learning:** Custom styled forms (e.g., custom inputs with wrapping divs) and toggle buttons (e.g., preset selectors acting as radio buttons) often drop crucial semantic accessibility attributes like `aria-pressed`, `htmlFor`, and `id` during initial implementation.
**Action:** Always verify that interactive elements, especially custom toggles or inputs with detached labels, explicitly declare their state and associations via ARIA attributes.
