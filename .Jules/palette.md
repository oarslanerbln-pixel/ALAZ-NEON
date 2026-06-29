## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-06-29 - Enhance UploadDocument a11y
**Learning:** In the MediSade high-contrast dark theme, standard focus states are often invisible. Always explicitly define high-contrast focus rings for interactive elements. Dynamically rendered non-urgent content updates require `role="status"` and `aria-live="polite"` to ensure screen readers announce them.
**Action:** Applied `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none` and `disabled:cursor-not-allowed` to buttons and added `role="status" aria-live="polite"` to the dynamically rendered result container.
