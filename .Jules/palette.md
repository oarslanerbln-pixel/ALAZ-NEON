## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2024-05-15 - ARIA attributes for Custom Form Elements
**Learning:** Custom UI toggle buttons (like Rounds and Preset selectors) and loading submit buttons were visually distinct but functionally invisible to screen readers without the correct ARIA attributes. Providing `id` and `htmlFor` makes inputs easier to identify while `aria-pressed` clarifies toggle state dynamically.
**Action:** Always link `<label>` and inputs, and use `aria-pressed` for visual toggle lists to communicate their active states properly.
