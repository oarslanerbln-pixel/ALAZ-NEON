## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-06-24 - Interactive Element Accessibility in Dark Theme
**Learning:** In the MediSade high-contrast dark theme, standard browser focus outlines are invisible. Interactive elements (Links and buttons) require explicit visible focus states, and disabled buttons benefit from `cursor-not-allowed`.
**Action:** Always define high-contrast focus rings (e.g., `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) for interactive elements, and pair `disabled:opacity-50` with `disabled:cursor-not-allowed`.
