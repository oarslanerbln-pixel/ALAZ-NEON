## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-05-01 - Semantic Form Elements
**Learning:** Custom toggle groups (e.g., buttons functioning as radio inputs or tabs) and form inputs frequently lack semantic linkages in this codebase, which severely impacts screen reader navigation.
**Action:** Always link labels to inputs with `htmlFor` and `id`. Group custom toggle buttons using `role="group"` with `aria-labelledby` and ensure stateful buttons implement the `aria-pressed` attribute.
