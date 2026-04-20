## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2024-04-20 - [ARIA linking forms]
**Learning:** For accessible forms inside React components, simply adding `id` to the `<input>` and linking it to the adjacent `<label>` using `htmlFor` significantly improves keyboard navigation flow. It's also important to dynamically apply `aria-invalid` to standard fields based on global form state.
**Action:** Automatically verify that standard textual `<label>` tags adjacent to `<input>` tags carry `htmlFor` properties mirroring their ids and use `role="alert"` for custom error components.
