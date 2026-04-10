## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2024-04-10 - Form Labels and Toggle Buttons Accessibility
**Learning:** React fragments and map functions often miss proper `id` to `htmlFor` bindings in dynamically generated inputs (e.g., categories mapping in PlayerGame.tsx). Also, visual state classes for toggle buttons (like "Hızlı Preset" buttons) do not convey state to screen readers.
**Action:** Always ensure dynamic loops generating inputs include unique `id`s tied to their labels, and use `aria-pressed={boolean}` on elements acting as toggle buttons.
