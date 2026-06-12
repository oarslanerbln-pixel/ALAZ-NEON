## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-06-12 - High-Contrast Focus Rings
**Learning:** In high-contrast dark themes (like bg-gray-800), standard browser focus states are invisible. Explicit high-contrast focus rings (e.g., yellow-400) are required for keyboard accessibility.
**Action:** Always add focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none to interactive elements.
